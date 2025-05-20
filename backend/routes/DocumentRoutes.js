const Express = require('express');
const { createDocument, deleteDocument, getDocument, getDocuments } = require('../controllers/DocumentsController');
const { authenticateUser } = require('../middleware/auth');
const router = Express.Router();  

router.use(authenticateUser);
router.post('/', createDocument);  
router.delete('/:documentid', deleteDocument);
router.get('/:documentid', getDocument)
router.get('/', getDocuments)

module.exports = router;