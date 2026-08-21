import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { API_BASE } from '../utils/classTaxonomia';
import '../styles/Sidebar.css';

export default function Sidebar() {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [profilePic, setProfilePic] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_BASE}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.profilePicture) {
          setProfilePic(`${API_BASE}/uploads/${data.profilePicture}`);
        }
        if (data && data.type === 'admin') {
          setIsAdmin(true);
        }
      })
      .catch(() => {});
    }
  }, []);

  return (
    <nav className="sd-sidebar" aria-label="Navegação principal">
      <Link to="/" className="sd-sidebar__logo" aria-label="Ir para a página inicial">
        <img src="/icons/logo.svg" alt="" />
      </Link>

      <div className="sd-sidebar__group">
        <Link
          to="/perfil"
          className={['sd-sidebar__icon', 'sd-sidebar__icon--grande', pathname === '/perfil' ? 'is-active' : ''].join(' ').trim()}
          title="Perfil"
          aria-label="Perfil"
        >
          {profilePic ? (
            <img src={profilePic} alt="Sua foto de perfil" className="sd-sidebar__profile-pic" />
          ) : (
            <img src="/icons/perfil.svg" alt="" />
          )}
        </Link>
        <Link
          to="/criar-aula"
          className={['sd-sidebar__icon', pathname === '/criar-aula' ? 'is-active' : ''].join(' ').trim()}
          title="Criar aula"
          aria-label="Criar aula"
        >
          <img src="/icons/caderno.svg" alt="" />
        </Link>
        <Link
          to="/pesquisar"
          className={['sd-sidebar__icon', pathname === '/pesquisar' ? 'is-active' : ''].join(' ').trim()}
          title="Pesquisar aula"
          aria-label="Pesquisar aula"
        >
          <img src="/icons/lupa.svg" alt="" />
        </Link>
        {isAdmin && (
          <Link
            to="/admin"
            className={['sd-sidebar__icon', pathname === '/admin' ? 'is-active' : ''].join(' ').trim()}
            title="Administração"
            aria-label="Administração"
          >
            <img src="/icons/admin.svg" alt="" />
          </Link>
        )}
      </div>

      <div className="sd-sidebar__group sd-sidebar__group--inferior">
        <button
          type="button"
          className={`sd-sidebar__icon ${theme === 'dark' ? 'is-active' : ''}`}
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Desativar modo escuro' : 'Ativar modo escuro'}
          aria-label={theme === 'dark' ? 'Desativar modo escuro' : 'Ativar modo escuro'}
          aria-pressed={theme === 'dark'}
        >
          <img src="/icons/lua.svg" alt="" />
        </button>

        <Link
          to="/configuracoes"
          className={`sd-sidebar__icon sd-sidebar__icon--grande ${pathname === '/configuracoes' ? 'is-active' : ''}`}
          title="Configurações"
          aria-label="Configurações"
        >
          <img src="/icons/config.svg" alt="" />
        </Link>
      </div>
    </nav>
  );
}