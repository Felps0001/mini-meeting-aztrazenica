import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);
  const [error, setError] = useState('');

  const fetchUsers = () => {
    api.get('/users').then(res => setUsers(res.data)).catch(() => setError('Erro ao carregar usuários')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteResult(null);
    setInviteLoading(true);
    try {
      const { data } = await api.post('/users/invite');
      setInviteResult({ type: 'success', message: data.message, link: data.inviteLink });
    } catch (err) {
      setInviteResult({ type: 'error', message: err.response?.data?.message || 'Erro ao gerar link' });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await api.patch(`/users/${user._id}`, { isActive: !user.isActive });
      fetchUsers();
    } catch {
      alert('Erro ao atualizar usuário');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remover este usuário?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao remover');
    }
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    alert('Link copiado!');
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <h1>Gerenciar Usuários</h1>
        </div>

        {/* Convidar usuário */}
        <div className="invite-section">
          <h3>Gerar link de cadastro</h3>
          <form onSubmit={handleInvite} className="invite-form">
            <button type="submit" className="btn-primary" disabled={inviteLoading}>
              {inviteLoading ? 'Gerando...' : '🔗 Gerar link'}
            </button>
          </form>
          {inviteResult && (
            <div className={`invite-result ${inviteResult.type}`}>
              <p>{inviteResult.message}</p>
              {inviteResult.link && (
                <div className="invite-link-display">
                  <code>{inviteResult.link}</code>
                  <button className="btn-small" onClick={() => copyLink(inviteResult.link)}>Copiar</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lista de usuários */}
        {error && <div className="error-msg">{error}</div>}
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : (
          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Criado em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className={!u.isActive ? 'row-inactive' : ''}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge role-${u.role}`}>{u.role}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${u.isActive ? 'status-ativo' : 'status-encerrado'}`}>
                        {u.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="actions-cell">
                      <button className="btn-icon" title={u.isActive ? 'Desativar' : 'Ativar'} onClick={() => handleToggleActive(u)}>
                        {u.isActive ? '🚫' : '✅'}
                      </button>
                      <button className="btn-icon btn-danger" title="Remover" onClick={() => handleDelete(u._id)}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUsers;
