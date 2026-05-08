const axios = require('axios');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token missing' });
  }

  const token = authHeader.split(' ')[1];

  // If using a mock token for testing, bypass external validation
  if (token.endsWith('.mockToken')) {
    try {
      // Decode the payload from the mock token
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      req.user = payload; // Attach user data ({ user_id, role }) to the request
      return next();
    } catch (err) {
      // Handle cases where the mock token is malformed
      return res.status(401).json({ error: 'Invalid mock token format' });
    }
  }

  try {
    const response = await axios.post(
      `${process.env.AUTH_SERVICE_URL}/auth/validate`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    req.user = response.data; // { user_id, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
