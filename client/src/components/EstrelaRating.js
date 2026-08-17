import '../styles/EstrelaRating.css';

// Desenha as estrelas via <svg> em vez de carregar estrela.svg /
// estrelaMetade.svg / estrelaVazia.svg como <img>: numa grade com dezenas de
// cards, isso evita dezenas de requisições repetidas pro mesmo arquivo e
// deixa a cor seguir --sd-amber (inclusive no modo escuro) sem esforço.
export default function EstrelaRating({ media, quantidade, tamanho = 13 }) {
  const temAvaliacao = typeof media === 'number' && quantidade > 0;

  if (!temAvaliacao) {
    return <span className="sd-estrelas sd-estrelas--vazia">Sem avaliações</span>;
  }

  // arredonda pra granularidade de meia estrela
  const valor = Math.round(media * 2) / 2;
  const cheias = Math.floor(valor);
  const meia = valor - cheias === 0.5;

  return (
    <span className="sd-estrelas" aria-label={`Nota ${valor.toFixed(1)} de 5, ${quantidade} avaliações`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const preenchimento = i < cheias ? 'cheia' : i === cheias && meia ? 'meia' : 'vazia';
        return (
          <svg key={i} viewBox="0 0 20 20" width={tamanho} height={tamanho} aria-hidden="true">
            {preenchimento === 'meia' && (
              <defs>
                <linearGradient id={`sd-estrela-meia-${i}`}>
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
            )}
            <path
              d="M10 1.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.8l-5.2 2.7 1-5.8L1.6 7.6l5.8-.8z"
              fill={preenchimento === 'cheia' ? 'currentColor' : preenchimento === 'meia' ? `url(#sd-estrela-meia-${i})` : 'none'}
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        );
      })}
      <span className="sd-estrelas__valor">
        {valor.toFixed(1)} <span className="sd-estrelas__quantidade">({quantidade})</span>
      </span>
    </span>
  );
}