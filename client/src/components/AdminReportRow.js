import { Link } from 'react-router-dom';
import '../styles/AdminReportRow.css';

function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function AdminReportRow({ report }) {
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

      {report.text && <p className="sd-admin-report__text">{report.text}</p>}
    </div>
  );
}
