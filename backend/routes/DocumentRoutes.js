const Express = require('express');
const { createDocument, deleteDocument } = require('../controllers/DocumentsController');
const { authenticateUser } = require('../middleware/auth');
const router = Express.Router();  

router.use(authenticateUser);
router.post('/create', createDocument);  
router.delete('/delete', deleteDocument);

module.exports = router;