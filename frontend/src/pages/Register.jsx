import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

const Register = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inviteValid, setInviteValid] = useState(false);

  useEffect(() => {
    const checkInvite = async () => {
      try {
        await api.get(`/auth/invite-info/${token}`);
        setInviteValid(true);
      } catch (err) {
        setError(err.response?.data?.message || 'Convite inválido ou expirado');
      } finally {
        setLoading(false);
      }
    };
    checkInvite();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) return setError('Email obrigatório');
    if (password !== confirm) return setError('As senhas não coincidem');
    if (password.length < 6) return setError('Senha mínima: 6 caracteres');
    setLoading(true);
    try {
      await api.post('/auth/register', { token, name, email, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="login-page"><div className="login-card"><p>Verificando convite...</p></div></div>;

  if (success) return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">✅</div>
        <h2>Conta criada com sucesso!</h2>
        <p>Redirecionando para o login...</p>
      </div>
    </div>
  );

  if (!inviteValid) return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">❌</div>
        <h2>Convite inválido</h2>
        <p className="error-msg">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">📋</div>
        <h1 className="login-title">Criar Conta</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Nome completo</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required />
          </div>
          <div className="form-group">
            <label>Confirmar senha</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repita a senha" required />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
