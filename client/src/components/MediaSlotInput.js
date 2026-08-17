import { useRef } from 'react';
import { extrairIdYoutube } from '../utils/classTaxonomia';
import '../styles/MediaSlotInput.css';

// value: { tipo: null | 'imagem' | 'youtube', arquivo, previewUrl, youtubeUrl, youtubeId }
export default function MediaSlotInput({ slot, onChange, indice }) {
  const inputRef = useRef(null);

  const escolherImagem = () => inputRef.current?.click();

  const aoSelecionarArquivo = (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    const previewUrl = URL.createObjectURL(arquivo);
    onChange({ tipo: 'imagem', arquivo, previewUrl, youtubeUrl: '', youtubeId: null });
  };

  const iniciarYoutube = () => {
    onChange({ tipo: 'youtube', arquivo: null, previewUrl: null, youtubeUrl: '', youtubeId: null });
  };

  const aoDigitarUrl = (e) => {
    const url = e.target.value;
    const id = extrairIdYoutube(url);
    onChange({ tipo: 'youtube', arquivo: null, previewUrl: null, youtubeUrl: url, youtubeId: id });
  };

  const limpar = () => {
    onChange({ tipo: null, arquivo: null, previewUrl: null, youtubeUrl: '', youtubeId: null });
  };

  return (
    <div className="sd-media-slot">
      {slot.tipo === null && (
        <div className="sd-media-slot__empty">
          <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
            <path d="M12 20V4M5 11l7-7 7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="sd-media-slot__ou">Ou</span>
          <button type="button" className="sd-media-slot__option" onClick={escolherImagem}>
            Inserir imagem
          </button>
          <button type="button" className="sd-media-slot__option" onClick={iniciarYoutube}>
            Inserir vídeo do Youtube
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            onChange={aoSelecionarArquivo}
          />
        </div>
      )}

      {slot.tipo === 'imagem' && (
        <div className="sd-media-slot__preview">
          <img src={slot.previewUrl} alt="" />
          <button type="button" className="sd-media-slot__remove" onClick={limpar} aria-label="Remover imagem">
            ×
          </button>
        </div>
      )}

      {slot.tipo === 'youtube' && (
        <div className="sd-media-slot__youtube">
          <button type="button" className="sd-media-slot__remove" onClick={limpar} aria-label="Remover vídeo">
            ×
          </button>
          <input
            type="url"
            className="sd-media-slot__url-input"
            placeholder="Cole o link do vídeo do Youtube"
            value={slot.youtubeUrl}
            onChange={aoDigitarUrl}
          />
          {slot.youtubeId ? (
            <iframe
              className="sd-media-slot__embed"
              src={`https://www.youtube.com/embed/${slot.youtubeId}`}
              title={`Vídeo do YouTube ${indice + 1}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            slot.youtubeUrl && (
              <p className="sd-media-slot__url-hint">Não consegui identificar um vídeo válido nesse link.</p>
            )
          )}
        </div>
      )}
    </div>
  );
}
