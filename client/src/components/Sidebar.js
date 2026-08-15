import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import '../styles/Sidebar.css';

const ICONES_SUPERIORES = [
  { to: '/perfil', icone: '/icons/perfil.svg', rotulo: 'Perfil', tamanho: 'grande' },
  { to: '/criar-aula', icone: '/icons/caderno.svg', rotulo: 'Criar aula' },
  { to: '/pesquisar', icone: '/icons/lupa.svg', rotulo: 'Pesquisar aula' },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sd-sidebar" aria-label="Navegação principal">
      <Link to="/" className="sd-sidebar__logo" aria-label="Ir para a página inicial">
        <img src="/icons/logo.svg" alt="" />
      </Link>

      <div className="sd-sidebar__group">
        {ICONES_SUPERIORES.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={[
              'sd-sidebar__icon',
              item.tamanho === 'grande' ? 'sd-sidebar__icon--grande' : '',
              pathname === item.to ? 'is-active' : '',
            ].join(' ').trim()}
            title={item.rotulo}
            aria-label={item.rotulo}
          >
            <img src={item.icone} alt="" />
          </Link>
        ))}
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
