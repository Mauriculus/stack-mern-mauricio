const User = require('../models/User');

// Controlador para editar o perfil do usuário

const editUsername = async (req, res) => {
  const userId = req.userId; // Obtido através do authMiddleware
  const { username } = req.body;

  const normalizeUsername = (value) =>
    value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const preparedUsername = typeof username === 'string' ? username.trim() : '';

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    if (!preparedUsername) {
      return res.status(400).json({ mensagem: 'Nenhum nome inserido', nomeAtual: user.username });
    }

    if (/\s/.test(preparedUsername)) {
      return res.status(400).json({ mensagem: 'O username não pode conter espaços no meio', nomeAtual: user.username });
    }

    const usernameNormalized = normalizeUsername(preparedUsername);

    const usenameExistente = await User.findOne({ usernameNormalized: usernameNormalized, _id: { $ne: userId } });

    if (usenameExistente) {
      return res.status(400).json({ mensagem: 'Username já em uso', nomeAtual: user.username });
    }

    user.username = preparedUsername;
    user.usernameNormalized = usernameNormalized;

    await user.save();

    return res.status(200).json({
      mensagem: 'Username atualizado com sucesso',
      user: {
        username: user.username,
        usernameNormalized: user.usernameNormalized,
        profilePicture: user.profilePicture,
        email: user.email, // Opcional: retornar dados atualizados
      },
    });
  } catch (erro) {
    console.error('Erro ao editar username:', erro);
    return res.status(500).json({ mensagem: 'Erro no servidor ao atualizar username' });
  }
};

const editPicture = async (req, res) => {
  const userId = req.userId; // Obtido através do authMiddleware;

  // O multer disponibiliza o arquivo em req.file se for enviado
  const profilePicture = req.file ? req.file.filename : undefined;

  try {
    // Busca o usuário pelo ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    // Atualiza a foto de perfil se uma nova for enviada
    if (!profilePicture) {
      return res.json({ mensagem: 'Nenhuma nova foto enviada, mantendo a atual.' });
    }

    user.profilePicture = profilePicture;

    // Salva as alterações no banco de dados
    await user.save();

    return res.status(200).json({
      mensagem: 'Perfil atualizado com sucesso',
      user: {
        username: user.username,
        profilePicture: user.profilePicture,
        email: user.email, // Opcional: retornar dados atualizados
      },
    });
  } catch (erro) {
    console.error('Erro ao editar perfil:', erro);

    // Tratamento específico para erros de validação do Mongoose
    if (erro.name === 'ValidationError') {
      return res.status(400).json({ mensagem: erro.message });
    }

    return res.status(500).json({ mensagem: 'Erro no servidor ao atualizar perfil' });
  }
};

module.exports = {
  editUsername,
  editPicture,
};
