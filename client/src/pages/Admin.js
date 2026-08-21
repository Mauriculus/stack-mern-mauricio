import { useCallback, useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import AdminClassRow from '../components/AdminClassRow';
import AdminReportRow from '../components/AdminReportRow';
import { API_BASE } from '../utils/classTaxonomia';
import '../styles/Admin.css';

const LIMITE = 10;

export default function Admin() {
  const [verificando, setVerificando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  const [aba, setAba] = useState('aulas');

  const [aulas, setAulas] = useState([]);
  const [aulasPagina, setAulasPagina] = useState(0);
  const [aulasTotalPaginas, setAulasTotalPaginas] = useState(0);
  const [aulasCarregando, setAulasCarregando] = useState(false);

  const [reports, setReports] = useState([]);
  const [reportsPagina, setReportsPagina] = useState(0);
  const [reportsTotalPaginas, setReportsTotalPaginas] = useState(0);
  const [reportsCarregando, setReportsCarregando] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const verificar = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/users/me`, { headers: authHeaders() });
        const data = await response.json();
        setAutorizado(response.ok && data.type === 'admin');
      } catch (error) {
        setAutorizado(false);
      } finally {
        setVerificando(false);
      }
    };
    verificar();
  }, []);

  const buscarAulasReportadas = useCallback(async (pagina) => {
    setAulasCarregando(true);
    try {
      const params = new URLSearchParams({ page: String(pagina), limit: String(LIMITE) });
      const response = await fetch(`${API_BASE}/api/admin/getClasses?${params.toString()}`, {
        headers: authHeaders(),
      });
      const data = await response.json();
      if (response.ok) {
        setAulas((atual) => (pagina === 1 ? data.reports || [] : [...atual, ...(data.reports || [])]));
        setAulasPagina(pagina);
        setAulasTotalPaginas(data.totalPages || 0);
      }
    } catch (error) {
      // não trava a página inteira se essa aba falhar
    } finally {
      setAulasCarregando(false);
    }
  }, []);

  const buscarReports = useCallback(async (pagina) => {
    setReportsCarregando(true);
    try {
      const params = new URLSearchParams({ page: String(pagina), limit: String(LIMITE) });
      const response = await fetch(`${API_BASE}/api/admin/getReports?${params.toString()}`, {
        headers: authHeaders(),
      });
      const data = await response.json();
      if (response.ok) {
        setReports((atual) => (pagina === 1 ? data.reports || [] : [...atual, ...(data.reports || [])]));
        setReportsPagina(pagina);
        setReportsTotalPaginas(data.totalPages || 0);
      }
    } catch (error) {
      // idem
    } finally {
      setReportsCarregando(false);
    }
  }, []);

  const excluirAula = async (classId) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/deleteClass/${classId}`, {
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

  useEffect(() => {
    if (!autorizado) return;
    if (aba === 'aulas' && aulasPagina === 0) buscarAulasReportadas(1);
    if (aba === 'denuncias' && reportsPagina === 0) buscarReports(1);
  }, [autorizado, aba, aulasPagina, reportsPagina, buscarAulasReportadas, buscarReports]);

  if (verificando) {
    return (
      <div className="sd-admin">
        <Sidebar />
        <main className="sd-admin__main">
          <p className="sd-admin__hint">Carregando…</p>
        </main>
      </div>
    );
  }

  if (!autorizado) {
    return (
      <div className="sd-admin">
        <Sidebar />
        <main className="sd-admin__main">
          <p className="sd-admin__error">Você não tem acesso a essa área.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="sd-admin">
      <Sidebar />

      <main className="sd-admin__main">
        <h1 className="sd-admin__title">Administração</h1>

        <div className="sd-admin__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={aba === 'aulas'}
            className={`sd-admin__tab ${aba === 'aulas' ? 'is-active' : ''}`}
            onClick={() => setAba('aulas')}
          >
            Aulas mais denunciadas
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={aba === 'denuncias'}
            className={`sd-admin__tab ${aba === 'denuncias' ? 'is-active' : ''}`}
            onClick={() => setAba('denuncias')}
          >
            Denúncias
          </button>
        </div>

        {aba === 'aulas' ? (
          aulas.length === 0 && !aulasCarregando ? (
            <div className="sd-admin__empty">
              <p>Nenhuma aula denunciada até agora.</p>
            </div>
          ) : (
            <>
              {aulas.map((a) => (
                <AdminClassRow key={a._id} aula={a} onExcluir={excluirAula} />
              ))}
              {aulasPagina < aulasTotalPaginas && (
                <button
                  type="button"
                  className="sd-admin__load-more"
                  onClick={() => buscarAulasReportadas(aulasPagina + 1)}
                  disabled={aulasCarregando}
                >
                  {aulasCarregando ? 'Carregando…' : 'Carregar mais'}
                </button>
              )}
            </>
          )
        ) : reports.length === 0 && !reportsCarregando ? (
          <div className="sd-admin__empty">
            <p>Nenhuma denúncia registrada até agora.</p>
          </div>
        ) : (
          <>
            {reports.map((r) => (
              <AdminReportRow key={r._id} report={r} />
            ))}
            {reportsPagina < reportsTotalPaginas && (
              <button
                type="button"
                className="sd-admin__load-more"
                onClick={() => buscarReports(reportsPagina + 1)}
                disabled={reportsCarregando}
              >
                {reportsCarregando ? 'Carregando…' : 'Carregar mais'}
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}