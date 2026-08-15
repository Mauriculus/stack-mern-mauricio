import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Register.css';

const PASSWORD_RULES = [
  { key: 'length', label: 'Pelo menos 6 caracteres', test: (p) => p.length >= 6 },
  { key: 'upper', label: 'Uma letra maiúscula', test: (p) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'Uma letra minúscula', test: (p) => /[a-z]/.test(p) },
  { key: 'number', label: 'Um número', test: (p) => /\d/.test(p) },
];

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [registrado, setRegistrado] = useState(false);
  const navigate = useNavigate();

  const validarLocalmente = () => {
    const usernameLimpo = username.trim();

    if (!usernameLimpo) {
      return 'Escolha um nome de usuário';
    }
    if (/\s/.test(usernameLimpo)) {
      return 'O nome de usuário não pode conter espaços no meio';
    }
    if (usernameLimpo.length > 30) {
      return 'O nome de usuário deve ter no máximo 30 caracteres';
    }
    if (!PASSWORD_RULES.every((regra) => regra.test(password))) {
      return 'A senha ainda não atende aos requisitos abaixo';
    }
    return '';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMensagem('');

    const erroLocal = validarLocalmente();
    if (erroLocal) {
      setMensagem(erroLocal);
      return;
    }

    setCarregando(true);

    try {
      const response = await fetch('http://localhost:7777/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagem(data.mensagem || 'Erro ao registrar');
        return;
      }

      setRegistrado(true);
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="sd-register">
      {/* Painel de marca — mesma ilustração de circuito da tela de login */}
      <div className="sd-register__brand">
        <svg
          className="sd-register__blueprint"
          viewBox="0 0 480 640"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <g className="sd-register__pipes">
            <path d="M -20 120 H 200 V 40 H 500" />
            <path d="M -20 260 H 140 V 340 H 320 V 260 H 500" />
            <path d="M -20 460 H 260 V 560 H 500" />
            <path d="M 60 340 V 460" />
            <path d="M 380 40 V 200 H 500" />
          </g>
          <g className="sd-register__nodes">
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
          <g className="sd-register__valves">
            <circle className="sd-register__valve" cx="200" cy="80" r="9" />
            <circle className="sd-register__valve sd-register__valve--pulse" cx="230" cy="300" r="9" />
            <circle className="sd-register__valve" cx="130" cy="410" r="9" />
            <circle className="sd-register__valve sd-register__valve--pulse" cx="380" cy="120" r="9" />
          </g>
        </svg>

        <div className="sd-register__brand-content">
          <span className="sd-register__mark">SD</span>
          <h1 className="sd-register__title">
            Sobrevivência
            <br />
            Doméstica
          </h1>
          <p className="sd-register__tagline">
            Comece a aprender o que ninguém te ensinou em casa.
          </p>
        </div>
      </div>

      {/* Painel do formulário */}
      <div className="sd-register__panel">
        <div className="sd-register__card">
          {registrado ? (
            <div className="sd-register__confirm">
              <div className="sd-register__confirm-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="28" height="28">
                  <path
                    d="M3 6.5A2.5 2.5 0 015.5 4h13A2.5 2.5 0 0121 6.5v11a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 17.5v-11z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="sd-register__heading">Falta pouco</h2>
              <p className="sd-register__subheading">
                Enviamos um link de verificação para <strong>{email}</strong>. Abra seu email e
                clique no link para ativar a conta antes de entrar.
              </p>
              <p className="sd-register__confirm-hint">
                Não achou o email? Confira também a caixa de spam.
              </p>
              <Link to="/login" className="sd-register__submit sd-register__submit--link">
                Ir para o login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="sd-register__heading">Criar conta</h2>
              <p className="sd-register__subheading">Leva menos de um minuto.</p>

              {mensagem && (
                <p className="sd-register__error" role="alert">
                  {mensagem}
                </p>
              )}

              <form className="sd-register__form" onSubmit={handleRegister} noValidate>
                <div className="sd-register__field">
                  <label htmlFor="username">Nome de usuário</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    autoComplete="username"
                    placeholder="como quer ser chamado"
                    maxLength={30}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="sd-register__field">
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

                <div className="sd-register__field">
                  <label htmlFor="password">Senha</label>
                  <div className="sd-register__password-wrap">
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      id="password"
                      name="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      maxLength={72}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="sd-register__toggle-senha"
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

                  <ul className="sd-register__rules">
                    {PASSWORD_RULES.map((regra) => {
                      const ok = regra.test(password);
                      return (
                        <li key={regra.key} className={ok ? 'is-valid' : ''}>
                          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                            {ok ? (
                              <path d="M2 8.5l3.5 3.5L14 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            ) : (
                              <circle cx="8" cy="8" r="3" fill="currentColor" />
                            )}
                          </svg>
                          {regra.label}
                        </li>
                      );
                    })}
                  </ul>

                  {password.length > 60 && (
                    <p className="sd-register__hint">
                      Senhas muito longas são cortadas em 72 caracteres pelo sistema — o que
                      passar disso não faz diferença.
                    </p>
                  )}
                </div>

                <button type="submit" className="sd-register__submit" disabled={carregando}>
                  {carregando ? 'Criando conta…' : 'Criar conta'}
                </button>
              </form>

              <p className="sd-register__login-link">
                Já tem uma conta? <Link to="/login">Entrar</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}