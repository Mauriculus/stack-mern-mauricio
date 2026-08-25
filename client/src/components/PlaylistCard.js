import { API_BASE } from '../utils/classTaxonomia';
import EstrelaRating from './EstrelaRating';
import '../styles/PlaylistCard.css';

export default function PlaylistCard({ playlist, onAbrir }) {
  const capaUrl = playlist.cover ? `${API_BASE}/uploads/${playlist.cover}` : null;

  return (
    <button type="button" className="sd-playlist-card" onClick={() => onAbrir && onAbrir(playlist)}>
      <div className="sd-playlist-card__thumb">
        {capaUrl ? (
          <img src={capaUrl} alt="" />
        ) : (
          <div className="sd-playlist-card__placeholder" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26">
              <path d="M4 6h16M4 12h16M4 18h10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        <div className="sd-playlist-card__overlay-count">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <span>{playlist.classes?.length || 0} aulas</span>
        </div>
      </div>

      <div className="sd-playlist-card__info">
        <p className="sd-playlist-card__title">{playlist.name}</p>
        <p className="sd-playlist-card__author">Por {playlist.author?.username}</p>
        <div className="sd-playlist-card__meta">
          <EstrelaRating media={playlist.ratingAverage} quantidade={playlist.ratingCount} />
        </div>
      </div>
    </button>
  );
}
