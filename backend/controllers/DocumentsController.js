const Document = require('../models/Documents');
const config = require('../config/config.json');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const client = new S3Client({ region: config.aws.aws_region });

const { v4 } = require('uuid')

async function createDocument(req, res) {
    const { email, title } = req.body;
    if (!email || !title) {
        return res.status(400).json({ message: 'Missing parameters' });
    }
    const fileId = v4();
    const key = `${req.user.id}/${fileId}_${title}`;

    // Create new document in s3
    try {
        const putObjectParams = {
            Bucket: config.aws.bucket_name,
            Key: key,
            Body: '',
            ContentType: 'text/plain'
        };
        const createNewDocCommand = new PutObjectCommand(putObjectParams);
        await client.send(createNewDocCommand);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }

    // Save reference to document in mongo
    try {
        const newDoc = new Document({
            title: title,
            s3FileLink: key,
            ownerId: req.user.id
        });
        await newDoc.save();
        return res.status(200).json({ message: 'Ok' });
    } catch (error) {
        console.error(error);

        //In case of error, roll back s3 upload
        try {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: config.aws.bucket_name,
                Key: key
            });
            await client.send(deleteCommand);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error, potential sync error with document in s3 but not mongo" });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    createDocument
}