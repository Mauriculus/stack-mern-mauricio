const rateLimit = require('express-rate-limit');

// Ações de escrita (comentar, avaliar, criar, seguir, denunciar) — limite
// generoso o bastante pro uso normal, mas barra automação/spam
const writeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 30,
  message: { mensagem: 'Muitas ações em pouco tempo, aguarde um pouco antes de tentar novamente.' }
});

// Busca com $text é mais cara pro banco que uma leitura simples
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 60,
  message: { mensagem: 'Muitas pesquisas em pouco tempo, aguarde um instante.' }
});

module.exports = { writeLimiter, searchLimiter };