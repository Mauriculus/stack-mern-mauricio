import { useState } from 'react';
import { API_BASE } from '../utils/classTaxonomia';
import '../styles/CommentItem.css';

const LIMITE_RESPOSTA = 500;

function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

function LinhaComentario({ comentario, indentado, podeResponder, aoResponder, podeExcluir, aoExcluir }) {
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const confirmarExclusao = async () => {
    setExcluindo(true);
    await aoExcluir();
    setExcluindo(false);
    setConfirmando(false);
  };

  return (
    <div className={`sd-comment ${indentado ? 'sd-comment--resposta' : ''}`}>
      <span className="sd-comment__avatar" aria-hidden="true">
        {comentario.author?.profilePicture ? (
          <img
            src={`${API_BASE}/uploads/${comentario.author.profilePicture}`}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          />
        ) : (
          comentario.author?.username?.[0]?.toUpperCase() || '?'
        )}
      </span>
      <div className="sd-comment__body">
        <div className="sd-comment__meta">
          <span className="sd-comment__autor">{comentario.author?.username}</span>
          <span className="sd-comment__data">{formatarData(comentario.createdAt)}</span>
        </div>
        <p className="sd-comment__texto">{comentario.content}</p>

        <div className="sd-comment__actions">
          {podeResponder && (
            <button type="button" className="sd-comment__responder" onClick={aoResponder}>
              Responder
            </button>
          )}

          {podeExcluir &&
            (confirmando ? (
              <span className="sd-comment__confirm">
                Excluir?
                <button type="button" onClick={confirmarExclusao} disabled={excluindo}>
                  {excluindo ? '...' : 'Sim'}
                </button>
                <button type="button" onClick={() => setConfirmando(false)} disabled={excluindo}>
                  Não
                </button>
              </span>
            ) : (
              <button
                type="button"
                className="sd-comment__excluir"
                onClick={() => setConfirmando(true)}
                aria-label="Excluir (administração)"
                title="Excluir (administração)"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

export default function CommentItem({ comentario, onEnviarResposta, souAdmin, onExcluirComentario, onExcluirResposta }) {
  const [respostasAbertas, setRespostasAbertas] = useState(false);
  const [respondendo, setRespondendo] = useState(false);
  const [textoResposta, setTextoResposta] = useState('');
  const [enviando, setEnviando] = useState(false);

  const temRespostas = comentario.responses?.length > 0;

  const enviarResposta = async () => {
    if (!textoResposta.trim()) return;
    setEnviando(true);
    const ok = await onEnviarResposta(comentario._id, textoResposta.trim());
    setEnviando(false);
    if (ok) {
      setTextoResposta('');
      setRespondendo(false);
      setRespostasAbertas(true);
    }
  };

  return (
    <div className="sd-comment-thread">
      <LinhaComentario
        comentario={comentario}
        podeResponder
        aoResponder={() => setRespondendo((v) => !v)}
        podeExcluir={souAdmin}
        aoExcluir={() => onExcluirComentario(comentario._id)}
      />

      {respondendo && (
        <div className="sd-comment-reply-box">
          <textarea
            value={textoResposta}
            onChange={(e) => setTextoResposta(e.target.value.slice(0, LIMITE_RESPOSTA))}
            placeholder="Escreva uma resposta…"
            maxLength={LIMITE_RESPOSTA}
          />
          <div className="sd-comment-reply-box__actions">
            <span>
              {textoResposta.length}/{LIMITE_RESPOSTA}
            </span>
            <button type="button" onClick={enviarResposta} disabled={enviando || !textoResposta.trim()}>
              {enviando ? 'Enviando…' : 'Responder'}
            </button>
          </div>
        </div>
      )}

      {temRespostas && (
        <button
          type="button"
          className="sd-comment__toggle-respostas"
          onClick={() => setRespostasAbertas((v) => !v)}
        >
          {respostasAbertas ? 'Ocultar' : 'Mostrar'} respostas ({comentario.responses.length})
        </button>
      )}

      {respostasAbertas && (
        <div className="sd-comment__respostas">
          {/* respostas não têm botão de responder — não dá pra encadear mais um nível */}
          {comentario.responses.map((resposta) => (
            <LinhaComentario
              key={resposta._id}
              comentario={resposta}
              indentado
              podeExcluir={souAdmin}
              aoExcluir={() => onExcluirResposta(resposta._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}