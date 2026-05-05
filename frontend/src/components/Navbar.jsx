import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">📋</span>
        <span className="brand-text">Mini-Meeting</span>
      </div>
      <div className="navbar-links">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Dashboard
        </NavLink>
        <NavLink to="/meetings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Meetings
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Usuários
          </NavLink>
        )}
      </div>
      <div className="navbar-user">
        <span className="user-badge">{user?.role === 'admin' ? '👑 Admin' : '👤 ' + user?.name}</span>
        <button className="btn-logout" onClick={handleLogout}>Sair</button>
      </div>
    </nav>
  );
};

export default Navbar;
