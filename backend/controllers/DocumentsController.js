const Document = require('../models/Documents');
const { UserDocuments } = require('../models');
const config = require('../config/config.json');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const client = new S3Client({ region: config.aws.aws_region });

const { v4 } = require('uuid');

/*
    description: deletes s3 object
    Required Args: key for object
    Connections: AWS
*/
async function deleteS3Object(key) {
    const deleteCommand = new DeleteObjectCommand({
        Bucket: config.aws.bucket_name,
        Key: key
    });
    await client.send(deleteCommand);
}

/*
    createDocument: [/documents/create]: creates empty document connected to user
    Required Args: Req Body must contain email and title
    Connections: AWS, Mongo, SQL
*/
async function createDocument(req, res) {
    const { email, title } = req.body;
    if (!email || !title) {
        return res.status(400).json({ message: 'Missing parameters' });
    }
    const userId = req.user.id;
    const fileId = v4();
    const key = `${userId}/${fileId}_${title}`;

    let s3Response;
    let mongoResponse;
    try {
        // Create empty document in s3
        const putObjectParams = {
            Bucket: config.aws.bucket_name,
            Key: key,
            Body: '',
            ContentType: 'text/plain'
        };
        const createNewDocCommand = new PutObjectCommand(putObjectParams);
        s3Response = await client.send(createNewDocCommand);

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
    deleteDocument: [/documents/delete]: deletes a document connected to user
    Required Args: Req Body must contain user and documentid
    Connections: AWS, Mongo, SQL
*/
async function deleteDocument(req, res) {
    const { email, documentId } = req.body;
    if (!email || !documentId) {
        return res.status(400).json({ message: 'Missing parameters' });
    }
    const userId = req.user.id;

    let mongoResponse;
    try {
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

module.exports = {
    createDocument,
    deleteDocument
}