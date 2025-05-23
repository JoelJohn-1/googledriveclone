const Express = require('express');
const expressWs = require('express-ws');

const cors = require('cors'); 
const mongoose = require('mongoose');
const config = require('./config/config.json');
const userRoutes = require('./routes/UserRoutes');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
// App config
const app = Express();
const wsInstance = require('express-ws')(app);
const documentRoutes = require('./routes/DocumentRoutes')(wsInstance);

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(Express.json());
app.use('/auth', userRoutes);
app.use('/documents', documentRoutes);

// Retreive the IAM credentials to access the s3 bucket policy for API requests
async function retreiveS3Credentials() {
    const secret_name = config.aws.backend_secret_identifer;
    const client = new SecretsManagerClient({
        region: config.aws.aws_region,
    });
    let response;
    try {
    response = await client.send(
        new GetSecretValueCommand({
        SecretId: secret_name,
        })
    );
    } catch (error) {
        console.error(error);
    }
    const secret = JSON.parse(response.SecretString);
    config.aws.accesKeyId = secret.access_key_id;
    config.aws.secretAccessKey = secret.secret_access_key;
    console.log("Successfully retreived IAM identity for s3 access.")
}
// Connect to Mongo
async function initializeMongoServer() {
    // Database config
    const mongoDBIP = config.mongo.mongo_db_ip
    const url = "mongodb://" + mongoDBIP + ":27017";

    try {
        await mongoose.connect(url);
        console.log('Connected successfully to mongo server');
    } catch (error) {
        console.log(error);
    }
}

// Start server
function initializeExpressServer() {
    app.listen(3001, () => {
        console.log("Express server started up");
    })
}

retreiveS3Credentials();
initializeMongoServer();
initializeExpressServer();

