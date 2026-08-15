import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');

    if (!email.trim()) {
      setMensagem('Informe seu email');
      return;
    }

    setCarregando(true);

    try {
      const response = await fetch('http://localhost:7777/api/users/requestChangePassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagem(data.mensagem || 'Erro ao solicitar a troca de senha');
        return;
      }

      // o backend sempre responde com essa mesma mensagem genérica, exista ou
      // não o email — de propósito, pra não revelar quem tem conta ou não
      setEnviado(true);
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="sd-forgot">
      <div className="sd-forgot__brand">
        <svg
          className="sd-forgot__blueprint"
          viewBox="0 0 480 640"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <g className="sd-forgot__pipes">
            <path d="M -20 120 H 200 V 40 H 500" />
            <path d="M -20 260 H 140 V 340 H 320 V 260 H 500" />
            <path d="M -20 460 H 260 V 560 H 500" />
            <path d="M 60 340 V 460" />
            <path d="M 380 40 V 200 H 500" />
          </g>
          <g className="sd-forgot__nodes">
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
          <g className="sd-forgot__valves">
            <circle className="sd-forgot__valve sd-forgot__valve--pulse" cx="200" cy="80" r="9" />
            <circle className="sd-forgot__valve" cx="230" cy="300" r="9" />
            <circle className="sd-forgot__valve sd-forgot__valve--pulse" cx="130" cy="410" r="9" />
            <circle className="sd-forgot__valve" cx="380" cy="120" r="9" />
          </g>
        </svg>

        <div className="sd-forgot__brand-content">
          <span className="sd-forgot__mark">SD</span>
          <h1 className="sd-forgot__title">
            Sobrevivência
            <br />
            Doméstica
          </h1>
          <p className="sd-forgot__tagline">Acontece. Vamos te ajudar a voltar pra dentro.</p>
        </div>
      </div>

      <div className="sd-forgot__panel">
        <div className="sd-forgot__card">
          {enviado ? (
            <div className="sd-forgot__confirm">
              <div className="sd-forgot__confirm-icon" aria-hidden="true">
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
              <h2 className="sd-forgot__heading">Verifique seu email</h2>
              <p className="sd-forgot__subheading">
                Se <strong>{email}</strong> estiver cadastrado, você vai receber um link pra
                redefinir sua senha. Ele expira em 15 minutos.
              </p>
              <p className="sd-forgot__confirm-hint">
                Não achou o email? Confira também a caixa de spam.
              </p>
              <Link to="/login" className="sd-forgot__submit sd-forgot__submit--link">
                Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="sd-forgot__heading">Esqueceu sua senha?</h2>
              <p className="sd-forgot__subheading">
                Digite o email da sua conta e mandamos um link pra você criar uma senha nova.
              </p>

              {mensagem && (
                <p className="sd-forgot__error" role="alert">
                  {mensagem}
                </p>
              )}

              <form className="sd-forgot__form" onSubmit={handleSubmit} noValidate>
                <div className="sd-forgot__field">
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

                <button type="submit" className="sd-forgot__submit" disabled={carregando}>
                  {carregando ? 'Enviando…' : 'Enviar link de recuperação'}
                </button>
              </form>

              <p className="sd-forgot__login-link">
                Lembrou a senha? <Link to="/login">Entrar</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
