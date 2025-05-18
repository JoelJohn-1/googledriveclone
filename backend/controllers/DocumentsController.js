const Document = require('../models/Documents');
const { UserDocuments } = require('../models');
const config = require('../config/config.json');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const client = new S3Client({ region: config.aws.aws_region });

const { v4 } = require('uuid');
const { mongo } = require('mongoose');

async function deleteS3Object(key) {
    const deleteCommand = new DeleteObjectCommand({
        Bucket: config.aws.bucket_name,
        Key: key
    });
    await client.send(deleteCommand);
}

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
    // Create new document in s3
    try {
        const putObjectParams = {
            Bucket: config.aws.bucket_name,
            Key: key,
            Body: '',
            ContentType: 'text/plain'
        };
        const createNewDocCommand = new PutObjectCommand(putObjectParams);
        s3Response = await client.send(createNewDocCommand);

        const newDoc = new Document({
            title: title,
            s3FileLink: key,
            ownerId: userId
        });
        mongoResponse = await newDoc.save();

        const documentId = mongoResponse._id.toString();
        await UserDocuments.create({ userId, documentId });
        return res.status(200).json({ message: "Document created" });
    } catch (error) {
        console.error(error);
        if (s3Response) {
            try {
                await deleteS3Object(key);
            } catch (error) {
                console.error(error);
            }
        }
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

module.exports = {
    createDocument
}