import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ClassCard from '../components/ClassCard';
import ClassDetailModal from '../components/ClassDetailModal';
import { API_BASE, ASSUNTOS, COR_ASSUNTO } from '../utils/classTaxonomia';
import '../styles/Search.css';

const LIMITE_RESULTADOS = 12;
const LIMITE_SEGUIDOS = 8;

export default function Search() {
  const [searchParams] = useSearchParams();
  const [termo, setTermo] = useState('');
  const [assuntosSelecionados, setAssuntosSelecionados] = useState(() => {
    const categoria = searchParams.get('categoria');
    return categoria && ASSUNTOS.includes(categoria) ? [categoria] : [];
  });

  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const filtrosRef = useRef(null);

  const [destaque, setDestaque] = useState([]);

  const [resultados, setResultados] = useState([]);
  const [resultadosPagina, setResultadosPagina] = useState(1);
  const [resultadosTotalPaginas, setResultadosTotalPaginas] = useState(1);
  const [primeiraCarga, setPrimeiraCarga] = useState(true);
  const [buscando, setBuscando] = useState(true);
  const [erro, setErro] = useState('');

  const [seguidos, setSeguidos] = useState([]);
  const [seguidosPagina, setSeguidosPagina] = useState(0);
  const [seguidosTotalPaginas, setSeguidosTotalPaginas] = useState(0);
  const [seguidosCarregando, setSeguidosCarregando] = useState(false);

  const [aulaSelecionada, setAulaSelecionada] = useState(null);

  const emBusca = termo.trim() !== '' || assuntosSelecionados.length > 0;

  // fecha o painel de filtros ao clicar fora dele
  useEffect(() => {
    if (!filtrosAbertos) return undefined;
    const aoClicarFora = (e) => {
      if (filtrosRef.current && !filtrosRef.current.contains(e.target)) {
        setFiltrosAbertos(false);
      }
    };
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, [filtrosAbertos]);

  const buscar = useCallback(
    async (pagina = 1) => {
      setBuscando(true);
      setErro('');

      try {
        const params = new URLSearchParams();
        if (termo.trim()) params.set('q', termo.trim());
        assuntosSelecionados.forEach((assunto) => params.append('subject', assunto));
        params.set('page', String(pagina));
        params.set('limit', String(LIMITE_RESULTADOS));

        const response = await fetch(`${API_BASE}/api/classes/search?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          setErro(data.mensagem || 'Não foi possível buscar as aulas');
          if (pagina === 1) setResultados([]);
          return;
        }

        const lista = Array.isArray(data.mensagem) ? data.mensagem : [];
        setResultados((atual) => (pagina === 1 ? lista : [...atual, ...lista]));
        setResultadosPagina(pagina);
        setResultadosTotalPaginas(data.totalPages || 1);

        if (pagina === 1 && !termo.trim() && assuntosSelecionados.length === 0) {
          setDestaque(lista.slice(0, 7));
        }
      } catch (error) {
        setErro('Erro ao conectar com o servidor');
        if (pagina === 1) setResultados([]);
      } finally {
        setBuscando(false);
        setPrimeiraCarga(false);
      }
    },
    [termo, assuntosSelecionados]
  );

  // toda mudança na busca/filtro volta pra página 1, com um pequeno debounce
  useEffect(() => {
    const timer = setTimeout(() => buscar(1), 350);
    return () => clearTimeout(timer);
  }, [buscar]);

  const carregarSeguidos = useCallback(async (pagina) => {
    setSeguidosCarregando(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ page: String(pagina), limit: String(LIMITE_SEGUIDOS) });
      const response = await fetch(`${API_BASE}/api/classes/getFollowing?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();

      if (response.ok) {
        setSeguidos((atual) => (pagina === 1 ? data.classes || [] : [...atual, ...(data.classes || [])]));
        setSeguidosPagina(pagina);
        setSeguidosTotalPaginas(data.totalPages || 0);
      }
    } catch (error) {
      // seção secundária — se falhar, some discretamente em vez de travar a página inteira
    } finally {
      setSeguidosCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarSeguidos(1);
  }, [carregarSeguidos]);

  const alternarAssunto = (assunto) => {
    setAssuntosSelecionados((atual) =>
      atual.includes(assunto) ? atual.filter((a) => a !== assunto) : [...atual, assunto]
    );
  };

  return (
    <div className="sd-search">
      <Sidebar />

      <main className="sd-search__main">
        <div className="sd-search__topbar">
          <div className="sd-search__input-wrap">
            <svg viewBox="0 0 24 24" width="20" height="20" className="sd-search__input-icon" aria-hidden="true">
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M20 20l-4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              placeholder="Pesquise uma aula"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              aria-label="Pesquisar aula"
            />
          </div>

          <div className="sd-search__filter-wrap" ref={filtrosRef}>
            <button
              type="button"
              className={`sd-search__filter-toggle ${assuntosSelecionados.length ? 'is-active' : ''}`}
              onClick={() => setFiltrosAbertos((v) => !v)}
              aria-expanded={filtrosAbertos}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M4 6h16M7 12h10M10 18h4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Filtros
              {assuntosSelecionados.length > 0 && (
                <span className="sd-search__filter-count">{assuntosSelecionados.length}</span>
              )}
            </button>

            {filtrosAbertos && (
              <div className="sd-search__filters">
                <span className="sd-search__filters-label">Assunto</span>
                <div className="sd-search__chips">
                  {ASSUNTOS.map((assunto) => {
                    const selecionado = assuntosSelecionados.includes(assunto);
                    return (
                      <button
                        key={assunto}
                        type="button"
                        className={`sd-search__chip ${selecionado ? 'is-selected' : ''}`}
                        onClick={() => alternarAssunto(assunto)}
                        style={selecionado ? { backgroundColor: COR_ASSUNTO[assunto], borderColor: COR_ASSUNTO[assunto] } : undefined}
                      >
                        {assunto}
                      </button>
                    );
                  })}
                  {assuntosSelecionados.length > 0 && (
                    <button
                      type="button"
                      className="sd-search__chip sd-search__chip--limpar"
                      onClick={() => setAssuntosSelecionados([])}
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {erro && <p className="sd-search__error">{erro}</p>}

        {!emBusca && destaque.length > 0 && (
          <section className="sd-search__section">
            <h2 className="sd-search__section-title">Em destaque</h2>
            <div className="sd-search__grid">
              {destaque.map((aula) => (
                <ClassCard key={aula._id || aula.normalizedTitle} aula={aula} onAbrir={setAulaSelecionada} />
              ))}
            </div>
          </section>
        )}

        {!emBusca && seguidos.length > 0 && (
          <section className="sd-search__section">
            <h2 className="sd-search__section-title">Aulas de quem você segue</h2>
            <div className="sd-search__grid">
              {seguidos.map((aula) => (
                <ClassCard key={aula._id} aula={aula} onAbrir={setAulaSelecionada} />
              ))}
            </div>
            {seguidosPagina < seguidosTotalPaginas && (
              <button
                type="button"
                className="sd-search__load-more"
                onClick={() => carregarSeguidos(seguidosPagina + 1)}
                disabled={seguidosCarregando}
              >
                {seguidosCarregando ? 'Carregando…' : 'Carregar mais'}
              </button>
            )}
          </section>
        )}

        <section className="sd-search__section">
          <h2 className="sd-search__section-title">{emBusca ? 'Resultados' : 'Todas as aulas'}</h2>

          {primeiraCarga ? (
            <p className="sd-search__hint">Buscando…</p>
          ) : resultados.length === 0 && !buscando ? (
            <div className="sd-search__empty">
              <p>Nenhuma aula encontrada{termo.trim() ? ` para “${termo.trim()}”` : ''}.</p>
              <Link to="/criar-aula" className="sd-search__empty-link">
                Que tal criar a primeira sobre esse tema?
              </Link>
            </div>
          ) : (
            <>
              {/* mantém os resultados anteriores visíveis (só esmaecidos) durante
                  uma nova busca, em vez de trocar tudo por um texto de "carregando"
                  e fazer a grade sumir por uma fração de segundo a cada tecla */}
              <div className={`sd-search__grid ${buscando ? 'is-loading' : ''}`}>
                {resultados.map((aula) => (
                  <ClassCard key={aula._id || aula.normalizedTitle} aula={aula} onAbrir={setAulaSelecionada} />
                ))}
              </div>

              {resultadosPagina < resultadosTotalPaginas && (
                <button
                  type="button"
                  className="sd-search__load-more"
                  onClick={() => buscar(resultadosPagina + 1)}
                  disabled={buscando}
                >
                  {buscando ? 'Carregando…' : 'Carregar mais'}
                </button>
              )}
            </>
          )}
        </section>
      </main>

      {aulaSelecionada && (
        <ClassDetailModal
          classTitle={aulaSelecionada.normalizedTitle}
          tituloProvisorio={aulaSelecionada.title}
          onClose={() => setAulaSelecionada(null)}
        />
      )}
    </div>
  );
}