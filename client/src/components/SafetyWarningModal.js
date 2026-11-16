import '../styles/SafetyWarningModal.css';

export default function SafetyWarningModal({ onClose }) {
  return (
    <div className="sd-safety-modal__overlay" onClick={onClose}>
      <div className="sd-safety-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="sd-safety-modal__title">Se não tiver certeza não faça!</h2>

        <p className="sd-safety-modal__intro">
          Preze primeiramente sempre pela sua segurança e por seu lar
        </p>

        <ul className="sd-safety-modal__list">
          <li>
            Se for mexer com eletricidade <strong>desligue o disjuntor</strong>
          </li>
          <li>
            Se for furar uma parede <strong>saiba se não tem um cano</strong> ali
          </li>
          <li>
            Se for subir em um lugar alto <strong>garanta que está seguro</strong>
          </li>
        </ul>

        <button type="button" className="sd-safety-modal__close" onClick={onClose}>
          Entendi
        </button>
      </div>
    </div>
  );
}
