import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setCarregando(true);

    try {
      const response = await fetch('http://localhost:7777/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagem(data.mensagem || 'Erro no login');
        return;
      }

      localStorage.setItem('token', data.token);
      onLogin(data.token);
      navigate('/home');
    } catch (error) {
      setMensagem('Erro na conexão com o servidor');
    } finally {
      setCarregando(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: apontar para a rota de OAuth do backend quando ela existir
    setMensagem('Login com Google ainda não está disponível.');
  };

  return (
    <div className="sd-login">
      {/* Painel de marca — ilustração do "circuito doméstico" que já aparece no protótipo */}
      <div className="sd-login__brand">
        <svg
          className="sd-login__blueprint"
          viewBox="0 0 480 640"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <g className="sd-login__pipes">
            <path d="M -20 120 H 200 V 40 H 500" />
            <path d="M -20 260 H 140 V 340 H 320 V 260 H 500" />
            <path d="M -20 460 H 260 V 560 H 500" />
            <path d="M 60 340 V 460" />
            <path d="M 380 40 V 200 H 500" />
          </g>
          <g className="sd-login__nodes">
            <circle cx="200" cy="120" r="5" />
            <circle cx="200" cy="40" r="5" />
            <circle cx="140" cy="260" r="5" />
            <circle cx="320" cy="260" r="5" />
            <circle cx="320" cy="340" r="5" />
            <circle cx="60" cy="340" r="5" />
            <circle cx="260" cy="460" r="5" />
            <circle cx="260" cy="560" r="5" />
            <circle cx="380" cy="200" r="5" />
          </g>
          <g className="sd-login__valves">
            <circle className="sd-login__valve sd-login__valve--pulse" cx="200" cy="80" r="9" />
            <circle className="sd-login__valve" cx="230" cy="300" r="9" />
            <circle className="sd-login__valve sd-login__valve--pulse" cx="130" cy="410" r="9" />
            <circle className="sd-login__valve" cx="380" cy="120" r="9" />
          </g>
        </svg>

        <div className="sd-login__brand-content">
          <span className="sd-login__mark">SD</span>
          <h1 className="sd-login__title">
            Sobrevivência
            <br />
            Doméstica
          </h1>
          <p className="sd-login__tagline">
            O essencial pra cuidar da própria casa, ensinado por quem já passou por isso.
          </p>
        </div>
      </div>

      {/* Painel do formulário */}
      <div className="sd-login__panel">
        <div className="sd-login__card">
          <h2 className="sd-login__heading">Entrar</h2>
          <p className="sd-login__subheading">Bem-vindo de volta.</p>

          {mensagem && (
            <p className="sd-login__error" role="alert">
              {mensagem}
            </p>
          )}

          <form className="sd-login__form" onSubmit={handleSubmit} noValidate>
            <div className="sd-login__field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="sd-login__field">
              <label htmlFor="password">Senha</label>
              <div className="sd-login__password-wrap">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="sd-login__toggle-senha"
                  onClick={() => setMostrarSenha((v) => !v)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {mostrarSenha ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                      <path d="M3 3l18 18M10.6 10.6a2.5 2.5 0 003.5 3.5M9.9 5.2A10.4 10.4 0 0112 5c5 0 9 4 10.5 7-.6 1.2-1.5 2.5-2.7 3.6M6.6 6.6C4.5 8 3 10 1.5 12c1.5 3 5.5 7 10.5 7 1.4 0 2.7-.3 3.9-.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                      <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <Link to="/esqueci-senha" className="sd-login__forgot">
              Esqueci minha senha
            </Link>

            <button type="submit" className="sd-login__submit" disabled={carregando}>
              {carregando ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <div className="sd-login__divider">
            <span>ou</span>
          </div>

          <button type="button" className="sd-login__google" onClick={handleGoogleLogin}>
            <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.95v2.33A9 9 0 009 18z" />
              <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 013.68 9c0-.6.1-1.18.29-1.72V4.95H.95A9 9 0 000 9c0 1.45.35 2.83.95 4.05l3.02-2.33z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.95 4.95l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
            </svg>
            Entrar com o Google
          </button>

          <p className="sd-login__register">
            Não tem uma conta? <Link to="/register">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}