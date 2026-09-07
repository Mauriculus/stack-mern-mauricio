const jwt = require('jsonwebtoken');

// Mesmo que authMiddleware, mas nunca bloqueia a requisição — usado em
// rotas públicas que se comportam diferente pra quem está logado (ex:
// mostrar conteúdo privado pro dono, ou os botões de dono), sem exigir
// login pra ver o conteúdo público.
const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userType = decoded.type;
  } catch (error) {
    // token presente mas inválido/expirado — segue como se não tivesse
    // token nenhum, em vez de travar a requisição
  }

  next();
};

module.exports = optionalAuthMiddleware;