import { useCallback, useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ProfileClassRow from '../components/ProfileClassRow';
import { API_BASE } from '../utils/classTaxonomia';
import '../styles/Profile.css';

const LIMITE_AULAS = 10;

// lê o userId de dentro do próprio token (só decodifica o payload, não
// precisa validar assinatura aqui — é só pra decidir o que mostrar na tela,
// a segurança de verdade continua nas rotas do backend)
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

export default function Profile() {
  const { userId: paramUserId } = useParams();
  const meuId = obterMeuUserId();
  // sem :userId na URL (rota /perfil) OU o :userId bate com quem tá logado
  // (por exemplo, clicou no próprio comentário) — os dois casos são "eu mesmo"
  const souEuMesmo = !paramUserId || paramUserId === meuId;

  const [perfil, setPerfil] = useState(null);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [erroPerfil, setErroPerfil] = useState('');

  const [aba, setAba] = useState('aulas');
  const [busca, setBusca] = useState('');

  const [aulas, setAulas] = useState([]);
  const [aulasPagina, setAulasPagina] = useState(0);
  const [aulasTotalPaginas, setAulasTotalPaginas] = useState(0);
  const [aulasCarregando, setAulasCarregando] = useState(false);

  // Edit profile states
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editPicture, setEditPicture] = useState(null);
  const [editMsg, setEditMsg] = useState('');
  const fileInputRef = useRef(null);

  // Following modal states
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ao trocar de "meu perfil" pra "perfil de fulano" (ou vice-versa) sem sair
  // da tela — o componente não remonta, então precisa zerar tudo na mão
  useEffect(() => {
    setAulas([]);
    setAulasPagina(0);
    setAulasTotalPaginas(0);
    setIsEditing(false);
    setBusca('');
    setAba('aulas');
  }, [paramUserId]);

  const buscarPerfil = useCallback(async () => {
    setCarregandoPerfil(true);
    setErroPerfil('');
    try {
      const url = souEuMesmo ? `${API_BASE}/api/users/me` : `${API_BASE}/api/users/${paramUserId}`;
      const response = await fetch(url, { headers: authHeaders() });
      const data = await response.json();
      if (!response.ok) {
        setErroPerfil(data.mensagem || 'Não foi possível carregar o perfil');
        return;
      }
      setPerfil(data);
      if (souEuMesmo) setEditUsername(data.username);
    } catch (error) {
      setErroPerfil('Erro ao conectar com o servidor');
    } finally {
      setCarregandoPerfil(false);
    }
  }, [souEuMesmo, paramUserId]);

  useEffect(() => {
    buscarPerfil();
  }, [buscarPerfil]);

  const buscarAulas = useCallback(async (pagina, userId) => {
    setAulasCarregando(true);
    try {
      const params = new URLSearchParams({ page: String(pagina), limit: String(LIMITE_AULAS) });
      const response = await fetch(`${API_BASE}/api/classes/byAuthor/${userId}?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setAulas((atual) => (pagina === 1 ? data.classes || [] : [...atual, ...(data.classes || [])]));
        setAulasPagina(pagina);
        setAulasTotalPaginas(data.totalPages || 0);
      }
    } catch (error) {
    } finally {
      setAulasCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (perfil?._id) buscarAulas(1, perfil._id);
  }, [perfil?._id, buscarAulas]);

  const excluirAula = async (classId) => {
    try {
      const response = await fetch(`${API_BASE}/api/classes/${classId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (response.ok) {
        setAulas((atual) => atual.filter((a) => a._id !== classId));
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setEditMsg('');
    try {
      if (editUsername && editUsername !== perfil.username) {
        const resName = await fetch(`${API_BASE}/api/users/edit/username`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders()
          },
          body: JSON.stringify({ username: editUsername })
        });
        const dataName = await resName.json();
        if (!resName.ok) {
          setEditMsg(dataName.mensagem || 'Erro ao alterar nome');
          return;
        }
      }

      if (editPicture) {
        const formData = new FormData();
        formData.append('profilePicture', editPicture);
        const resPic = await fetch(`${API_BASE}/api/users/edit/picture`, {
          method: 'PUT',
          headers: authHeaders(),
          body: formData
        });
        const dataPic = await resPic.json();
        if (!resPic.ok) {
          setEditMsg(dataPic.mensagem || 'Erro ao alterar foto');
          return;
        }
      }

      await buscarPerfil();
      setIsEditing(false);
      setEditPicture(null);
    } catch (err) {
      setEditMsg('Erro ao salvar edições');
    }
  };

  const loadFollowing = async () => {
    setLoadingFollowing(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/followingList/${perfil._id}`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) {
        setFollowingList(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFollowing(false);
    }
  };

  const openFollowingModal = () => {
    setShowFollowingModal(true);
    loadFollowing();
  };

  const aulasFiltradas = busca.trim()
    ? aulas.filter((a) => a.title.toLowerCase().includes(busca.trim().toLowerCase()))
    : aulas;

  return (
    <div className="sd-profile">
      <Sidebar />

      <main className="sd-profile__main">
        {carregandoPerfil ? (
          <p className="sd-profile__hint">Carregando…</p>
        ) : erroPerfil ? (
          <p className="sd-profile__error">{erroPerfil}</p>
        ) : (
          <>
            <div className="sd-profile__banner-card">
              <div className="sd-profile__banner-content">
                <span className="sd-profile__avatar-large" aria-hidden="true">
                  {perfil.profilePicture ? (
                    <img src={`${API_BASE}/uploads/${perfil.profilePicture}`} alt="foto de perfil" />
                  ) : (
                    perfil.username?.[0]?.toUpperCase() || '?'
                  )}
                </span>
                
                <div className="sd-profile__info-section">
                  <div className="sd-profile__name-stats">
                    <div>
                      <h1 className="sd-profile__username">{perfil.username}</h1>
                      {perfil.email && <p className="sd-profile__email">{perfil.email}</p>}
                    </div>
                    <div className="sd-profile__stats">
                      <div className="sd-profile__stat-box">
                        <strong>{perfil.followers || 0}</strong>
                        <span>Seguidores</span>
                      </div>
                      <div className="sd-profile__stat-box" onClick={openFollowingModal} style={{cursor: 'pointer'}}>
                        <strong>{perfil.following ? perfil.following.length : 0}</strong>
                        <span>Seguindo</span>
                      </div>
                    </div>
                  </div>

                  {souEuMesmo && (
                    <div className="sd-profile__edit-container">
                      {isEditing ? (
                        <form onSubmit={handleEditProfile} className="sd-profile__edit-form">
                          <div className="sd-profile__inputs-row">
                            <div className="sd-profile__input-group">
                              <label>Nome de Usuário</label>
                              <input 
                                type="text" 
                                value={editUsername} 
                                onChange={e => setEditUsername(e.target.value)} 
                                placeholder="Novo nome" 
                                className="sd-profile__edit-input"
                              />
                            </div>
                            <div className="sd-profile__input-group">
                              <label>Foto de Perfil</label>
                              <div className="sd-profile__file-wrapper">
                                <input 
                                  type="file" 
                                  id="profilePicInput"
                                  accept="image/*" 
                                  onChange={e => setEditPicture(e.target.files[0])} 
                                  className="sd-profile__file-input"
                                  ref={fileInputRef}
                                />
                                <label htmlFor="profilePicInput" className="sd-profile__file-label">
                                  {editPicture ? editPicture.name : 'Escolher nova foto...'}
                                </label>
                              </div>
                            </div>
                          </div>
                          {editMsg && <p className="sd-profile__edit-msg">{editMsg}</p>}
                          <div className="sd-profile__edit-actions">
                            <button type="submit" className="sd-profile__btn-save">Salvar Alterações</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="sd-profile__btn-cancel">Cancelar</button>
                          </div>
                        </form>
                      ) : (
                        <button onClick={() => setIsEditing(true)} className="sd-profile__btn-edit">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
                          </svg>
                          Editar Perfil
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sd-profile__toolbar">
              <div className="sd-profile__search">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M20 20l-4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input
                  type="search"
                  placeholder="Pesquise uma aula"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  aria-label="Pesquisar entre as aulas"
                />
              </div>

              <div className="sd-profile__tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={aba === 'aulas'}
                  className={`sd-profile__tab ${aba === 'aulas' ? 'is-active' : ''}`}
                  onClick={() => setAba('aulas')}
                >
                  Aulas
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={aba === 'playlists'}
                  className={`sd-profile__tab ${aba === 'playlists' ? 'is-active' : ''}`}
                  onClick={() => setAba('playlists')}
                >
                  Playlists
                </button>
              </div>
            </div>

            {aba === 'playlists' ? (
              <div className="sd-profile__empty">
                <p>Playlists ainda não existem por aqui — em breve.</p>
              </div>
            ) : aulasFiltradas.length === 0 && !aulasCarregando ? (
              <div className="sd-profile__empty">
                <p>
                  {busca.trim()
                    ? `Nenhuma aula encontrada para “${busca.trim()}”.`
                    : souEuMesmo
                    ? 'Você ainda não publicou nenhuma aula.'
                    : 'Essa pessoa ainda não publicou nenhuma aula.'}
                </p>
              </div>
            ) : (
              <>
                {aulasFiltradas.map((aula) => (
                  <ProfileClassRow key={aula._id} aula={aula} onExcluir={excluirAula} podeEditar={souEuMesmo} />
                ))}

                {!busca.trim() && aulasPagina < aulasTotalPaginas && (
                  <button
                    type="button"
                    className="sd-profile__load-more"
                    onClick={() => buscarAulas(aulasPagina + 1, perfil._id)}
                    disabled={aulasCarregando}
                  >
                    {aulasCarregando ? 'Carregando…' : 'Carregar mais'}
                  </button>
                )}
              </>
            )}
          </>
        )}
      </main>

      {showFollowingModal && (
        <div className="sd-modal-overlay" onClick={() => setShowFollowingModal(false)}>
          <div className="sd-modal-content" onClick={e => e.stopPropagation()}>
            <div className="sd-modal-header">
              <h2>Seguindo</h2>
              <button onClick={() => setShowFollowingModal(false)} className="sd-modal-close">✕</button>
            </div>
            <div className="sd-modal-body">
              {loadingFollowing ? <p>Carregando...</p> : (
                followingList.length === 0 ? <p>Não segue ninguém ainda.</p> : (
                  <ul className="sd-following-list">
                    {followingList.map(u => (
                      <li key={u._id} className="sd-following-item">
                        <Link
                          to={`/perfil/${u._id}`}
                          className="sd-following-link"
                          onClick={() => setShowFollowingModal(false)}
                        >
                          <span className="sd-following-avatar">
                            {u.profilePicture ? (
                              <img src={`${API_BASE}/uploads/${u.profilePicture}`} alt="" />
                            ) : (
                              u.username?.[0]?.toUpperCase() || '?'
                            )}
                          </span>
                          <span className="sd-following-name">{u.username}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}