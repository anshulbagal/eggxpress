const express = require('express');
const router = express.Router();

// Simple admin auth (in production, use proper auth with DB)
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'eggxpress123') {
    res.json({ token: 'admin-token-eggxpress', message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

module.exports = router;
