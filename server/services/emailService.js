const hasBrevoConfig = Boolean(process.env.BREVO_API_KEY);

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

// Envia via API HTTPS do Brevo em vez de SMTP — hosts como Render bloqueiam
// conexão SMTP direta por padrão, mas chamadas de API comuns passam normal
const sendViaBrevo = async ({ to, subject, html }) => {
  if (!hasBrevoConfig) {
    console.warn(`BREVO_API_KEY não configurada. Email para ${to} não será enviado de verdade em ambiente local.`);
    return;
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: 'Sobrevivência Doméstica', email: 'sobrevivencia1domestica@gmail.com' },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const erroTexto = await response.text();
    throw new Error(`Falha ao enviar email via Brevo (${response.status}): ${erroTexto}`);
  }
};

const sendVerificationEmail = async (toEmail, verificationToken) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verifyLink = `${frontendUrl}/verify-email?verificationToken=${verificationToken}`;

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

  return sendViaBrevo({
    to: toEmail,
    subject: 'Confirme seu email — Sobrevivência Doméstica',
    html: renderEmailShell({
      preheaderText: 'Confirme seu email para ativar sua conta no Sobrevivência Doméstica.',
      bodyHtml,
    }),
  });
};

const sendPasswordResetEmail = async (toEmail, resetToken) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = `${frontendUrl}/reset-password?resetToken=${resetToken}`;

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

  return sendViaBrevo({
    to: toEmail,
    subject: 'Redefinir sua senha — Sobrevivência Doméstica',
    html: renderEmailShell({
      preheaderText: 'Redefina sua senha no Sobrevivência Doméstica.',
      bodyHtml,
    }),
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};