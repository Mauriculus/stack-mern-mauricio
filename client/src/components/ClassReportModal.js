import { useState } from 'react';
import { API_BASE, RAZOES_DENUNCIA } from '../utils/classTaxonomia';
import '../styles/ClassReportModal.css';

const LIMITE_TEXTO = 500;

export default function ClassReportModal({ classId, onClose }) {
  const [razao, setRazao] = useState('');
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState(false);

  const enviar = async () => {
    if (!razao) {
      setErro('Escolha uma razão para a denúncia');
      return;
    }

    setEnviando(true);
    setErro('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/classes/report/${classId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason: razao, text: texto.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErro(data.mensagem || 'Não foi possível enviar a denúncia');
        return;
      }

      setEnviado(true);
    } catch (error) {
      setErro('Erro ao conectar com o servidor');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="sd-report-modal__overlay" onClick={onClose}>
      <div
        className="sd-report-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Denunciar aula"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="sd-report-modal__close" onClick={onClose} aria-label="Fechar">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {enviado ? (
          <div className="sd-report-modal__sucesso">
            <div className="sd-report-modal__sucesso-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26">
                <path d="M4 12.5l5 5L20 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="sd-report-modal__title">Denúncia enviada</h2>
            <p className="sd-report-modal__subtitle">Obrigado por avisar — nossa equipe vai analisar.</p>
            <button type="button" className="sd-report-modal__submit" onClick={onClose}>
              Fechar
            </button>
          </div>
        ) : (
          <>
            <h2 className="sd-report-modal__title">Denunciar aula</h2>
            <p className="sd-report-modal__subtitle">Escolha o motivo que melhor descreve o problema.</p>

            {erro && (
              <p className="sd-report-modal__error" role="alert">
                {erro}
              </p>
            )}

            <fieldset className="sd-report-modal__reasons">
              <legend className="sd-report-modal__reasons-label">Motivo</legend>
              {RAZOES_DENUNCIA.map((r) => (
                <label key={r} className="sd-report-modal__reason">
                  <input
                    type="radio"
                    name="razao-denuncia"
                    value={r}
                    checked={razao === r}
                    onChange={() => setRazao(r)}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </fieldset>

            <label className="sd-report-modal__texto-label" htmlFor="texto-denuncia">
              Detalhes (opcional)
            </label>
            <textarea
              id="texto-denuncia"
              className="sd-report-modal__texto"
              value={texto}
              onChange={(e) => setTexto(e.target.value.slice(0, LIMITE_TEXTO))}
              placeholder="Conte mais sobre o problema, se quiser…"
              maxLength={LIMITE_TEXTO}
            />
            <span className="sd-report-modal__contador">
              {texto.length}/{LIMITE_TEXTO}
            </span>

            <div className="sd-report-modal__actions">
              <button type="button" className="sd-report-modal__cancel" onClick={onClose}>
                Cancelar
              </button>
              <button
                type="button"
                className="sd-report-modal__submit"
                onClick={enviar}
                disabled={enviando || !razao}
              >
                {enviando ? 'Enviando…' : 'Enviar denúncia'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
