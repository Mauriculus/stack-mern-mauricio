import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MediaSlotInput from '../components/MediaSlotInput';
import { API_BASE, ASSUNTOS } from '../utils/classTaxonomia';
import '../styles/CreateClass.css';

const RISCOS = ['Baixo Risco', 'Médio Risco', 'Alto Risco'];

const SLOT_VAZIO = { tipo: null, arquivo: null, previewUrl: null, youtubeUrl: '', youtubeId: null };

export default function CreateClass() {
  const navigate = useNavigate();
  const capaInputRef = useRef(null);

  const [titulo, setTitulo] = useState('');
  const [tema, setTema] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [riscoNivel, setRiscoNivel] = useState('');
  const [riscoTexto, setRiscoTexto] = useState('');
  const [capaArquivo, setCapaArquivo] = useState(null);
  const [capaPreview, setCapaPreview] = useState(null);
  const [mediaSlots, setMediaSlots] = useState([{ ...SLOT_VAZIO }, { ...SLOT_VAZIO }]);
  const [ajudaAberta, setAjudaAberta] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  const abrirSeletorCapa = () => capaInputRef.current?.click();

  const aoSelecionarCapa = (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setCapaArquivo(arquivo);
    setCapaPreview(URL.createObjectURL(arquivo));
  };

  const atualizarSlot = (indice, novoSlot) => {
    setMediaSlots((atual) => atual.map((slot, i) => (i === indice ? novoSlot : slot)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');

    if (!titulo.trim() || !tema || !conteudo.trim() || !riscoNivel || !riscoTexto.trim()) {
      setMensagem('Preencha todos os campos obrigatórios (título, tema, texto da aula, nível de risco e o alerta de risco).');
      return;
    }
    if (!capaArquivo) {
      setMensagem('A foto de capa é obrigatória.');
      return;
    }

    setEnviando(true);

    try {
      const formData = new FormData();
      formData.append('title', titulo.trim());
      formData.append('content', conteudo.trim());
      formData.append('subject', tema);
      formData.append('danger', riscoTexto.trim());
      formData.append('dangerLevel', riscoNivel);
      formData.append('cover', capaArquivo);

      mediaSlots.forEach((slot) => {
        if (slot.tipo === 'imagem' && slot.arquivo) {
          formData.append('medias', slot.arquivo);
        } else if (slot.tipo === 'youtube' && slot.youtubeId) {
          formData.append('youtubeUrls', slot.youtubeUrl);
        }
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/classes/create`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setMensagem(data.message || data.mensagem || 'Erro ao criar a aula');
        return;
      }

      navigate(`/aula/${data.normalizedTitle}`);
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="sd-create">
      <Sidebar />

      <main className="sd-create__main">
        <form onSubmit={handleSubmit}>
          <div className="sd-create__hero">
            <input
              type="text"
              className="sd-create__title-input"
              placeholder="Insira o título da aula"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={120}
              aria-label="Título da aula"
            />
          </div>

          <div className="sd-create__toolbar">
            <div className="sd-create__field-inline">
              <label htmlFor="tema">Tema</label>
              <select id="tema" value={tema} onChange={(e) => setTema(e.target.value)}>
                <option value="">Selecione</option>
                {ASSUNTOS.map((assunto) => (
                  <option key={assunto} value={assunto}>
                    {assunto}
                  </option>
                ))}
              </select>
            </div>

            <div className="sd-create__cover">
              <span className="sd-create__cover-label">Foto de capa</span>
              <button type="button" className="sd-create__cover-btn" onClick={abrirSeletorCapa}>
                {capaPreview ? (
                  <img src={capaPreview} alt="" />
                ) : (
                  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                    <path d="M12 20V4M5 11l7-7 7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <input
                ref={capaInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                hidden
                onChange={aoSelecionarCapa}
              />
            </div>

            <button type="submit" className="sd-create__publish" disabled={enviando}>
              {enviando ? 'Publicando…' : 'Publicar aula'}
            </button>
          </div>

          {mensagem && (
            <p className="sd-create__error" role="alert">
              {mensagem}
            </p>
          )}

          <div className="sd-create__grid">
            <div className="sd-create__content-box">
              <label htmlFor="conteudo" className="sd-create__content-label">
                Insira o texto da aula
              </label>
              <textarea
                id="conteudo"
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                placeholder="Explique o passo a passo aqui…"
              />
            </div>

            <div className="sd-create__medias">
              <MediaSlotInput slot={mediaSlots[0]} indice={0} onChange={(novo) => atualizarSlot(0, novo)} />
              <MediaSlotInput slot={mediaSlots[1]} indice={1} onChange={(novo) => atualizarSlot(1, novo)} />
            </div>

            <div className="sd-create__risk">
              <div className="sd-create__risk-header">
                <div className="sd-create__field-inline">
                  <label htmlFor="risco">Risco</label>
                  <select id="risco" value={riscoNivel} onChange={(e) => setRiscoNivel(e.target.value)}>
                    <option value="">Selecione</option>
                    {RISCOS.map((risco) => (
                      <option key={risco} value={risco}>
                        {risco}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sd-create__help-wrap">
                  <button
                    type="button"
                    className="sd-create__help"
                    onClick={() => setAjudaAberta((v) => !v)}
                    aria-label="O que significa cada nível de risco?"
                    aria-expanded={ajudaAberta}
                  >
                    ?
                  </button>
                  {ajudaAberta && (
                    <div className="sd-create__help-panel">
                      <p>
                        <strong>Baixo risco:</strong> atividade simples, sem chance real de acidente sério.
                      </p>
                      <p>
                        <strong>Médio risco:</strong> exige atenção e alguns cuidados básicos, mas é controlável.
                      </p>
                      <p>
                        <strong>Alto risco:</strong> risco real de choque, queimadura, corte grave ou intoxicação — recomende supervisão e proteção.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="sd-create__risk-box">
                <span className="sd-create__risk-title">Alerte dos possíveis riscos desta aula</span>
                <textarea
                  value={riscoTexto}
                  onChange={(e) => setRiscoTexto(e.target.value)}
                  placeholder="Ex.: risco de choque elétrico — desligue o disjuntor antes de começar."
                />
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
