import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE, COR_ASSUNTO, COR_RISCO, capaDaAula } from '../utils/classTaxonomia';
import EstrelaRating from './EstrelaRating';
import '../styles/ClassDetailModal.css';

export default function ClassDetailModal({ classTitle, tituloProvisorio, onClose }) {
  const [aula, setAula] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let cancelado = false;

    const buscarDetalhe = async () => {
      setCarregando(true);
      setErro('');

      try {
        // rota por parâmetro de URL, não mais query string — bate com
        // getClassByTitle lendo req.params.classTitle
        const response = await fetch(`${API_BASE}/api/classes/getByTitle/${encodeURIComponent(classTitle)}`);
        const data = await response.json();

        if (cancelado) return;

        if (!response.ok) {
          setErro(data.mensagem || 'Não foi possível carregar a aula');
          return;
        }

        setAula(data);
      } catch (error) {
        if (!cancelado) setErro('Erro ao conectar com o servidor');
      } finally {
        if (!cancelado) setCarregando(false);
      }
    };

    buscarDetalhe();
    return () => {
      cancelado = true;
    };
  }, [classTitle]);

  useEffect(() => {
    const aoTeclar = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [onClose]);

  return (
    <div className="sd-class-modal__overlay" onClick={onClose}>
      <div
        className="sd-class-modal"
        role="dialog"
        aria-modal="true"
        aria-label={aula?.title || tituloProvisorio}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="sd-class-modal__close" onClick={onClose} aria-label="Fechar">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {carregando ? (
          <p className="sd-class-modal__hint">Carregando…</p>
        ) : erro ? (
          <p className="sd-class-modal__error">{erro}</p>
        ) : (
          <ClassDetailContent aula={aula} />
        )}
      </div>
    </div>
  );
}

function ClassDetailContent({ aula }) {
  const capa = capaDaAula(aula);

  return (
    <>
      <div className="sd-class-modal__media">
        {capa.tipo === 'imagem' ? (
          <img src={capa.src} alt="" />
        ) : (
          <div className="sd-class-modal__placeholder" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path
                d="M3 10.5L12 4l9 6.5M5 9.5V20h14V9.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
        <EstrelaRating media={aula.ratingAverage} quantidade={aula.ratingCount} tamanho={15} />
      </div>

      <div className="sd-class-modal__info">
        <h2 className="sd-class-modal__title">{aula.title}</h2>

        <div className="sd-class-modal__author">
          <span className="sd-class-modal__avatar" aria-hidden="true">
            {aula.authorUsername?.[0]?.toUpperCase() || '?'}
          </span>
          <span>{aula.authorUsername}</span>
          {aula.createdAt && (
            <span className="sd-class-modal__date">
              {new Date(aula.createdAt).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>

        <div className="sd-class-modal__stats">
          {Array.isArray(aula.comments) && (
            <span className="sd-class-modal__stat">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  d="M21 12a8 8 0 01-8 8H7l-4 3 1-4.5A8 8 0 1121 12z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
              {aula.comments.length} coment{aula.comments.length === 1 ? 'ário' : 'ários'}
            </span>
          )}

          {typeof aula.reportCount === 'number' && (
            <span className="sd-class-modal__stat sd-class-modal__stat--alerta">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  d="M12 3l10 18H2L12 3zM12 9v5M12 17h.01"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {aula.reportCount} denúncia{aula.reportCount === 1 ? '' : 's'}
            </span>
          )}
        </div>

        <div className="sd-class-modal__badges">
          <span
            className="sd-class-modal__badge"
            style={{ backgroundColor: COR_ASSUNTO[aula.subject] || COR_ASSUNTO.Outro }}
          >
            {aula.subject}
          </span>
          {aula.dangerLevel && (
            <span
              className="sd-class-modal__badge sd-class-modal__badge--outline"
              style={{
                borderColor: COR_RISCO[aula.dangerLevel] || '#5b5f77',
                color: COR_RISCO[aula.dangerLevel] || '#5b5f77',
              }}
            >
              {aula.dangerLevel}
            </span>
          )}
        </div>

        <Link to={`/aula/${aula.normalizedTitle}`} className="sd-class-modal__button">
          Continuar
        </Link>
      </div>
    </>
  );
}