const nodemailer = require('nodemailer');

// A configuração fica escondida aqui dentro
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
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
  // Retorna a Promise de envio
  return await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (toEmail, resetToken) => {

  
}

// Exporte a função para usar no controlador
module.exports = { 
  sendVerificationEmail 
};