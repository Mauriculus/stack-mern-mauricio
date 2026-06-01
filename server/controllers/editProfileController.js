const User = require('../models/User');

// Controlador para editar o perfil do usuário
const editProfile = async (req, res) => {
  const userId = req.userId; // Obtido através do authMiddleware
  const { username } = req.body || {};

  if (username) {
    user.username = username;
  }
  // O multer disponibiliza o arquivo em req.file se for enviado
  const profilePicture = req.file ? req.file.filename : undefined;

  try {
    // Busca o usuário pelo ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    // Atualiza o username se fornecido
    if (username) {
      user.username = username;
    }

    // Atualiza a foto de perfil se uma nova for enviada
    if (profilePicture) {
      user.profilePicture = profilePicture;
    }

    // Salva as alterações no banco de dados
    await user.save();

    return res.status(200).json({
      mensagem: 'Perfil atualizado com sucesso',
      user: {
        username: user.username,
        profilePicture: user.profilePicture,
        email: user.email // Opcional: retornar dados atualizados
      }
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
  editProfile
};
