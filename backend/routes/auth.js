const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Invite = require('../models/Invite');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email e senha obrigatórios' });

    const user = await User.findOne({ email });
    if (!user || !user.isActive)
      return res.status(401).json({ message: 'Credenciais inválidas' });

    const match = await user.comparePassword(password);
    if (!match)
      return res.status(401).json({ message: 'Credenciais inválidas' });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err.message);
    res.status(500).json({ message: 'Erro interno', detail: err.message });
  }
});

// POST /api/auth/register (via convite)
router.post('/register', async (req, res) => {
  try {
    const { token, name, password } = req.body;
    if (!token || !name || !password)
      return res.status(400).json({ message: 'Dados incompletos' });

    const invite = await Invite.findOne({ token, used: false });
    if (!invite)
      return res.status(400).json({ message: 'Convite inválido ou já utilizado' });

    if (invite.expiresAt < new Date())
      return res.status(400).json({ message: 'Convite expirado' });

    const existingUser = await User.findOne({ email: invite.email });
    if (existingUser)
      return res.status(400).json({ message: 'Email já cadastrado' });

    const user = await User.create({
      name,
      email: invite.email,
      password,
      role: 'user',
      invitedBy: invite.invitedBy
    });

    invite.used = true;
    await invite.save();

    res.status(201).json({ message: 'Conta criada com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro interno' });
  }
});

// GET /api/auth/invite-info/:token
router.get('/invite-info/:token', async (req, res) => {
  try {
    const invite = await Invite.findOne({ token: req.params.token, used: false });
    if (!invite || invite.expiresAt < new Date())
      return res.status(400).json({ message: 'Convite inválido ou expirado' });

    res.json({ email: invite.email });
  } catch {
    res.status(500).json({ message: 'Erro interno' });
  }
});

module.exports = router;
