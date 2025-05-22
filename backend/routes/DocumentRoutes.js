const Express = require('express');
const { createDocument, deleteDocument, getDocument, getDocuments, handleDocumentSync } = require('../controllers/DocumentsController');
const { authenticateUser } = require('../middleware/auth');


module.exports = (wsInstance) => {
    const router = Express.Router();
    wsInstance.applyTo(router);

    router.use(authenticateUser);
    router.post('/', createDocument);
    router.delete('/:documentid', deleteDocument);
    router.get('/:documentid', getDocument);
    router.get('/', getDocuments);
    router.ws('/:documentid', handleDocumentSync)
    return router;
}
