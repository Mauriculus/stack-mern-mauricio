// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./mongo');

const userRoutes = require('./routes/userRoutes');
const classRoutes = require('./routes/classRoutes');
const playlistRoutes = require('./routes/playlistRoutes')
const adminRoutes = require('./routes/adminRoutes')

const { PORT } = require('./config');
const dns = require('dns');


dns.setServers(['8.8.8.8', '8.8.4.4']);
connectDB();

function sanitizarContraInjecao(obj) {
  if (obj === null || typeof obj !== 'object') return;
  for (const chave of Object.keys(obj)) {
    if (chave.startsWith('$') || chave.includes('.')) {
      delete obj[chave];
      continue;
    }
    sanitizarContraInjecao(obj[chave]);
  }
}

const app = express();

// Servir arquivos estáticos ANTES do Helmet para que o CORP não bloqueie as imagens
// quando o frontend (porta 3000) tenta carregar de porta diferente (7777)
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // desabilitado: o front-end React serve sua própria CSP
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
}));
app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  sanitizarContraInjecao(req.body);
  sanitizarContraInjecao(req.params);
  sanitizarContraInjecao(req.query);
  next();
});

app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/playlists', playlistRoutes)
app.use('/api/admin', adminRoutes)

// manter depois de todas as rotas
app.use((err, req, res, next) => {
  console.error(err);
  const emProducao = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    mensagem: emProducao ? 'Erro no servidor' : (err.message || 'Erro no servidor'),
  });
});

app.listen(PORT, () => console.log(`Servidor rodando na porta http://localhost:${PORT}`));