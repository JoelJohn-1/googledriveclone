const Express = require('express');
const { createDocument } = require('../controllers/DocumentsController');
const authenticateUser = require('../middleware/auth');
const router = Express.Router();  

router.use(authenticateUser);
router.post('/create', createDocument);  
  
module.exports = router;