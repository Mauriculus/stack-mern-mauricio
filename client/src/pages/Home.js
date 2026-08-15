import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import '../styles/Home.css';

const CATEGORIAS = [
  {
    indice: '01',
    titulo: 'Cozinha',
    descricao: 'Do arroz no ponto às compras da semana sem desperdício.',
  },
  {
    indice: '02',
    titulo: 'Limpeza & organização',
    descricao: 'Rotinas que não tomam o fim de semana inteiro.',
  },
  {
    indice: '03',
    titulo: 'Consertos & manutenção',
    descricao: 'Antes de chamar alguém, tenta resolver você mesmo.',
  },
  {
    indice: '04',
    titulo: 'Financeiro & contas',
    descricao: 'Boleto, aluguel, imposto — sem enrolação.',
  },
  {
    indice: '05',
    titulo: 'Segurança & emergências',
    descricao: 'O que fazer quando alguma coisa dá errado de verdade.',
  },
  {
    indice: '06',
    titulo: 'Documentos & burocracia',
    descricao: 'Aquela papelada que ninguém te explica antes de precisar.',
  },
];

export default function Home() {
  return (
    <div className="sd-home">
      <Sidebar />

      <main className="sd-home__main">
        {/* mesmo motivo de circuito das telas de auth, bem discreto, só pra
            amarrar visualmente a home ao resto do app */}
        <svg
          className="sd-home__blueprint"
          viewBox="0 0 320 420"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <g className="sd-home__pipes">
            <path d="M -20 80 H 140 V 20 H 340" />
            <path d="M -20 200 H 100 V 260 H 240 V 200 H 340" />
            <path d="M -20 340 H 180 V 400 H 340" />
          </g>
          <g className="sd-home__nodes">
            <circle cx="140" cy="80" r="4" />
            <circle cx="140" cy="20" r="4" />
            <circle cx="100" cy="200" r="4" />
            <circle cx="240" cy="260" r="4" />
            <circle cx="180" cy="340" r="4" />
          </g>
        </svg>

        <section className="sd-home__hero">
          <span className="sd-home__eyebrow">
            <span className="sd-home__eyebrow-dot" aria-hidden="true" />
            central de aprendizado
          </span>
          <h1 className="sd-home__title">Sua casa, sob o seu controle.</h1>
          <p className="sd-home__subtitle">
            Aulas curtas, feitas por gente que também teve que aprender do zero — pra quem está
            saindo de casa dos pais e não quer descobrir tudo na marra.
          </p>
          <div className="sd-home__actions">
            <Link to="/pesquisar" className="sd-home__button">
              Explorar aulas
            </Link>
            <Link to="/criar-aula" className="sd-home__button sd-home__button--ghost">
              Criar uma aula
            </Link>
          </div>
        </section>

        <section className="sd-home__section">
          <h2 className="sd-home__section-title">Por onde começar</h2>
          <div className="sd-home__grid">
            {CATEGORIAS.map((cat) => (
              <Link
                key={cat.indice}
                to={`/pesquisar?categoria=${encodeURIComponent(cat.titulo)}`}
                className="sd-home__tile"
              >
                <span className="sd-home__tile-index">{cat.indice}</span>
                <h3 className="sd-home__tile-title">{cat.titulo}</h3>
                <p className="sd-home__tile-text">{cat.descricao}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="sd-home__section">
          <h2 className="sd-home__section-title">Aulas recentes da comunidade</h2>
          <div className="sd-home__empty">
            <p className="sd-home__empty-text">
              Ainda não há aulas publicadas por aqui.
            </p>
            <Link to="/criar-aula" className="sd-home__button">
              Seja a primeira pessoa a criar uma
            </Link>
          </div>
        </section>
      </main>

      <footer className="sd-home__footer">
        <span>
          Envie feedback ou aplique para se tornar um administrador para:{' '}
          mauroscan20@gmail.com
        </span>
      </footer>
    </div>
  );
}