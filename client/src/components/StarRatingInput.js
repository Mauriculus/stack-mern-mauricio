import { useState } from 'react';
import '../styles/StarRatingInput.css';

export default function StarRatingInput({ valorAtual = 0, onAvaliar, desabilitado }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="sd-rate-input" role="radiogroup" aria-label="Avalie esta aula de 1 a 5 estrelas">
      {[1, 2, 3, 4, 5].map((n) => {
        const preenchida = n <= (hover || valorAtual);
        return (
          <button
            key={n}
            type="button"
            className="sd-rate-input__star"
            disabled={desabilitado}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            onClick={() => onAvaliar(n)}
            aria-label={`Dar nota ${n} de 5`}
          >
            <svg viewBox="0 0 20 20" width="22" height="22" aria-hidden="true">
              <path
                d="M10 1.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.8l-5.2 2.7 1-5.8L1.6 7.6l5.8-.8z"
                fill={preenchida ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}