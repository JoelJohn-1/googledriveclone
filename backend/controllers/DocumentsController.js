const Document = require('../models/Documents');

async function createDocument(req, res) {
    const { email, title } = req.body;
    if (!email || !title) {
        return res.status(400).json({ message: 'Missing parameters' });
    }

    return res.status(200).json({ message: 'Ok' });

}

module.exports = {
    createDocument
}