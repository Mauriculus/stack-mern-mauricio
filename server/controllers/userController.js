const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const User = require('../models/User');
const { sendVerificationEmail } = require('../services/emailService');


const createAuthToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado no servidor');
  }

  return jwt.sign({ userId: user._id, type: user.type }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });
};

const createVerificationToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado no servidor');
  }

  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas de login
  message: { mensagem: 'Muitas tentativas de login, tente novamente após 15 minutos.' }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora (cadastro a gente deixa mais restrito)
  max: 3, // 3 tentativas de cadastro
  message: { mensagem: 'Muitas tentativas de registro, tente novamente após 1 hora.' }
});


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

    const senhaSalva = usuario.password;

    if (!senhaSalva) {
      return res.status(500).json({ mensagem: 'Usuário encontrado sem senha cadastrada' });
    }

    if (!usuario.isVerified) {
      return res.status(400).json({ mensagem: 'Conta não verificada. Verifique seu email para ativar a conta' });
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


const registerUser = async (req, res) => {
  const { username, email, password, type } = req.body;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

  const normalizeUsername = (value) =>
    value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const preparedUsername = typeof username === 'string' ? username.trim() : '';
  const emailNormalized = typeof email === 'string' ? email.trim().toLowerCase() : email;

  if (!preparedUsername) {
    return res.status(400).json({ mensagem: 'Username é obrigatório' });
  }

  if (/\s/.test(preparedUsername)) {
    return res.status(400).json({ mensagem: 'O username não pode conter espaços no meio' });
  }

  if (preparedUsername.length > 30) {
    return res.status(400).json({ mensagem: "Seu nome de usuário deve ter no máximo 30 caracteres"})
  }

  if (!emailNormalized) {
    return res.status(400).json({ mensagem: 'Email é obrigatório' });
  }

  if (!password) {
    return res.status(400).json({ mensagem: 'Senha é obrigatória' });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({ mensagem: 'A senha deve conter pelo menos 6 caracteres, incluindo letras maiúsculas, minúsculas e números' });
  }

  try {
    const emailExistente = await User.findOne({ email: emailNormalized });

    const usernameNormalized = normalizeUsername(preparedUsername);

    const usernameExistente = await User.findOne({ usernameNormalized: usernameNormalized });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let usuarioSalvo;

    if (emailExistente) {
      if (emailExistente.isVerified) {
        return res.status(400).json({ mensagem: 'Email já cadastrado' });
      }

      emailExistente.username = preparedUsername;
      emailExistente.usernameNormalized = usernameNormalized;
      emailExistente.password = passwordHash;

      usuarioSalvo = emailExistente;
      await emailExistente.save();
    } else {
      if (usernameExistente && usernameExistente.isVerified) {
        return res.status(400).json({ mensagem: 'Username já cadastrado' });
      }

      const novoUsuario = new User({
        username: preparedUsername,
        usernameNormalized,
        email: emailNormalized,
        password: passwordHash,
        type,
      });

      await novoUsuario.save();

      usuarioSalvo = novoUsuario;   
    }

    const verificationToken = createVerificationToken(usuarioSalvo);

    await sendVerificationEmail(emailNormalized, verificationToken)

    res.status(201).json({ mensagem: 'Usuário registrado com sucesso. Verifique seu email para ativar a conta', verificationToken: verificationToken }); // verificationToken só para testes, retirar depois
  } catch (erro) {
    console.error('Erro no cadastro:', erro);
    if (erro.name === 'ValidationError') {
      return res.status(400).json({ mensagem: erro.message });
    }
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};


const verifyEmail = async (req, res) => {
  const { verificationToken } = req.body; // mudar depois para pegar o token automaticamente

  if (!verificationToken) {
    return res.status(400).json({ mensagem: 'Link de verificação inválido' });
  }

  try {
    const decoded = jwt.verify(verificationToken, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    if (user.isVerified) {
      return res.status(400).json({ mensagem: 'Conta já verificada' });
    }

    user.isVerified = true;
    await user.save();

    const token = createAuthToken(user);
    return res.json({ mensagem: 'Email verificado com sucesso', token });

  } catch (erro) {
    console.error('Erro na verificação de email:', erro);
    if (erro.name === 'TokenExpiredError') {
      return res.status(400).json({ mensagem: 'Link de verificação expirado, faça o cadastro novamente' });
    }
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
}



module.exports = {
  loginUser,
  registerUser,
  verifyEmail,
  loginLimiter,
  registerLimiter
};
