const Express = require('express');
const { login, signup } = require('../controllers/UserController');
const router = Express.Router();  

// Define a route  
router.post('/signup', signup);  
  
// Define a route  
router.post('/login', login);  

// export the router module so that server.js file can use it  
module.exports = router;