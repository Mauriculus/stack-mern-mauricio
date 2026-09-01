import { useState } from 'react';
import { Link } from 'react-router-dom';
import { COR_ASSUNTO, capaDaAula } from '../utils/classTaxonomia';
import EstrelaRating from './EstrelaRating';
import '../styles/ProfileClassRow.css';

function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function ProfileClassRow({ aula, onExcluir, podeEditar }) {
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const capa = capaDaAula(aula);

  const confirmarExclusao = async () => {
    setExcluindo(true);
    const ok = await onExcluir(aula._id);
    setExcluindo(false);
    if (!ok) setConfirmando(false);
  };

  return (
    <div className="sd-profile-row">
      <Link to={`/aula/${aula._id}`} className="sd-profile-row__thumb">
        {capa.tipo === 'imagem' ? (
          <img src={capa.src} alt="" />
        ) : (
          <div className="sd-profile-row__placeholder" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26">
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
      </Link>

      <div className="sd-profile-row__body">
        <Link to={`/aula/${aula._id}`} className="sd-profile-row__title">
          {aula.title}
        </Link>

        <div className="sd-profile-row__meta">
          <span className="sd-profile-row__data">{formatarData(aula.createdAt)}</span>

          {podeEditar && (
            confirmando ? (
              <span className="sd-profile-row__confirm">
                Excluir?
                <button type="button" onClick={confirmarExclusao} disabled={excluindo}>
                  {excluindo ? '...' : 'Sim'}
                </button>
                <button type="button" onClick={() => setConfirmando(false)} disabled={excluindo}>
                  Não
                </button>
              </span>
            ) : (
              <>
                <button
                  type="button"
                  className="sd-profile-row__icon-btn"
                  onClick={() => setConfirmando(true)}
                  aria-label="Excluir aula"
                  title="Excluir aula"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>

                <Link
                  to={`/editar-aula/${aula._id}`}
                  className="sd-profile-row__icon-btn"
                  aria-label="Editar aula"
                  title="Editar aula"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </Link>
              </>
            )
          )}
          
          {Array.isArray(aula.comments) && (
            <span className="sd-profile-row__stat" title="Comentários">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              {aula.comments.length}
            </span>
          )}

          {typeof aula.reportCount === 'number' && (
            <span className="sd-profile-row__stat sd-profile-row__stat--alerta" title="Denúncias">
              <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l10 18H2L12 3zM12 9v5M12 17h.01" />
              </svg>
              {aula.reportCount}
            </span>
          )}

          <div className="sd-profile-row__meta-right">
            <span
              className="sd-profile-row__badge"
              style={{ backgroundColor: COR_ASSUNTO[aula.subject] || COR_ASSUNTO.Outro }}
            >
              {aula.subject}
            </span>
            <EstrelaRating media={aula.ratingAverage} quantidade={aula.ratingCount} tamanho={13} />
          </div>
        </div>
      </div>
    </div>
  );
}
