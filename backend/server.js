import Express from 'express';
import Mongo from 'mongodb';

// App config
const app = Express();
const userRoutes = require('./routes/UserRoutes').default
app.use('/users', userRoutes);

// Database config
const url = 'mongodb://localhost:27017';
const client = new Mongo.MongoClient(url);
const dbName = 'docs';


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

