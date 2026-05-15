const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const User = require('../models/User');
const Invite = require('../models/Invite');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

function generateTempPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.randomBytes(8);
  let password = '';
  for (const byte of bytes) password += chars[byte % chars.length];
  return password;
}

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

    const baseUrl = (process.env.CLIENT_URL || '').replace(/\/$/, '');
    const inviteLink = `${baseUrl}/register/${token}`;
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

// POST /api/users/bulk-import - admin cria vários usuários via CSV
router.post('/bulk-import', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { users } = req.body;
    if (!Array.isArray(users) || users.length === 0)
      return res.status(400).json({ message: 'Lista de usuários vazia' });

    if (users.length > 100)
      return res.status(400).json({ message: 'Máximo de 100 usuários por importação' });

    const results = [];

    for (const u of users) {
      const name = (u.name || '').trim();
      const email = (u.email || '').trim().toLowerCase();

      if (!name || !email) {
        results.push({ name, email, status: 'error', message: 'Nome e email obrigatórios' });
        continue;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        results.push({ name, email, status: 'error', message: 'Email inválido' });
        continue;
      }

      try {
        const existing = await User.findOne({ email });
        if (existing) {
          results.push({ name, email, status: 'error', message: 'Email já cadastrado' });
          continue;
        }

        const tempPassword = generateTempPassword();
        await User.create({ name, email, password: tempPassword, role: 'user', isActive: true });
        results.push({ name, email, tempPassword, status: 'created' });
      } catch {
        results.push({ name, email, status: 'error', message: 'Erro ao criar usuário' });
      }
    }

    res.json({ results });
  } catch {
    res.status(500).json({ message: 'Erro interno' });
  }
});

module.exports = router;
