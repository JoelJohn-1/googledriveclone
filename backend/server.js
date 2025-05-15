const Express = require('express');
const Mongo = require('mongodb');
const config = require('./config/config.json');
const userRoutes = require('./routes/UserRoutes');

// App config
const app = Express();
app.use(Express.json());
app.use('/users', userRoutes);

// Database config
const mongoDBIP = config.mongo_db_ip
const url = "mongodb://" + mongoDBIP + ":27017";
const client = new Mongo.MongoClient(url);
const collectionName = 'docs';


async function initializeMongoServer() {
    try {
        await client.connect();
        console.log('Connected successfully to mongo server');
    } catch (error) {
        console.log(error);
    }
}

function initializeExpressServer() {
    app.listen(3001, () => {
        console.log("Express server started up");
    })
}

initializeMongoServer();
initializeExpressServer();

