import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ColorSelect from '../components/ColorSelect';
import EstrelaRating from '../components/EstrelaRating';
import { API_BASE, COR_ASSUNTO, COR_RISCO, extrairIdYoutube } from '../utils/classTaxonomia';
import '../styles/ClassView.css';

const LIMITE_CONTEUDO = 4000;

export default function EditClass() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [aula, setAula] = useState(null);
  const [conteudo, setConteudo] = useState('');
  const [riscoTexto, setRiscoTexto] = useState('');
  
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let cancelado = false;

    const buscarAula = async () => {
      setCarregando(true);
      try {
        const response = await fetch(`${API_BASE}/api/classes/getById/${encodeURIComponent(classId)}`);
        const data = await response.json();

        if (cancelado) return;

        if (!response.ok) {
          setErro(data.mensagem || 'Não foi possível carregar a aula');
          return;
        }

        setAula(data);
        setConteudo(data.content || '');
        setRiscoTexto(data.danger || '');
      } catch (err) {
        if (!cancelado) setErro('Erro ao conectar com o servidor');
      } finally {
        if (!cancelado) setCarregando(false);
      }
    };

    buscarAula();
    return () => { cancelado = true; };
  }, [classId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!conteudo.trim() || !riscoTexto.trim()) {
      setErro('Preencha os campos obrigatórios (conteúdo e riscos).');
      return;
    }

    setSalvando(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/classes/edit/${classId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          newContent: conteudo.trim(),
          newDanger: riscoTexto.trim()
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErro(data.mensagem || 'Erro ao editar a aula');
        return;
      }

      navigate(`/aula/${classId}`);
    } catch (error) {
      setErro('Erro ao conectar com o servidor');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="sd-view">
      <Sidebar />

      <main className="sd-view__main">
        {carregando ? (
          <p className="sd-view__hint">Carregando…</p>
        ) : erro && !aula ? (
          <p className="sd-view__error">{erro}</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="sd-view__hero">
              <h1 className="sd-view__title">Editando: {aula.title}</h1>
            </div>

            <div className="sd-view__toolbar">
              <ColorSelect label="Tema" value={aula.subject} cores={COR_ASSUNTO} somenteLeitura />

              <div className="sd-view__cover">
                <span className="sd-view__cover-label">Foto de capa</span>
                <div className="sd-view__cover-box">
                  {aula.cover && <img src={`${API_BASE}${aula.cover}`} alt="" />}
                </div>
              </div>

              <div className="sd-view__rate-panel" style={{ minWidth: 'auto', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => navigate(-1)} style={{ padding: '0.6rem 1.5rem', borderRadius: '999px', border: '1px solid var(--sd-navy)', background: 'transparent', color: 'var(--sd-navy)', fontWeight: '600', cursor: 'pointer' }} disabled={salvando}>
                    Cancelar
                  </button>
                  <button type="submit" style={{ padding: '0.6rem 1.5rem', borderRadius: '999px', border: 'none', background: 'var(--sd-navy)', color: '#fff', fontWeight: '600', cursor: 'pointer' }} disabled={salvando}>
                    {salvando ? 'Salvando…' : 'Salvar alterações'}
                  </button>
                </div>
              </div>
            </div>

            {erro && <p className="sd-view__error">{erro}</p>}

            <div className="sd-view__grid">
              <div className="sd-view__content-box">
                <label htmlFor="conteudo" className="sd-view__content-label">Texto da aula (Editável)</label>
                <textarea
                  id="conteudo"
                  className="sd-view__content-text"
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value.slice(0, LIMITE_CONTEUDO))}
                  style={{ width: '100%', boxSizing: 'border-box', background: 'transparent', border: 'none', resize: 'none', outline: 'none' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--sd-text-soft)', textAlign: 'right', display: 'block', marginTop: '0.5rem' }}>
                  {conteudo.length}/{LIMITE_CONTEUDO}
                </span>
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
                  <label htmlFor="riscoTexto" className="sd-view__risk-title">Alerta de riscos desta aula (Editável)</label>
                  <textarea
                    id="riscoTexto"
                    className="sd-view__risk-text"
                    value={riscoTexto}
                    onChange={(e) => setRiscoTexto(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', background: 'transparent', border: 'none', resize: 'none', outline: 'none' }}
                  />
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
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
