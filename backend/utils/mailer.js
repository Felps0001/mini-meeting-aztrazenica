const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendInviteEmail = async (toEmail, inviteLink, adminName) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Mini-Meeting" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Convite para o Mini-Meeting Dashboard',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Você foi convidado!</h2>
        <p>${adminName} te convidou para acessar o Mini-Meeting Dashboard.</p>
        <p>Clique no botão abaixo para criar sua conta:</p>
        <a href="${inviteLink}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;font-weight:bold;">
          Criar Conta
        </a>
        <p style="color:#888;font-size:12px;margin-top:20px;">Este link expira em 48 horas.</p>
      </div>
    `
  });
};

module.exports = { sendInviteEmail };
