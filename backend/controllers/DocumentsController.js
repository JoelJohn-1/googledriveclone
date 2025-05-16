const Document = require('../models/Documents');

async function createDocument(req, res) {
    const { email, title } = req.body;
    if (!email || !title) {
        return res.status(400).json({ message: 'Missing parameters' });
    }


}




module.exports = {
    createDocument
}