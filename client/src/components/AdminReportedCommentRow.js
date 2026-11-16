import { Link } from 'react-router-dom';
import { useState } from 'react';
import '../styles/AdminReportRow.css';
import '../styles/AdminReportedCommentRow.css';

function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function AdminReportedCommentRow({ report, onExcluir }) {
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const ehResposta = report.type === 'Reposta';
  const item = ehResposta ? report.response : report.comment;

  const confirmarExclusao = async () => {
    setExcluindo(true);
    const ok = await onExcluir(item._id, ehResposta ? 'resposta' : 'comentario');
    setExcluindo(false);
    if (!ok) setConfirmando(false);
  };

  return (
    <div className="sd-admin-report">
      <div className="sd-admin-report__header">
        <span className="sd-admin-report__reason">{report.reason}</span>
        <span className="sd-admin-report__date">{formatarData(report.createdAt)}</span>
      </div>

      {report.class ? (
        <Link to={`/aula/${report.class._id}`} className="sd-admin-report__class">
          {report.class.title}
        </Link>
      ) : (
        <span className="sd-admin-report__class sd-admin-report__class--removida">
          Aula já removida
        </span>
      )}

      {item ? (
        <p className="sd-admin-report__text">
          {ehResposta ? 'Resposta' : 'Comentário'} de {item.authorUsername}: "{item.content}"
        </p>
      ) : (
        <p className="sd-admin-report__text sd-admin-report__text--removido">
          {ehResposta ? 'Resposta' : 'Comentário'} já removido(a)
        </p>
      )}

      {report.text && <p className="sd-admin-report__text">{report.text}</p>}

      {item && (
        <div className="sd-admin-report__footer">
          {confirmando ? (
            <span className="sd-admin-report__confirm">
              Excluir {ehResposta ? 'resposta' : 'comentário'}?
              <button type="button" onClick={confirmarExclusao} disabled={excluindo}>
                {excluindo ? '...' : 'Sim'}
              </button>
              <button type="button" onClick={() => setConfirmando(false)} disabled={excluindo}>
                Não
              </button>
            </span>
          ) : (
            <button type="button" className="sd-admin-report__excluir" onClick={() => setConfirmando(true)}>
              Excluir {ehResposta ? 'resposta' : 'comentário'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}