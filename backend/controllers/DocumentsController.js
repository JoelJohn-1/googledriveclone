const { S3Client, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const Delta = require('quill-delta');
const sequelize = require('sequelize');
const { Upload } = require('@aws-sdk/lib-storage');
const Document = require('../models/Documents');
const { UserDocuments } = require('../models');
const config = require('../config/config.json');
const client = new S3Client({ region: config.aws.aws_region });
const { v4 } = require('uuid');
const jwt = require('jsonwebtoken');


async function deleteS3Object(key) {
    const deleteCommand = new DeleteObjectCommand({
        Bucket: config.aws.bucket_name,
        Key: key
    });
    await client.send(deleteCommand);
}
async function streamToString(stream) {
    let data = '';
    for await (const chunk of stream) {
        data += chunk.toString('utf-8');
    }
    return data;
}

async function getS3Object(key) {
    const getCommand = new GetObjectCommand({
        Bucket: config.aws.bucket_name,
        Key: key
    })
    const s3Object = await client.send(getCommand);
    return s3Object;
}

async function putS3Object(key, content) {
    const upload = new Upload({
        client: client,
        params: {
            Bucket: config.aws.bucket_name,
            Key: key,
            Body: content,
            ContentType: 'text/plain'
        }
    });
    const s3Response = await upload.done();
    return s3Response;
}
async function getUserPermissionsToDocument(userId, documentId) {
    const documentAccess = await UserDocuments.findOne({
        where: {
            userId: userId,
            documentId: documentId
        },
        attributes: ['permissionLevel']
    })
    if (!documentAccess) return undefined;
    return documentAccess.dataValues.permissionLevel;
}

function applyDeltaToString(base, delta) {
    const deltaOps = delta.ops;
    let result = '';
    let index = 0;

    for (let op of deltaOps) {
        if (op.retain !== undefined) {
            result += base.slice(index, index + op.retain);
            index += op.retain;
        }
        if (op.insert !== undefined) {
            result += op.insert;
        }
        if (op.delete !== undefined) {
            index += op.delete;
        }
    }

    // Append any remaining text from the base
    result += base.slice(index);
    return result;
}

async function applyDeltaToDocument(key, delta) {
    // need to refactor in futute to store deltas and not text in s3
    try {
        const document = await getS3Object(key);
        let content = await streamToString(document.Body);
        content = applyDeltaToString(content, new Delta(delta));
        await putS3Object(key, content);
        return { status: 200 };
    } catch (error) {
        console.error(error);
        return { status: 500 };
    }
}
/*
    createDocument: [/documents]: creates empty document connected to user
    Required Args: Req Body must contain title
    Connections: AWS, Mongo, SQL
*/
async function createDocument(req, res) {
    let s3Response;
    let mongoResponse;
    try {
        let { title } = req.body;
        const userId = req.user.id;
        const fileId = v4();
        const key = `${userId}/${fileId}_${title}`;


        s3Response = putS3Object(key, '');

        // Creates mongo mapping to s3 document
        const newDoc = new Document({
            title: title,
            s3FileLink: key,
            ownerId: userId
        });
        mongoResponse = await newDoc.save();
        const documentId = mongoResponse._id.toString();

        // Creates UserDocuments mapping to mongo document
        await UserDocuments.create({ userId, documentId, permissionLevel: 'owner' });
        return res.status(200).json({ message: "Document created" });
    } catch (error) {
        console.error(error);
        // Roll back s3 creation
        if (s3Response) {
            try {
                await deleteS3Object(key);
            } catch (error) {
                console.error(error);
            }
        }

        // Roll back mongo creation
        if (mongoResponse) {
            try {
                await Document.deleteOne({ _id: mongoResponse._id })
            } catch (error) {
                console.error(error);
            }
        }

        return res.status(500).json({ message: "Internal server error" });
    }
}

/*
    deleteDocument: [/documents/:documentid]: deletes a document connected to user
    Connections: AWS, Mongo, SQL
*/
async function deleteDocument(req, res) {
    try {
        const documentId = req.params.documentid;
        if (!documentId) {
            return res.status(400).json({ message: 'Missing parameters' });
        }
        const userId = req.user.id;
        const permissionLevel = await getUserPermissionsToDocument(userId, documentId);
        if (permissionLevel != 'owner') {
            return res.status(403).json({ message: 'Access denied' });
        }
        let mongoResponse;
        // Find mongo document tied to documentid
        mongoResponse = await Document.findOne({ _id: documentId });

        // Delete s3 object, Mongo document, and UserDocuments mapping
        await deleteS3Object(mongoResponse.s3FileLink);
        await Document.deleteOne({ _id: documentId })
        await UserDocuments.destroy({
            where: {
                userId: userId,
                documentId: documentId
            }
        });

        return res.status(200).json({ message: "Ok" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

/*
    getDocument: [/documents/:documentid]: returns text for a specific document
    Connections: AWS, Mongo, SQL
*/
async function getDocument(req, res) {
    try {
        const documentId = req.params.documentid;
        if (!documentId) {
            return res.status(400).json({ message: 'Missing parameters' });
        }
        const userId = req.user.id;
        const permissionLevel = await getUserPermissionsToDocument(userId, documentId);
        if (!permissionLevel) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const metaData = await Document.findById(documentId);
        const key = metaData.s3FileLink;
        const document = await getS3Object(key);
        const content = await streamToString(document.Body);

        const payload = {
            "Permissions": permissionLevel,
            "Content": content
        }
        return res.status(200).json(payload);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }

}

/*
    getDocument: [/documents/]: returns meta data for paginated documents connected to a user
    Required Args: Req Body must contain user and title
    Connections: Mongo, SQL
*/
async function getDocuments(req, res) {
    try {
        const page = parseInt(req.query.page || "0", 10);
        const limit = parseInt(req.query.limit || "5", 10);
        if (limit > 10) {
            return res.status(403).json({ message: "Requested too many pages, please decrease limit" });

        }
        const userId = req.user.id;

        const { count, rows } = await UserDocuments.findAndCountAll({
            where: {
                userId: userId
            },
            order: sequelize.col('updatedAt'),
            offset: page * limit,
            limit: limit,
            attributes: ['documentId']
        });
        const documentIds = rows.map(row => row.documentId);
        const documents = await Document.find({
            _id: { $in: documentIds }
        }).select('title ownerId updatedAt');
        const payload = {
            "Total": count,
            "Documents": documents
        }
        return res.status(200).json(payload);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }


}

/*
    handleDocumentConnection: [/documents/]: established websocket connection for a particular document, handles sync data
    Required Args: Req Body must contain user and title
    Connections: AWS, Mongo, SQL
*/
async function handleDocumentConnection(ws, req) {
    // Verify user has access to doucment on initial connection
    try {
        const decoded = jwt.verify(req.query.token, config.jwt);
        ws.userId = decoded.id;
        const documentId = req.query.documentId;
        const permissionLevel = await getUserPermissionsToDocument(ws.userId, documentId);
        if (permissionLevel != 'owner' && permissionLevel != 'write') {
            ws.close(1008, 'Access denied: invalid token or no permission to document');
        }
        const metaData = await Document.findById(documentId);
        ws.key = metaData.s3FileLink;
        ws.messageCount = 1;
    } catch (error) {
        console.error(error);
        ws.close(1011, 'Internal server error');
    }

    ws.on('message', async (msg) => {
        try {
            ws.messageCount += 1;
            console.log(ws.messageCount);
            const { type, delta } = JSON.parse(msg);
            if (type == "Update") {
                const result = await applyDeltaToDocument(ws.key, delta);
                if (result.status != 200) {
                    ws.close(1011, 'Error in syncing document, please check with servers to figure out why');
                }
            }
        } catch (error) {
            console.error(error);
            ws.close(1011, 'Internal server error');
        }
    });

    ws.on('close', (code, reason) => {
        console.log(`WebSocket closed. Code: ${code}, Reason: ${reason}`);
    });

    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
    });
}
module.exports = {
    createDocument,
    deleteDocument,
    getDocument,
    getDocuments,
    handleDocumentConnection
}