import { Link } from 'react-router-dom';
import { API_BASE } from '../utils/classTaxonomia';
import EstrelaRating from './EstrelaRating';
import '../styles/PlaylistCard.css';

export default function PlaylistCard({ playlist }) {
  return (
    <Link to={`/playlist/${playlist._id}`} className="sd-playlist-card">
      <div className="sd-playlist-card__thumb">
        <img src={`${API_BASE}${playlist.cover}`} alt="" />
        <span className="sd-playlist-card__count">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {playlist.classes?.length || 0}
        </span>
      </div>
      <div className="sd-playlist-card__info">
        <p className="sd-playlist-card__title">{playlist.name}</p>
        <div className="sd-playlist-card__meta">
          <span className="sd-playlist-card__author">por {playlist.authorUsername}</span>
          <EstrelaRating media={playlist.ratingAverage} quantidade={playlist.ratingCount} />
        </div>
      </div>
    </Link>
  );
}
