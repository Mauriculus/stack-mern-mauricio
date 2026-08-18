import { useState } from 'react';
import '../styles/CommentItem.css';

const LIMITE_RESPOSTA = 500;

function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

function LinhaComentario({ comentario, indentado, podeResponder, aoResponder }) {
  return (
    <div className={`sd-comment ${indentado ? 'sd-comment--resposta' : ''}`}>
      <span className="sd-comment__avatar" aria-hidden="true">
        {comentario.author?.username?.[0]?.toUpperCase() || '?'}
      </span>
      <div className="sd-comment__body">
        <div className="sd-comment__meta">
          <span className="sd-comment__autor">{comentario.author?.username}</span>
          <span className="sd-comment__data">{formatarData(comentario.createdAt)}</span>
        </div>
        <p className="sd-comment__texto">{comentario.content}</p>
        {podeResponder && (
          <button type="button" className="sd-comment__responder" onClick={aoResponder}>
            Responder
          </button>
        )}
      </div>
    </div>
  );
}

export default function CommentItem({ comentario, onEnviarResposta }) {
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
      <LinhaComentario comentario={comentario} podeResponder aoResponder={() => setRespondendo((v) => !v)} />

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
            <LinhaComentario key={resposta._id} comentario={resposta} indentado />
          ))}
        </div>
      )}
    </div>
  );
}
