const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { JWT_SECRET } = require('../config');

const createAuthToken = (user) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado no servidor');
  }

  return jwt.sign(
    { userId: user._id, type: user.type, tipo: user.type },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
};

// Realizar login
const loginUser = async (req, res) => {
  const { email, password } = req.body || {};
  const emailNormalizado = typeof email === 'string' ? email.trim().toLowerCase() : email;

  if (!emailNormalizado || !password) {
    return res.status(400).json({ mensagem: 'Email e senha são obrigatórios' });
  }

  try {
    const usuario = await User.findOne({ email: emailNormalizado });

    if (!usuario) {
      return res.status(400).json({ mensagem: 'Usuário não encontrado' });
    }

    const senhaSalva = usuario.password || usuario.senha || usuario.passwordHash;

    if (!senhaSalva) {
      return res.status(500).json({ mensagem: 'Usuário encontrado sem senha cadastrada' });
    }

    const senhaValida = await bcrypt.compare(password, senhaSalva);

    if (!senhaValida) {
      return res.status(400).json({ mensagem: 'Senha inválida' });
    }

    const token = createAuthToken(usuario);

    res.json({ mensagem: 'Login bem-sucedido', token });
  } catch (erro) {
    console.error('Erro no login:', erro);
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

    const token = createAuthToken(novoUsuario);

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso', token });
    
  } catch (erro) {
    console.error('Erro no cadastro:', erro);
    if (erro.name === 'ValidationError') {
      return res.status(400).json({ mensagem: erro.message });
    }
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

const followUser = async (req, res) => {
  const followerId = req.userId || (req.user && req.user._id ? req.user._id.toString() : req.params.userId);
  const { followingId } = req.body;

  if (!followingId) {
    return res.status(400).json({ mensagem: 'O ID do usuário a ser seguido é obrigatório' });
  }

  if (!mongoose.Types.ObjectId.isValid(followerId) || !mongoose.Types.ObjectId.isValid(followingId)) {
    return res.status(400).json({ mensagem: 'ID inválido' });
  }

  if (followerId === followingId) {
    return res.status(400).json({ mensagem: 'Não é possível seguir a si mesmo' });
  }

  try {
    // Tenta adicionar ao conjunto apenas se ainda não estiver seguindo
    const addRes = await User.updateOne(
      { _id: followerId, following: { $ne: followingId } },
      { $addToSet: { following: followingId } }
    );
    //modifiedCount é a quantidade de documentos alterados
    const added = (addRes.modifiedCount ?? addRes.nModified ?? 0) > 0;
    if (!added) {
      return res.status(400).json({ mensagem: 'Você já está seguindo este usuário' });
    }

    // Incrementa contador de followers do usuário seguido
    const incRes = await User.updateOne({ _id: followingId }, { $inc: { followers: 1 } });
    const incUpdated = (incRes.modifiedCount ?? incRes.nModified ?? 0) > 0;

    if (!incUpdated) {
      // rollback: remove o following adicionado para evitar dessincronização
      await User.updateOne({ _id: followerId }, { $pull: { following: followingId } });
      return res.status(404).json({ mensagem: 'Usuário a ser seguido não encontrado' });
    }

    return res.json({ mensagem: 'Usuário seguido com sucesso' });
  } catch (erro) {
    console.error('Erro ao seguir usuário:', erro);
    // tenta rollback conservador caso tenha sido adicionado
    try {
      await User.updateOne({ _id: followerId }, { $pull: { following: followingId } });
    } catch (e) {
      console.error('Rollback falhou:', e);
    }
    return res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

module.exports = {
  loginUser,
  registerUser,
  followUser,
};
