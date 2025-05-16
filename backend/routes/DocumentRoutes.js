const Express = require('express');
const { createDocument } = require('../controllers/DocumentController');
const router = Express.Router();  

// Define a route  
router.post('/create', createDocument);  
  
// export the router module so that server.js file can use it  
module.exports = router;