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

// Cores da marca. Clientes de email não suportam variáveis CSS nem a
// maioria das fontes customizadas, então tudo aqui vai inline e com
// fallback de fonte do sistema — é o que sobrevive no Gmail/Outlook.
const BRAND = {
  navy: '#161E6B',
  navyDeep: '#0D1246',
  offWhite: '#F0F0F0',
  amber: '#E8A33D',
  ink: '#14162B',
  inkSoft: '#5B5F77',
};

/**
 * Monta o HTML base do email (cabeçalho com a marca + rodapé).
 * `preheaderText` é o resuminho que aparece na lista de emails antes de abrir.
 */
const renderEmailShell = ({ preheaderText, bodyHtml }) => `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sobrevivência Doméstica</title>
  </head>
  <body style="margin:0; padding:0; background-color:${BRAND.offWhite}; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
      ${preheaderText}
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.offWhite}; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:100%; max-width:480px; background-color:#FFFFFF; border-radius:8px; overflow:hidden;">

            <!-- Cabeçalho -->
            <tr>
              <td style="background-color:${BRAND.navy}; padding:28px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background-color:${BRAND.amber}; color:${BRAND.navy}; font-size:18px; font-weight:700; width:40px; height:40px; text-align:center; vertical-align:middle; border-radius:4px;">
                      SD
                    </td>
                    <td style="padding-left:12px; color:${BRAND.offWhite}; font-size:16px; font-weight:600;">
                      Sobrevivência Doméstica
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Corpo -->
            <tr>
              <td style="padding:36px 32px; color:${BRAND.ink};">
                ${bodyHtml}
              </td>
            </tr>

            <!-- Rodapé -->
            <tr>
              <td style="padding:20px 32px 28px; border-top:1px solid #E4E4EC;">
                <p style="margin:0; font-size:12px; line-height:1.6; color:${BRAND.inkSoft};">
                  Você recebeu este email porque este endereço foi usado para criar uma conta no
                  Sobrevivência Doméstica. Se não foi você, pode ignorar esta mensagem com
                  segurança.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const renderButton = (href, label) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
    <tr>
      <td style="border-radius:4px; background-color:${BRAND.navy};">
        <a
          href="${href}"
          target="_blank"
          style="display:inline-block; padding:13px 26px; font-size:14px; font-weight:600; color:${BRAND.offWhite}; text-decoration:none; border-radius:4px;"
        >
          ${label}
        </a>
      </td>
    </tr>
  </table>
`;

const sendVerificationEmail = async (toEmail, verificationToken) => {
  const verifyLink = `http://localhost:3000/verify-email?verificationToken=${verificationToken}`; // link do front end que depois vai ter o token extraido pelo back

  const bodyHtml = `
    <h1 style="margin:0 0 12px; font-size:20px; font-weight:700; color:${BRAND.navy};">
      Bem-vindo(a)!
    </h1>
    <p style="margin:0 0 4px; font-size:14px; line-height:1.6; color:${BRAND.ink};">
      Falta só confirmar seu email pra sua conta ficar pronta.
    </p>
    <p style="margin:0; font-size:14px; line-height:1.6; color:${BRAND.inkSoft};">
      Clique no botão abaixo para ativar sua conta e começar a aprender e compartilhar aulas
      de autonomia doméstica.
    </p>

    ${renderButton(verifyLink, 'Ativar minha conta')}

    <p style="margin:0 0 4px; font-size:12px; line-height:1.6; color:${BRAND.inkSoft};">
      Esse link expira em 24 horas. Se ele não funcionar, copie e cole este endereço no
      navegador:
    </p>
    <p style="margin:0; font-size:12px; line-height:1.5; word-break:break-all; color:${BRAND.navy};">
      ${verifyLink}
    </p>
  `;

  const mailOptions = {
    from: '"Sobrevivência Doméstica" <nao-responda@sobrevivenciadomestica.com>',
    to: toEmail,
    subject: 'Confirme seu email — Sobrevivência Doméstica',
    html: renderEmailShell({
      preheaderText: 'Confirme seu email para ativar sua conta no Sobrevivência Doméstica.',
      bodyHtml,
    }),
  };

  if (!hasSmtpConfig) {
    console.warn('SMTP não configurado. Email de verificação não será enviado de verdade em ambiente local.');
  }

  return await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (toEmail, resetToken) => {
  const resetLink = `http://localhost:3000/reset-password?resetToken=${resetToken}`; // link do front end

  const bodyHtml = `
    <h1 style="margin:0 0 12px; font-size:20px; font-weight:700; color:${BRAND.navy};">
      Redefinir senha
    </h1>
    <p style="margin:0; font-size:14px; line-height:1.6; color:${BRAND.inkSoft};">
      Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para
      escolher uma senha nova.
    </p>

    ${renderButton(resetLink, 'Redefinir minha senha')}

    <p style="margin:0 0 4px; font-size:12px; line-height:1.6; color:${BRAND.inkSoft};">
      Esse link expira em 15 minutos. Se você não pediu isso, pode ignorar este email — sua
      senha continua a mesma. Se o botão não funcionar, copie e cole este endereço no
      navegador:
    </p>
    <p style="margin:0; font-size:12px; line-height:1.5; word-break:break-all; color:${BRAND.navy};">
      ${resetLink}
    </p>
  `;

  const mailOptions = {
    from: '"Sobrevivência Doméstica" <nao-responda@sobrevivenciadomestica.com>',
    to: toEmail,
    subject: 'Redefinir sua senha — Sobrevivência Doméstica',
    html: renderEmailShell({
      preheaderText: 'Redefina sua senha no Sobrevivência Doméstica.',
      bodyHtml,
    }),
  };

  if (!hasSmtpConfig) {
    console.warn('SMTP não configurado. Email de redefinição de senha não será enviado de verdade em ambiente local.');
  }

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};