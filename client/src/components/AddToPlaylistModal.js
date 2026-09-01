import { useEffect, useRef, useState } from 'react';
import { API_BASE } from '../utils/classTaxonomia';
import '../styles/AddToPlaylistModal.css';

export default function AddToPlaylistModal({ classId, onClose }) {
  const [playlists, setPlaylists] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [adicionadas, setAdicionadas] = useState({});

  const [criandoNova, setCriandoNova] = useState(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [capaArquivo, setCapaArquivo] = useState(null);
  const [privada, setPrivada] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erroCriar, setErroCriar] = useState('');
  const capaInputRef = useRef(null);

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const buscarMinhasPlaylists = async () => {
    setCarregando(true);
    setErro('');
    try {
      const response = await fetch(`${API_BASE}/api/playlists/mine?page=1&limit=50`, {
        headers: authHeaders(),
      });
      const data = await response.json();
      if (!response.ok) {
        setErro(data.mensagem || 'Não foi possível carregar suas playlists');
        return;
      }
      setPlaylists(data.playlists || []);

      const iniciais = {};
      (data.playlists || []).forEach((p) => {
        const jaTem = (p.classes || []).some((c) => (c._id || c).toString() === classId);
        if (jaTem) iniciais[p._id] = true;
      });
      setAdicionadas(iniciais);
    } catch (error) {
      setErro('Erro ao conectar com o servidor');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarMinhasPlaylists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const alternarNaPlaylist = async (playlistId) => {
    const jaAdicionada = Boolean(adicionadas[playlistId]);
    try {
      if (jaAdicionada) {
        const response = await fetch(`${API_BASE}/api/playlists/remove/${playlistId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ removeClassId: classId }),
        });
        if (response.ok) {
          setAdicionadas((atual) => {
            const copia = { ...atual };
            delete copia[playlistId];
            return copia;
          });
          setPlaylists((atual) =>
            atual.map((p) =>
              p._id === playlistId
                ? { ...p, classes: (p.classes || []).filter((c) => (c._id || c).toString() !== classId) }
                : p
            )
          );
        }
      } else {
        const response = await fetch(`${API_BASE}/api/playlists/add/${playlistId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ newClassId: classId }),
        });
        if (response.ok) {
          setAdicionadas((atual) => ({ ...atual, [playlistId]: true }));
          setPlaylists((atual) =>
            atual.map((p) =>
              p._id === playlistId ? { ...p, classes: [...(p.classes || []), classId] } : p
            )
          );
        }
      }
    } catch (error) {
      // silencioso — o botão simplesmente não muda de estado
    }
  };

  const abrirSeletorCapa = () => capaInputRef.current?.click();

  const criarPlaylist = async (e) => {
    e.preventDefault();
    setErroCriar('');

    if (!nome.trim() || !descricao.trim()) {
      setErroCriar('Preencha nome e descrição');
      return;
    }
    if (!capaArquivo) {
      setErroCriar('A imagem de capa é obrigatória');
      return;
    }

    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append('name', nome.trim());
      formData.append('description', descricao.trim());
      formData.append('cover', capaArquivo);
      formData.append('classIds', classId);
      formData.append('private', String(privada));

      const response = await fetch(`${API_BASE}/api/playlists/create`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setErroCriar(data.mensagem || 'Não foi possível criar a playlist');
        return;
      }

      setNome('');
      setDescricao('');
      setCapaArquivo(null);
      setCriandoNova(false);
      if (data.playlist?._id) {
        setAdicionadas((atual) => ({ ...atual, [data.playlist._id]: true }));
      }
      buscarMinhasPlaylists();
    } catch (error) {
      setErroCriar('Erro ao conectar com o servidor');
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
        aria-label="Adicionar à playlist"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="sd-addplaylist__close" onClick={onClose} aria-label="Fechar">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <h2 className="sd-addplaylist__title">Adicionar à playlist</h2>

        {criandoNova ? (
          <form className="sd-addplaylist__form" onSubmit={criarPlaylist}>
            {erroCriar && <p className="sd-addplaylist__error">{erroCriar}</p>}

            <label className="sd-addplaylist__label" htmlFor="pl-nome">Nome</label>
            <input
              id="pl-nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={80}
            />

            <label className="sd-addplaylist__label" htmlFor="pl-desc">Descrição</label>
            <textarea
              id="pl-desc"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              maxLength={300}
            />

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

            <label className="sd-addplaylist__label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={privada}
                onChange={(e) => setPrivada(e.target.checked)}
                style={{ width: 'auto' }}
              />
              Playlist privada
            </label>

            <div className="sd-addplaylist__form-actions">
              <button type="button" className="sd-addplaylist__cancel" onClick={() => setCriandoNova(false)}>
                Cancelar
              </button>
              <button type="submit" className="sd-addplaylist__submit" disabled={enviando}>
                {enviando ? 'Criando…' : 'Criar e adicionar'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <button type="button" className="sd-addplaylist__new" onClick={() => setCriandoNova(true)}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Criar nova playlist
            </button>

            {carregando ? (
              <p className="sd-addplaylist__hint">Carregando…</p>
            ) : erro ? (
              <p className="sd-addplaylist__error">{erro}</p>
            ) : playlists.length === 0 ? (
              <p className="sd-addplaylist__hint">Você ainda não tem nenhuma playlist.</p>
            ) : (
              <ul className="sd-addplaylist__list">
                {playlists.map((p) => (
                  <li key={p._id} className="sd-addplaylist__item">
                    <img src={`${API_BASE}${p.cover}`} alt="" className="sd-addplaylist__item-cover" />
                    <div className="sd-addplaylist__item-info">
                      <span className="sd-addplaylist__item-name">{p.name}</span>
                      <span className="sd-addplaylist__item-count">{p.classes?.length || 0} aulas</span>
                    </div>
                    <button
                      type="button"
                      className={`sd-addplaylist__add-btn ${adicionadas[p._id] ? 'is-done' : ''}`}
                      onClick={() => alternarNaPlaylist(p._id)}
                    >
                      {adicionadas[p._id] ? 'Adicionada' : 'Adicionar'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}