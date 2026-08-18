import { useEffect, useRef, useState } from 'react';
import '../styles/ColorSelect.css';

export default function ColorSelect({
  label,
  value,
  onChange,
  options,
  cores,
  placeholder = 'Selecione',
  somenteLeitura = false,
}) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!aberto) return undefined;
    const aoClicarFora = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false);
    };
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, [aberto]);

  if (somenteLeitura) {
    return (
      <div className="sd-color-select sd-color-select--leitura">
        {label && <span className="sd-color-select__label">{label}</span>}
        {value ? (
          <span className="sd-color-select__chip" style={{ backgroundColor: cores[value] }}>
            {value}
          </span>
        ) : (
          <span className="sd-color-select__placeholder">{placeholder}</span>
        )}
      </div>
    );
  }

  return (
    <div className="sd-color-select" ref={ref}>
      {label && <span className="sd-color-select__label">{label}</span>}

      <button
        type="button"
        className="sd-color-select__toggle"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
      >
        {value ? (
          <span className="sd-color-select__chip" style={{ backgroundColor: cores[value] }}>
            {value}
          </span>
        ) : (
          <span className="sd-color-select__placeholder">{placeholder}</span>
        )}
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {aberto && (
        <div className="sd-color-select__panel" role="listbox">
          {options.map((opcao) => (
            <button
              key={opcao}
              type="button"
              role="option"
              aria-selected={value === opcao}
              className="sd-color-select__option"
              onClick={() => {
                onChange(opcao);
                setAberto(false);
              }}
            >
              <span className="sd-color-select__chip" style={{ backgroundColor: cores[opcao] }}>
                {opcao}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}