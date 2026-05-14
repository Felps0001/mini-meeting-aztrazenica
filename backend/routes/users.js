const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Invite = require('../models/Invite');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET /api/users - admin lista todos os usuários
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Erro interno' });
  }
});

// POST /api/users/invite - admin gera link de cadastro
router.post('/invite', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    await Invite.create({ token, invitedBy: req.user.id, expiresAt });

    const inviteLink = `${process.env.CLIENT_URL}/register/${token}`;
    res.json({ message: 'Link de cadastro gerado', inviteLink });
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
