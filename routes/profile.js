const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const UPLOADS_DIR = process.env.UPLOADS_DIR || './uploads';
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
});
const upload = multer({ storage });

router.get('/profile', auth, (req, res) => {
  const userId = req.user.id;
  db.get('SELECT id, name, email, city, phone, bio, profile_photo, created_at FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json({ user: row });
  });
});

router.put('/profile', auth, upload.single('profile_photo'), (req, res) => {
  const userId = req.user.id;
  const { name, email, city, phone, bio } = req.body;
  const profilePhoto = req.file ? req.file.path : null;
  
  // Validar e-mail único (exceto o próprio usuário)
  if (email) {
    db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId], (err, row) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (row) return res.status(400).json({ error: 'E-mail já está em uso' });
      
      // Atualizar perfil
      updateProfile();
    });
  } else {
    updateProfile();
  }
  
  function updateProfile() {
    const updateFields = [];
    const updateValues = [];
    
    if (name) { updateFields.push('name = ?'); updateValues.push(name); }
    if (email) { updateFields.push('email = ?'); updateValues.push(email); }
    if (city) { updateFields.push('city = ?'); updateValues.push(city); }
    if (phone) { updateFields.push('phone = ?'); updateValues.push(phone); }
    if (bio) { updateFields.push('bio = ?'); updateValues.push(bio); }
    if (profilePhoto) { updateFields.push('profile_photo = ?'); updateValues.push(profilePhoto); }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    updateValues.push(userId);
    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    
    db.run(sql, updateValues, function (err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      
      // Retornar dados atualizados
      db.get('SELECT id, name, email, city, phone, bio, profile_photo, created_at FROM users WHERE id = ?', [userId], (err2, row) => {
        if (err2) return res.status(500).json({ error: 'DB error' });
        res.json({ user: row });
      });
    });
  }
});

// Rota para estatísticas do usuário
router.get('/user/stats', auth, (req, res) => {
  const userId = req.user.id;
  
  // Buscar estatísticas do usuário
  db.get(`
    SELECT 
      (SELECT COUNT(*) FROM donations WHERE owner_id = ?) as donations_count,
      (SELECT COUNT(*) FROM claims c 
       JOIN donations d ON c.donation_id = d.id 
       WHERE d.owner_id = ?) as people_helped,
      created_at as member_since
    FROM users WHERE id = ?
  `, [userId, userId, userId], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      donations_count: row.donations_count || 0,
      people_helped: row.people_helped || 0,
      member_since: row.member_since
    });
  });
});

module.exports = router;
