const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Invite = require('../models/Invite');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { sendInviteEmail } = require('../utils/mailer');

// GET /api/users - admin lista todos os usuários
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Erro interno' });
  }
});

// POST /api/users/invite - admin envia convite por email
router.post('/invite', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email obrigatório' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email já cadastrado' });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

    await Invite.deleteMany({ email, used: false });
    await Invite.create({ email, token, invitedBy: req.user.id, expiresAt });

    const inviteLink = `${process.env.CLIENT_URL}/register/${token}`;

    try {
      await sendInviteEmail(email, inviteLink, req.user.name);
      res.json({ message: 'Convite enviado por email', inviteLink });
    } catch {
      // Email falhou, mas retorna o link mesmo assim
      res.json({ message: 'Convite criado (email não enviado, use o link)', inviteLink });
    }
  } catch {
    res.status(500).json({ message: 'Erro interno' });
  }
});

// PATCH /api/users/:id - admin altera role ou ativa/desativa
router.patch('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const update = {};
    if (role !== undefined) update.role = role;
    if (isActive !== undefined) update.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Erro interno' });
  }
});

// DELETE /api/users/:id - admin remove usuário
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ message: 'Não é possível remover a si mesmo' });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Usuário removido' });
  } catch {
    res.status(500).json({ message: 'Erro interno' });
  }
});

module.exports = router;
