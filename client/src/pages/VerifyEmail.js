import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/VerifyEmail.css';

// status possíveis: 'verificando' | 'sucesso' | 'ja-verificada' | 'expirado' | 'erro'

export default function VerifyEmail({ onLogin }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verificando');
  const [mensagem, setMensagem] = useState('');
  const [contagem, setContagem] = useState(3);
  const disparado = useRef(false);

  useEffect(() => {
    const verificationToken = searchParams.get('verificationToken');

    if (!verificationToken) {
      setStatus('erro');
      setMensagem('Link de verificação inválido ou incompleto.');
      return;
    }

    // evita disparar a verificação duas vezes (StrictMode monta o efeito 2x em dev)
    if (disparado.current) return;
    disparado.current = true;

    const verificar = async () => {
      try {
        const url = `http://localhost:7777/api/users/verify?verificationToken=${encodeURIComponent(verificationToken)}`;
        const response = await fetch(url, { method: 'GET' });

        const data = await response.json();

        if (!response.ok) {
          if (/já verificada/i.test(data.mensagem || '')) {
            setStatus('ja-verificada');
          } else if (/expirado/i.test(data.mensagem || '')) {
            setStatus('expirado');
          } else {
            setStatus('erro');
          }
          setMensagem(data.mensagem || 'Não foi possível verificar seu email.');
          return;
        }

        setStatus('sucesso');
        setMensagem(data.mensagem || 'Email verificado com sucesso');

        if (data.token) {
          localStorage.setItem('token', data.token);
          onLogin?.(data.token);
        }
      } catch (error) {
        setStatus('erro');
        setMensagem('Erro na conexão com o servidor.');
      }
    };

    verificar();
  }, [searchParams, onLogin]);

  // redireciona sozinho alguns segundos depois de confirmar
  useEffect(() => {
    if (status !== 'sucesso') return undefined;

    if (contagem === 0) {
      navigate('/home');
      return undefined;
    }

    const timer = setTimeout(() => setContagem((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, contagem, navigate]);

  return (
    <div className="sd-verify">
      <div className="sd-verify__brand">
        <svg
          className="sd-verify__blueprint"
          viewBox="0 0 480 640"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <g className="sd-verify__pipes">
            <path d="M -20 120 H 200 V 40 H 500" />
            <path d="M -20 260 H 140 V 340 H 320 V 260 H 500" />
            <path d="M -20 460 H 260 V 560 H 500" />
            <path d="M 60 340 V 460" />
            <path d="M 380 40 V 200 H 500" />
          </g>
          <g className="sd-verify__nodes">
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
          <g className="sd-verify__valves">
            <circle className="sd-verify__valve sd-verify__valve--pulse" cx="200" cy="80" r="9" />
            <circle className="sd-verify__valve" cx="230" cy="300" r="9" />
            <circle className="sd-verify__valve" cx="130" cy="410" r="9" />
            <circle className="sd-verify__valve sd-verify__valve--pulse" cx="380" cy="120" r="9" />
          </g>
        </svg>

        <div className="sd-verify__brand-content">
          <span className="sd-verify__mark">SD</span>
          <h1 className="sd-verify__title">
            Sobrevivência
            <br />
            Doméstica
          </h1>
          <p className="sd-verify__tagline">Só mais um passo antes de começar.</p>
        </div>
      </div>

      <div className="sd-verify__panel">
        <div className="sd-verify__card">
          {status === 'verificando' && (
            <>
              <div className="sd-verify__spinner" aria-hidden="true" />
              <h2 className="sd-verify__heading">Verificando seu email…</h2>
              <p className="sd-verify__subheading">Isso leva só um instante.</p>
            </>
          )}

          {status === 'sucesso' && (
            <>
              <div className="sd-verify__icon sd-verify__icon--ok" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="26" height="26">
                  <path d="M4 12.5l5 5L20 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="sd-verify__heading">Email verificado!</h2>
              <p className="sd-verify__subheading">
                Sua conta está ativa. Te levando pra dentro em {contagem}s…
              </p>
              <Link to="/home" className="sd-verify__button">
                Ir agora
              </Link>
            </>
          )}

          {status === 'ja-verificada' && (
            <>
              <div className="sd-verify__icon sd-verify__icon--neutral" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="26" height="26">
                  <path d="M4 12.5l5 5L20 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="sd-verify__heading">Conta já verificada</h2>
              <p className="sd-verify__subheading">{mensagem} Você já pode entrar normalmente.</p>
              <Link to="/login" className="sd-verify__button">
                Ir para o login
              </Link>
            </>
          )}

          {status === 'expirado' && (
            <>
              <div className="sd-verify__icon sd-verify__icon--warn" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="26" height="26">
                  <path d="M12 8v5M12 16.5h.01" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </div>
              <h2 className="sd-verify__heading">Link expirado</h2>
              <p className="sd-verify__subheading">{mensagem}</p>
              <Link to="/register" className="sd-verify__button">
                Cadastrar novamente
              </Link>
            </>
          )}

          {status === 'erro' && (
            <>
              <div className="sd-verify__icon sd-verify__icon--error" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="26" height="26">
                  <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="sd-verify__heading">Não deu certo</h2>
              <p className="sd-verify__subheading">{mensagem}</p>
              <div className="sd-verify__actions">
                <Link to="/login" className="sd-verify__button sd-verify__button--ghost">
                  Ir para o login
                </Link>
                <Link to="/register" className="sd-verify__button">
                  Criar nova conta
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}