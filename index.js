require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const donationRoutes = require('./routes/donations');

const UPLOADS_DIR = process.env.UPLOADS_DIR || './uploads';
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json());
// Configurar pasta de uploads para servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, UPLOADS_DIR)));

// Rota para servir imagens de doações
app.get('/donation-images/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, UPLOADS_DIR, filename);
  
  // Verificar se o arquivo existe
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).json({ error: 'Imagem não encontrada' });
  }
});
// Serve frontend static files from /public at the root so GET / works
app.use(express.static(path.join(__dirname, 'public')));

// Fallback for single-page requests to root
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/', authRoutes);
app.use('/', profileRoutes);
app.use('/', donationRoutes);

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

server.on('error', (err) => {
	if (err && err.code === 'EADDRINUSE') {
		console.error(`Port ${PORT} já está em uso. Use outra porta (ex: set PORT=5000) ou encerre o processo que está usando a porta.`);
		process.exit(1);
	} else {
		console.error('Server error:', err);
		process.exit(1);
	}
});
