const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

router.post('/register', async (req, res) => {
  const { name, email, password, city } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  const hashed = await bcrypt.hash(password, 10);
  const id = uuidv4();
  const stmt = db.prepare('INSERT INTO users (id, name, email, password, city) VALUES (?, ?, ?, ?, ?)');
  stmt.run(id, name, email, hashed, city || null, function (err) {
    if (err) return res.status(500).json({ error: 'Email already in use or DB error' });
    const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id, name, email, city } });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, city: user.city, photo_path: user.photo_path } });
  });
});

module.exports = router;
