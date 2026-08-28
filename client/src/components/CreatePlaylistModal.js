import { useRef, useState } from 'react';
import { API_BASE } from '../utils/classTaxonomia';
import '../styles/AddToPlaylistModal.css';

export default function CreatePlaylistModal({ onClose, onCriada }) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [capaArquivo, setCapaArquivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const capaInputRef = useRef(null);

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const abrirSeletorCapa = () => capaInputRef.current?.click();

  const criar = async (e) => {
    e.preventDefault();
    setErro('');

    if (!nome.trim() || !descricao.trim()) {
      setErro('Preencha nome e descrição');
      return;
    }
    if (!capaArquivo) {
      setErro('A imagem de capa é obrigatória');
      return;
    }

    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append('name', nome.trim());
      formData.append('description', descricao.trim());
      formData.append('cover', capaArquivo);

      const response = await fetch(`${API_BASE}/api/playlists/create`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setErro(data.mensagem || 'Não foi possível criar a playlist');
        return;
      }

      onCriada?.(data.playlist);
      onClose();
    } catch (error) {
      setErro('Erro ao conectar com o servidor');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="sd-addplaylist__overlay" onClick={onClose}>
      <div
        className="sd-addplaylist"
        role="dialog"
        aria-modal="true"
        aria-label="Criar playlist"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="sd-addplaylist__close" onClick={onClose} aria-label="Fechar">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <h2 className="sd-addplaylist__title">Criar playlist</h2>

        <form className="sd-addplaylist__form" onSubmit={criar}>
          {erro && <p className="sd-addplaylist__error">{erro}</p>}

          <label className="sd-addplaylist__label" htmlFor="cpl-nome">Nome</label>
          <input id="cpl-nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} />

          <label className="sd-addplaylist__label" htmlFor="cpl-desc">Descrição</label>
          <textarea id="cpl-desc" value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={300} />

          <label className="sd-addplaylist__label">Capa</label>
          <button type="button" className="sd-addplaylist__cover-btn" onClick={abrirSeletorCapa}>
            {capaArquivo ? capaArquivo.name : 'Escolher imagem…'}
          </button>
          <input
            ref={capaInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            onChange={(e) => setCapaArquivo(e.target.files?.[0] || null)}
          />

          <div className="sd-addplaylist__form-actions">
            <button type="button" className="sd-addplaylist__cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="sd-addplaylist__submit" disabled={enviando}>
              {enviando ? 'Criando…' : 'Criar playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}