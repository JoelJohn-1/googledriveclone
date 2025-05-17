const jwt = require('jsonwebtoken'); 
const config = require('../config/config.json');

async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt);
    req.user = decoded;
    next();
  } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = {
    authenticateUser
}
