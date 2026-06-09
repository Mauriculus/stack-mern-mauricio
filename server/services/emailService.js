const nodemailer = require('nodemailer');

const hasSmtpConfig = Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

// Em desenvolvimento, evita tentar conectar em localhost:587 quando o SMTP não foi configurado.
const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : nodemailer.createTransport({
      jsonTransport: true,
    });

// Criamos uma função específica para o e-mail de verificação
const sendVerificationEmail = async (toEmail, verificationToken) => {
  const verifyLink = `http://localhost:${process.env.PORT}/verify-email?verificationToken=${verificationToken}`;

  const mailOptions = {
    from: '"Sobrevivência Doméstica" <nao-responda@sobrevivenciadomestica.com>',
    to: toEmail,
    subject: 'Verifique sua conta',
    html: `
      <h2>Bem-vindo ao Sobrevivência Doméstica!</h2>
      <p>Clique no link abaixo para ativar sua conta:</p>
      <a href="${verifyLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Ativar Minha Conta</a>
    `,
  };

  if (!hasSmtpConfig) {
    console.warn('SMTP não configurado. Email de verificação não será enviado de verdade em ambiente local.');
  }

  return await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (toEmail, resetToken) => {
  const resetLink = `http://localhost:${process.env.PORT}/reset-password?resetToken=${resetToken}`;
  
  const mailOptions = {
    from: '"Sobrevivência Doméstica" <nao-responda@sobrevivenciadomestica.com>',
    to: toEmail,
    subject: 'Redefinir Senha',
    html: `
      <h2>Redefinir Senha</h2>
      <p>Clique no link abaixo para redefinir sua senha:</p>
      <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Redefinir Senha</a>
    `,
  };

  if (!hasSmtpConfig) {
    console.warn('SMTP não configurado. Email de redefinição de senha não será enviado de verdade em ambiente local.');
  }

  return await transporter.sendMail(mailOptions);
};

// Exporte a função para usar no controlador
module.exports = { 
  sendVerificationEmail,
  sendPasswordResetEmail
};