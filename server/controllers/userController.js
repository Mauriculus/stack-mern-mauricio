const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config');

// Realizar login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await User.findOne({ email });

    if (!usuario) {
      return res.status(400).json({ mensagem: 'Usuário não encontrado' });
    }

    const senhaValida = await bcrypt.compare(password, usuario.password);

    if (!senhaValida) {
      return res.status(400).json({ mensagem: 'Senha inválida' });
    }

    const token = jwt.sign(
      { userId: usuario._id, type: usuario.type },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ mensagem: 'Login bem-sucedido', token });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

//Realizar registro
const registerUser = async (req, res) => {
  const { username, email, password, type } = req.body;

  try {
    const userExistente = await User.findOne({ email });

    if (userExistente) {
      return res.status(400).json({ mensagem: 'Usuário já cadastrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const novoUsuario = new User({
      username,
      email,
      password: passwordHash,
      type,
    });

    await novoUsuario.save();

    const token = jwt.sign(
      { userId: novoUsuario._id, type: novoUsuario.type },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso', token });
    
  } catch (erro) {
    console.error(erro);
    if (erro.name === 'ValidationError') {
      return res.status(400).json({ mensagem: erro.message });
    }
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};


module.exports = {
  loginUser,
  registerUser,
};
