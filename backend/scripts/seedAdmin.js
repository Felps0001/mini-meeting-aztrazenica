require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: 'admin@mini-meeting.com' });
  if (existing) {
    console.log('Admin já existe:', existing.email);
    process.exit(0);
  }

  await User.create({
    name: 'Administrador',
    email: 'admin@mini-meeting.com',
    password: 'Admin@2026',
    role: 'admin'
  });

  console.log('Admin criado com sucesso!');
  console.log('Email: admin@mini-meeting.com');
  console.log('Senha: Admin@2026');
  console.log('ALTERE A SENHA após o primeiro login.');
  process.exit(0);
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
