import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ClassCard from '../components/ClassCard';
import ClassDetailModal from '../components/ClassDetailModal';
import StarRatingInput from '../components/StarRatingInput';
import EstrelaRating from '../components/EstrelaRating';
import { API_BASE } from '../utils/classTaxonomia';
import '../styles/PlaylistView.css';

function obterMeuUserId() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || null;
  } catch (error) {
    return null;
  }
}

export default function PlaylistView() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const meuId = obterMeuUserId();

  const [playlist, setPlaylist] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [minhaAvaliacao, setMinhaAvaliacao] = useState(0);
  const [avaliando, setAvaliando] = useState(false);
  const [mensagemAvaliacao, setMensagemAvaliacao] = useState('');

  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [capaArquivo, setCapaArquivo] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erroEdicao, setErroEdicao] = useState('');

  const [aulaSelecionada, setAulaSelecionada] = useState(null);
  const [ordemSalvando, setOrdemSalvando] = useState(false);
  const [alterandoPrivacidade, setAlterandoPrivacidade] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const buscarPlaylist = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const response = await fetch(`${API_BASE}/api/playlists/byId/${playlistId}`, {
        headers: authHeaders(),
      });
      const data = await response.json();
      if (!response.ok) {
        setErro(data.mensagem || 'Não foi possível carregar a playlist');
        return;
      }
      setPlaylist(data);
      setNome(data.name);
      setDescricao(data.description);
    } catch (error) {
      setErro('Erro ao conectar com o servidor');
    } finally {
      setCarregando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistId]);

  useEffect(() => {
    buscarPlaylist();
  }, [buscarPlaylist]);

  const souDono = Boolean(playlist) && Boolean(meuId) && playlist.author === meuId;

  const handleAvaliar = async (nota) => {
    if (avaliando) return;
    setAvaliando(true);
    setMensagemAvaliacao('');
    try {
      const response = await fetch(`${API_BASE}/api/playlists/rate/${playlistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ rate: nota }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMensagemAvaliacao(data.mensagem || 'Não foi possível registrar sua nota');
        return;
      }
      setMinhaAvaliacao(nota);
      buscarPlaylist();
    } catch (error) {
      setMensagemAvaliacao('Erro ao conectar com o servidor');
    } finally {
      setAvaliando(false);
    }
  };

  const alternarPrivacidade = async () => {
    if (alterandoPrivacidade) return;
    setAlterandoPrivacidade(true);

    // otimista: já troca na tela, e desfaz se a chamada falhar — assim o
    // switch responde na hora, sem esperar o roundtrip pro servidor
    const anterior = playlist.private;
    setPlaylist((atual) => ({ ...atual, private: !atual.private }));

    try {
      const response = await fetch(`${API_BASE}/api/playlists/changePrivacy/${playlistId}`, {
        method: 'PUT',
        headers: authHeaders(),
      });
      if (!response.ok) {
        setPlaylist((atual) => ({ ...atual, private: anterior }));
      }
    } catch (error) {
      setPlaylist((atual) => ({ ...atual, private: anterior }));
    } finally {
      setAlterandoPrivacidade(false);
    }
  };

  const removerAula = async (removeClassId) => {
    try {
      const response = await fetch(`${API_BASE}/api/playlists/remove/${playlistId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ removeClassId }),
      });
      if (response.ok) buscarPlaylist();
    } catch (error) {}
  };

  const moverAula = async (indice, direcao) => {
    if (!playlist) return;
    const novaOrdem = [...playlist.classes];
    const alvo = indice + direcao;
    if (alvo < 0 || alvo >= novaOrdem.length) return;
    [novaOrdem[indice], novaOrdem[alvo]] = [novaOrdem[alvo], novaOrdem[indice]];

    setPlaylist((atual) => ({ ...atual, classes: novaOrdem }));
    setOrdemSalvando(true);
    try {
      await fetch(`${API_BASE}/api/playlists/reorder/${playlistId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ classes: novaOrdem.map((c) => c._id) }),
      });
    } catch (error) {
    } finally {
      setOrdemSalvando(false);
    }
  };

  const excluirPlaylist = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/playlists/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ playlistId }),
      });
      if (response.ok) navigate('/perfil');
    } catch (error) {}
  };

  const salvarEdicao = async (e) => {
    e.preventDefault();
    setErroEdicao('');
    setSalvando(true);
    try {
      const formData = new FormData();
      if (nome.trim()) formData.append('name', nome.trim());
      if (descricao.trim()) formData.append('description', descricao.trim());
      if (capaArquivo) formData.append('cover', capaArquivo);

      const response = await fetch(`${API_BASE}/api/playlists/edit/${playlistId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        setErroEdicao(data.mensagem || 'Não foi possível salvar');
        return;
      }
      setEditando(false);
      setCapaArquivo(null);
      buscarPlaylist();
    } catch (error) {
      setErroEdicao('Erro ao conectar com o servidor');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="sd-playlist-view">
      <Sidebar />
      <main className="sd-playlist-view__main">
        {carregando ? (
          <p className="sd-playlist-view__hint">Carregando…</p>
        ) : erro ? (
          <p className="sd-playlist-view__error">{erro}</p>
        ) : (
          <>
            <div className="sd-playlist-view__hero">
              <img src={`${API_BASE}${playlist.cover}`} alt="" className="sd-playlist-view__cover" />

              <div className="sd-playlist-view__hero-info">
                {editando ? (
                  <form className="sd-playlist-view__edit-form" onSubmit={salvarEdicao}>
                    {erroEdicao && <p className="sd-playlist-view__error">{erroEdicao}</p>}

                    <label className="sd-playlist-view__label">Nome</label>
                    <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} />

                    <label className="sd-playlist-view__label">Descrição</label>
                    <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={300} />

                    <label className="sd-playlist-view__label">Nova capa (opcional)</label>
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => setCapaArquivo(e.target.files?.[0] || null)} />

                    <div className="sd-playlist-view__edit-actions">
                      <button type="button" className="sd-playlist-view__btn-cancel" onClick={() => setEditando(false)}>
                        Cancelar
                      </button>
                      <button type="submit" className="sd-playlist-view__btn-save" disabled={salvando}>
                        {salvando ? 'Salvando…' : 'Salvar'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="sd-playlist-view__info-columns">
                      <div className="sd-playlist-view__info-main">
                        <h1 className="sd-playlist-view__title">{playlist.name}</h1>
                        <Link to={`/perfil/${playlist.author}`} className="sd-playlist-view__author">
                          {playlist.authorUsername || 'Autor desconhecido'}
                        </Link>
                        <p className="sd-playlist-view__description">{playlist.description}</p>
                      </div>

                      <div className="sd-playlist-view__info-side">
                        <EstrelaRating media={playlist.ratingAverage} quantidade={playlist.ratingCount} tamanho={16} />

                        <div className="sd-playlist-view__rate-row">
                          <span>Sua nota:</span>
                          <StarRatingInput valorAtual={minhaAvaliacao} onAvaliar={handleAvaliar} desabilitado={avaliando} />
                        </div>
                        {mensagemAvaliacao && <p className="sd-playlist-view__error">{mensagemAvaliacao}</p>}

                        {souDono && (
                          <div className="sd-playlist-view__owner-actions">
                            <button type="button" className="sd-playlist-view__btn-edit" onClick={() => setEditando(true)}>
                              Editar
                            </button>

                            <label className="sd-playlist-view__switch">
                              <input
                                type="checkbox"
                                checked={!playlist.private}
                                onChange={alternarPrivacidade}
                                disabled={alterandoPrivacidade}
                              />
                              <span className="sd-playlist-view__switch-slider"></span>
                              <span className="sd-playlist-view__switch-label">
                                {playlist.private ? 'Privada' : 'Pública'}
                              </span>
                            </label>

                            <button type="button" className="sd-playlist-view__btn-delete" onClick={excluirPlaylist}>
                              Excluir playlist
                            </button>
                          </div>
                        )}
                      </div>
                    </div>                  </>
                )}
              </div>
            </div>

            <h2 className="sd-playlist-view__section-title">Aulas</h2>

            {playlist.classes.length === 0 ? (
              <p className="sd-playlist-view__hint">Essa playlist ainda não tem nenhuma aula.</p>
            ) : (
              <div className="sd-playlist-view__list">
                {playlist.classes.map((aula, i) => (
                  <div key={aula._id} className="sd-playlist-view__item">
                    {souDono && (
                      <div className="sd-playlist-view__reorder">
                        <button
                          type="button"
                          onClick={() => moverAula(i, -1)}
                          disabled={i === 0 || ordemSalvando}
                          aria-label="Mover para cima"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => moverAula(i, 1)}
                          disabled={i === playlist.classes.length - 1 || ordemSalvando}
                          aria-label="Mover para baixo"
                        >
                          ▼
                        </button>
                      </div>
                    )}

                    <div className="sd-playlist-view__item-content">
                      <div className="sd-playlist-view__item-card">
                        <ClassCard aula={aula} onAbrir={setAulaSelecionada} />
                      </div>

                      {souDono && (
                        <button type="button" className="sd-playlist-view__remove" onClick={() => removerAula(aula._id)}>
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {aulaSelecionada && (
        <ClassDetailModal
          classId={aulaSelecionada._id}
          tituloProvisorio={aulaSelecionada.title}
          onClose={() => setAulaSelecionada(null)}
        />
      )}
    </div>
  );
}