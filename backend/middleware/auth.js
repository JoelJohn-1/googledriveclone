const jwt = require('jsonwebtoken');
const config = require('../config/config.json');

async function authenticateUser(req, res, next) {
  let token;
  try {
    // Check if websocket connection
    if (req.headers.upgrade?.toLowerCase() === 'websocket') {
      token = req.query.token;
    } else { // Normal request
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      token = authHeader.split(' ')[1];

    }
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
