import { useState } from 'react';
import { COR_ASSUNTO, capaDaAula } from '../utils/classTaxonomia';
import EstrelaRating from './EstrelaRating';
import AddToPlaylistModal from './AddToPlaylistModal';
import '../styles/ClassCard.css';

export default function ClassCard({ aula, onAbrir }) {
  const [modalPlaylistAberto, setModalPlaylistAberto] = useState(false);
  const capa = capaDaAula(aula);

  return (
    <div
      className="sd-class-card"
      role="button"
      tabIndex={0}
      onClick={() => onAbrir(aula)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onAbrir(aula);
      }}
    >
      <div className="sd-class-card__thumb">
        {capa.tipo === 'imagem' ? (
          <img src={capa.src} alt="" />
        ) : (
          <div className="sd-class-card__placeholder" aria-hidden="true">
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

        <button
          type="button"
          className="sd-class-card__playlist-btn"
          onClick={(e) => {
            e.stopPropagation();
            setModalPlaylistAberto(true);
          }}
          aria-label="Adicionar à playlist"
          title="Adicionar à playlist"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M4 6h11M4 12h11M4 18h6M17 14v6M14 17h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="sd-class-card__info">
        <p className="sd-class-card__title">{aula.title}</p>
        <div className="sd-class-card__meta">
          <span
            className="sd-class-card__badge"
            style={{ backgroundColor: COR_ASSUNTO[aula.subject] || COR_ASSUNTO.Outro }}
          >
            {aula.subject}
          </span>
          <EstrelaRating media={aula.ratingAverage} quantidade={aula.ratingCount} />
        </div>
      </div>

      {modalPlaylistAberto && (
        <AddToPlaylistModal classId={aula._id} onClose={() => setModalPlaylistAberto(false)} />
      )}
    </div>
  );
}