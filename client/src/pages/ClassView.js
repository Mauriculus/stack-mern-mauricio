import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ColorSelect from '../components/ColorSelect';
import StarRatingInput from '../components/StarRatingInput';
import EstrelaRating from '../components/EstrelaRating';
import CommentItem from '../components/CommentItem';
import ClassReportModal from '../components/ClassReportModal';
import { API_BASE, COR_ASSUNTO, COR_RISCO, extrairIdYoutube } from '../utils/classTaxonomia';
import '../styles/ClassView.css';

const LIMITE_COMENTARIOS = 10;
const LIMITE_COMENTARIO_TEXTO = 500;

export default function ClassView() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [aula, setAula] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [minhaAvaliacao, setMinhaAvaliacao] = useState(0);
  const [avaliando, setAvaliando] = useState(false);
  const [mensagemAvaliacao, setMensagemAvaliacao] = useState('');
  const [denunciaAberta, setDenunciaAberta] = useState(false);
  const [avisoLoginAberto, setAvisoLoginAberto] = useState(false);

  const [comentarios, setComentarios] = useState([]);
  const [comentariosTotal, setComentariosTotal] = useState(0);
  const [comentariosPagina, setComentariosPagina] = useState(0);
  const [comentariosTotalPaginas, setComentariosTotalPaginas] = useState(0);
  const [comentariosCarregando, setComentariosCarregando] = useState(false);
  const [comentarioErro, setComentarioErro] = useState('');

  const [novoComentario, setNovoComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : null;
  };

  useEffect(() => {
    let cancelado = false;

    const buscarAula = async () => {
      setCarregando(true);
      setErro('');
      try {
        const response = await fetch(`${API_BASE}/api/classes/getById/${encodeURIComponent(classId)}`);
        const data = await response.json();
        if (cancelado) return;

        if (!response.ok) {
          setErro(data.mensagem || 'Não foi possível carregar a aula');
          return;
        }
        setAula(data);
      } catch (error) {
        if (!cancelado) setErro('Erro ao conectar com o servidor');
      } finally {
        if (!cancelado) setCarregando(false);
      }
    };

    buscarAula();
    return () => {
      cancelado = true;
    };
  }, [classId]);

  const buscarComentarios = useCallback(async (pagina, normalizedTitle) => {
    setComentariosCarregando(true);
    try {
      const params = new URLSearchParams({ page: String(pagina), limit: String(LIMITE_COMENTARIOS) });
      const response = await fetch(
        `${API_BASE}/api/classes/getComments/${encodeURIComponent(normalizedTitle)}?${params.toString()}`
      );
      const data = await response.json();

      if (response.ok) {
        setComentarios((atual) => (pagina === 1 ? data.comments || [] : [...atual, ...(data.comments || [])]));
        setComentariosPagina(pagina);
        setComentariosTotalPaginas(data.totalPages || 0);
        setComentariosTotal(data.total || 0);
      }
    } catch (error) {
    } finally {
      setComentariosCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (aula?.normalizedTitle) {
      buscarComentarios(1, aula.normalizedTitle);
    }
  }, [aula?.normalizedTitle, buscarComentarios]);

  const handleAvaliar = async (nota) => {
    const headers = authHeaders();
    if (!headers) {
      setAvisoLoginAberto(true);
      return;
    }
    if (avaliando) return;
    setAvaliando(true);
    setMensagemAvaliacao('');

    try {
      const response = await fetch(`${API_BASE}/api/classes/rate/${classId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ rate: nota }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMensagemAvaliacao(data.mensagem || 'Não foi possível registrar sua nota');
        return;
      }

      setMinhaAvaliacao(nota);

      const refetch = await fetch(`${API_BASE}/api/classes/getById/${classId}`);
      const refetchData = await refetch.json();
      if (refetch.ok) setAula(refetchData);
    } catch (error) {
      setMensagemAvaliacao('Erro ao conectar com o servidor');
    } finally {
      setAvaliando(false);
    }
  };

  const handleDenunciar = () => {
    const headers = authHeaders();
    if (!headers) {
      setAvisoLoginAberto(true);
      return;
    }
    setDenunciaAberta(true);
  };

  const irParaComentarios = () => {
    document.getElementById('comentarios')?.scrollIntoView({ behavior: 'smooth' });
  };

  const publicarComentario = async () => {
    const headers = authHeaders();
    if (!headers) {
      setAvisoLoginAberto(true);
      return;
    }
    if (!novoComentario.trim() || !aula) return;
    setEnviandoComentario(true);
    setComentarioErro('');

    try {
      const response = await fetch(`${API_BASE}/api/classes/comment/${encodeURIComponent(aula.normalizedTitle)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ content: novoComentario.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        setComentarioErro(data.mensagem || 'Não foi possível publicar o comentário');
        return;
      }

      setNovoComentario('');
      buscarComentarios(1, aula.normalizedTitle);
    } catch (error) {
      setComentarioErro('Erro ao conectar com o servidor');
    } finally {
      setEnviandoComentario(false);
    }
  };

  const enviarResposta = async (commentId, texto) => {
    const headers = authHeaders();
    if (!headers) {
      setAvisoLoginAberto(true);
      return false;
    }
    try {
      const response = await fetch(`${API_BASE}/api/classes/respond/${commentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ content: texto }),
      });
      if (response.ok && aula) {
        await buscarComentarios(1, aula.normalizedTitle);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="sd-view">
      <Sidebar />

      <main className="sd-view__main">
        {carregando ? (
          <p className="sd-view__hint">Carregando…</p>
        ) : erro ? (
          <p className="sd-view__error">{erro}</p>
        ) : (
          <>
            <div className="sd-view__hero">
              <h1 className="sd-view__title">{aula.title}</h1>
            </div>

            <div className="sd-view__toolbar">
              <ColorSelect label="Tema" value={aula.subject} cores={COR_ASSUNTO} somenteLeitura />

              <div className="sd-view__cover">
                <span className="sd-view__cover-label">Foto de capa</span>
                <div className="sd-view__cover-box">
                  {aula.cover && <img src={`${API_BASE}${aula.cover}`} alt="" />}
                </div>
              </div>

              <div className="sd-view__rate-panel">
                <EstrelaRating media={aula.ratingAverage} quantidade={aula.ratingCount} tamanho={14} />

                <div className="sd-view__rate-row">
                  <span className="sd-view__rate-label">Sua nota:</span>
                  <StarRatingInput valorAtual={minhaAvaliacao} onAvaliar={handleAvaliar} desabilitado={avaliando} />
                </div>
                {mensagemAvaliacao && <p className="sd-view__rate-msg">{mensagemAvaliacao}</p>}

                <div className="sd-view__rate-actions">
                  <button type="button" className="sd-view__comments-link" onClick={irParaComentarios}>
                    Ver comentários ({comentariosTotal})
                  </button>
                  <button type="button" className="sd-view__report-btn" onClick={handleDenunciar}>
                    Denunciar
                  </button>
                </div>
              </div>
            </div>

            <div className="sd-view__grid">
              <div className="sd-view__content-box">
                <span className="sd-view__content-label">Texto da aula</span>
                <div className="sd-view__content-text">{aula.content}</div>
              </div>

              <div className="sd-view__medias">
                {aula.medias && aula.medias.length > 0 ? (
                  aula.medias.map((media, i) =>
                    media.type === 'imagem' ? (
                      <div key={i} className="sd-view-media">
                        <img src={`${API_BASE}${media.value}`} alt="" />
                      </div>
                    ) : (
                      <ClassViewYoutube key={i} url={media.value} indice={i} />
                    )
                  )
                ) : (
                  <p className="sd-view__sem-midia">Essa aula não tem mídias adicionais.</p>
                )}
              </div>

              <div className="sd-view__risk">
                <ColorSelect label="Risco" value={aula.dangerLevel} cores={COR_RISCO} somenteLeitura />

                <div className="sd-view__risk-box">
                  <span className="sd-view__risk-title">Alerta de riscos desta aula</span>
                  <p className="sd-view__risk-text">{aula.danger}</p>
                </div>
              </div>
            </div>

            <section id="comentarios" className="sd-view__comments">
              <h2 className="sd-view__comments-title">
                Comentários{comentariosTotal ? ` (${comentariosTotal})` : ''}
              </h2>

              <div className="sd-view__new-comment">
                <textarea
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value.slice(0, LIMITE_COMENTARIO_TEXTO))}
                  placeholder="Escreva um comentário…"
                  maxLength={LIMITE_COMENTARIO_TEXTO}
                />
                <div className="sd-view__new-comment-actions">
                  <span>
                    {novoComentario.length}/{LIMITE_COMENTARIO_TEXTO}
                  </span>
                  <button
                    type="button"
                    onClick={publicarComentario}
                    disabled={enviandoComentario || !novoComentario.trim()}
                  >
                    {enviandoComentario ? 'Publicando…' : 'Publicar'}
                  </button>
                </div>
                {comentarioErro && <p className="sd-view__error">{comentarioErro}</p>}
              </div>

              {comentarios.length === 0 && !comentariosCarregando ? (
                <p className="sd-view__hint">Ainda não há comentários. Seja a primeira pessoa a comentar.</p>
              ) : (
                comentarios.map((c) => (
                  <CommentItem key={c._id} comentario={c} onEnviarResposta={enviarResposta} />
                ))
              )}

              {comentariosPagina < comentariosTotalPaginas && (
                <button
                  type="button"
                  className="sd-view__load-more"
                  onClick={() => buscarComentarios(comentariosPagina + 1, aula.normalizedTitle)}
                  disabled={comentariosCarregando}
                >
                  {comentariosCarregando ? 'Carregando…' : 'Carregar mais comentários'}
                </button>
              )}
            </section>
          </>
        )}
      </main>

      {denunciaAberta && (
        <ClassReportModal classId={classId} onClose={() => setDenunciaAberta(false)} />
      )}

      {avisoLoginAberto && (
        <div className="sd-report-modal__overlay" onClick={() => setAvisoLoginAberto(false)} style={{ zIndex: 9999 }}>
          <div className="sd-report-modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <h2 className="sd-report-modal__title">Faça login</h2>
            <p className="sd-report-modal__subtitle" style={{ marginBottom: '1.5rem' }}>
              Você precisa estar conectado para interagir com esta aula.
            </p>
            <div className="sd-report-modal__actions" style={{ justifyContent: 'center', marginTop: '1rem' }}>
              <button type="button" className="sd-report-modal__cancel" onClick={() => setAvisoLoginAberto(false)}>
                Voltar
              </button>
              <button type="button" className="sd-report-modal__submit" onClick={() => navigate('/login')}>
                Fazer Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClassViewYoutube({ url, indice }) {
  const id = extrairIdYoutube(url);
  if (!id) return null;
  return (
    <div className="sd-view-media">
      <iframe
        className="sd-view-media__embed"
        src={`https://www.youtube.com/embed/${id}`}
        title={`Vídeo da aula ${indice + 1}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}