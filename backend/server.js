const Express = require('express');
const mongoose = require('mongoose');
const config = require('./config/config.json');
const userRoutes = require('./routes/UserRoutes');
const documentRoutes = require('./routes/DocumentRoutes')
// App config
const app = Express();
app.use(Express.json());
app.use('/users', userRoutes);
app.use('/documents', documentRoutes);

// Connect to Mongo
async function initializeMongoServer() {
    // Database config
    const mongoDBIP = config.mongo_db_ip
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

initializeMongoServer();
initializeExpressServer();

