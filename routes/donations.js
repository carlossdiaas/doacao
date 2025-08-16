const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const UPLOADS_DIR = process.env.UPLOADS_DIR || './uploads';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Garantir que a pasta existe
    const fs = require('fs');
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Criar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'donation_' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Verificar se é uma imagem
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'), false);
    }
  }
});

// List donations (available)
router.get('/donations', (req, res) => {
  const sql = `SELECT d.*, u.name as owner_name, u.city as owner_city FROM donations d JOIN users u ON d.user_id = u.id`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ donations: rows });
  });
});

router.post('/donations', auth, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Arquivo muito grande. Máximo 5MB.' });
      }
      return res.status(400).json({ error: 'Erro no upload do arquivo: ' + err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    // Se chegou aqui, o upload foi bem-sucedido
    try {
      const { title, description, city } = req.body;
      const image = req.file ? req.file.path : null;
      const id = uuidv4();
      const userId = req.user.id;
      
      console.log('Criando doação:', { title, description, city, image, userId });
      
      db.run('INSERT INTO donations (id, user_id, title, description, image_path, city) VALUES (?, ?, ?, ?, ?, ?)', 
        [id, userId, title, description, image, city], 
        function (err) {
          if (err) {
            console.error('Erro ao inserir doação:', err);
            return res.status(500).json({ error: 'Erro ao salvar doação no banco de dados' });
          }
          
          console.log('Doação criada com sucesso, ID:', id);
          
          db.get('SELECT d.*, u.name as owner_name FROM donations d JOIN users u ON d.user_id = u.id WHERE d.id = ?', [id], (err2, row) => {
            if (err2) {
              console.error('Erro ao buscar doação criada:', err2);
              return res.status(500).json({ error: 'Erro ao buscar doação criada' });
            }
            res.json({ donation: row });
          });
        }
      );
    } catch (error) {
      console.error('Erro geral na criação de doação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });
});

// Claim a donation
router.post('/claim', auth, (req, res) => {
  const { donation_id } = req.body;
  const id = uuidv4();
  const userId = req.user.id;
  // Record claim
  db.run('INSERT INTO claims (id, donation_id, user_id) VALUES (?, ?, ?)', [id, donation_id, userId], function (err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true, claim_id: id });
  });
});

// List claims for a donation (owner sees who claimed)
router.get('/donations/:id/claims', auth, (req, res) => {
  const donationId = req.params.id;
  const sql = `SELECT c.id, c.created_at, u.id as user_id, u.name, u.email, u.city FROM claims c JOIN users u ON c.user_id = u.id WHERE c.donation_id = ?`;
  db.all(sql, [donationId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ claims: rows });
  });
});

// Delete donation (admin only)
router.delete('/donations/:id', (req, res) => {
  const donationId = req.params.id;
  console.log('Tentativa de exclusão da doação:', donationId);
  console.log('Headers:', req.headers);
  
  // Verificar se é admin (token simples)
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer admin-token-')) {
    console.log('Token inválido ou ausente');
    return res.status(401).json({ error: 'Acesso negado. Apenas administradores podem excluir doações.' });
  }
  
  console.log('Token válido, prosseguindo com exclusão...');
  
  // Primeiro, deletar claims relacionados
  db.run('DELETE FROM claims WHERE donation_id = ?', [donationId], function (err) {
    if (err) {
      console.log('Erro ao deletar claims:', err);
      return res.status(500).json({ error: 'Erro ao deletar solicitações' });
    }
    console.log('Claims deletados com sucesso');
    
    // Depois, deletar a doação
    db.run('DELETE FROM donations WHERE id = ?', [donationId], function (err2) {
      if (err2) {
        console.log('Erro ao deletar doação:', err2);
        return res.status(500).json({ error: 'Erro ao deletar doação' });
      }
      
      console.log('Doação deletada, changes:', this.changes);
      
      if (this.changes === 0) {
        console.log('Doação não encontrada');
        return res.status(404).json({ error: 'Doação não encontrada' });
      }
      
      console.log('Exclusão concluída com sucesso');
      res.json({ success: true, message: 'Doação excluída com sucesso' });
    });
  });
});

module.exports = router;
