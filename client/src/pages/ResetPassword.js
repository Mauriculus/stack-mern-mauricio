import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/ResetPassword.css';

const PASSWORD_RULES = [
  { key: 'length', label: 'Pelo menos 6 caracteres', test: (p) => p.length >= 6 },
  { key: 'upper', label: 'Uma letra maiúscula', test: (p) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'Uma letra minúscula', test: (p) => /[a-z]/.test(p) },
  { key: 'number', label: 'Um número', test: (p) => /\d/.test(p) },
];

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resetToken = searchParams.get('resetToken');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [status, setStatus] = useState('formulario'); // 'formulario' | 'sucesso' | 'expirado'

  const validarLocalmente = () => {
    if (!PASSWORD_RULES.every((regra) => regra.test(newPassword))) {
      return 'Sua senha ainda não atende aos requisitos abaixo';
    }
    if (newPassword !== confirmPassword) {
      return 'As senhas não coincidem';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');

    const erroLocal = validarLocalmente();
    if (erroLocal) {
      setMensagem(erroLocal);
      return;
    }

    setCarregando(true);

    try {
      const response = await fetch('http://localhost:7777/api/users/changePassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (/expirado/i.test(data.mensagem || '')) {
          setStatus('expirado');
        } else {
          setMensagem(data.mensagem || 'Erro ao trocar a senha');
        }
        return;
      }

      setStatus('sucesso');
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor');
    } finally {
      setCarregando(false);
    }
  };

  const blueprint = (
    <svg
      className="sd-reset__blueprint"
      viewBox="0 0 480 640"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g className="sd-reset__pipes">
        <path d="M -20 120 H 200 V 40 H 500" />
        <path d="M -20 260 H 140 V 340 H 320 V 260 H 500" />
        <path d="M -20 460 H 260 V 560 H 500" />
        <path d="M 60 340 V 460" />
        <path d="M 380 40 V 200 H 500" />
      </g>
      <g className="sd-reset__nodes">
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
      <g className="sd-reset__valves">
        <circle className="sd-reset__valve" cx="200" cy="80" r="9" />
        <circle className="sd-reset__valve sd-reset__valve--pulse" cx="230" cy="300" r="9" />
        <circle className="sd-reset__valve" cx="130" cy="410" r="9" />
        <circle className="sd-reset__valve sd-reset__valve--pulse" cx="380" cy="120" r="9" />
      </g>
    </svg>
  );

  return (
    <div className="sd-reset">
      <div className="sd-reset__brand">
        {blueprint}
        <div className="sd-reset__brand-content">
          <span className="sd-reset__mark">SD</span>
          <h1 className="sd-reset__title">
            Sobrevivência
            <br />
            Doméstica
          </h1>
          <p className="sd-reset__tagline">Uma senha nova e você já volta pra dentro.</p>
        </div>
      </div>

      <div className="sd-reset__panel">
        <div className="sd-reset__card">
          {!resetToken && (
            <div className="sd-reset__status">
              <div className="sd-reset__icon sd-reset__icon--error" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="26" height="26">
                  <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="sd-reset__heading">Link inválido</h2>
              <p className="sd-reset__subheading">
                Esse link de redefinição de senha está incompleto ou não é válido.
              </p>
              <Link to="/esqueci-senha" className="sd-reset__button">
                Solicitar novo link
              </Link>
            </div>
          )}

          {resetToken && status === 'expirado' && (
            <div className="sd-reset__status">
              <div className="sd-reset__icon sd-reset__icon--warn" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="26" height="26">
                  <path d="M12 8v5M12 16.5h.01" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </div>
              <h2 className="sd-reset__heading">Link expirado</h2>
              <p className="sd-reset__subheading">
                Esse link de redefinição já venceu. Links de recuperação valem por 15 minutos.
              </p>
              <Link to="/esqueci-senha" className="sd-reset__button">
                Solicitar novo link
              </Link>
            </div>
          )}

          {resetToken && status === 'sucesso' && (
            <div className="sd-reset__status">
              <div className="sd-reset__icon sd-reset__icon--ok" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="26" height="26">
                  <path d="M4 12.5l5 5L20 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="sd-reset__heading">Senha atualizada</h2>
              <p className="sd-reset__subheading">
                Sua senha foi trocada com sucesso. Já pode entrar com ela.
              </p>
              <button type="button" className="sd-reset__button" onClick={() => navigate('/login')}>
                Ir para o login
              </button>
            </div>
          )}

          {resetToken && status === 'formulario' && (
            <>
              <h2 className="sd-reset__heading">Criar nova senha</h2>
              <p className="sd-reset__subheading">Escolha uma senha que você ainda não usou.</p>

              {mensagem && (
                <p className="sd-reset__error" role="alert">
                  {mensagem}
                </p>
              )}

              <form className="sd-reset__form" onSubmit={handleSubmit} noValidate>
                <div className="sd-reset__field">
                  <label htmlFor="newPassword">Nova senha</label>
                  <div className="sd-reset__password-wrap">
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      maxLength={72}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="sd-reset__toggle-senha"
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

                  <ul className="sd-reset__rules">
                    {PASSWORD_RULES.map((regra) => {
                      const ok = regra.test(newPassword);
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

                  {newPassword.length > 60 && (
                    <p className="sd-reset__hint">
                      Senhas muito longas são cortadas em 72 caracteres pelo sistema — o que
                      passar disso não faz diferença.
                    </p>
                  )}
                </div>

                <div className="sd-reset__field">
                  <label htmlFor="confirmPassword">Confirmar nova senha</label>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    maxLength={72}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="sd-reset__submit" disabled={carregando}>
                  {carregando ? 'Salvando…' : 'Salvar nova senha'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}