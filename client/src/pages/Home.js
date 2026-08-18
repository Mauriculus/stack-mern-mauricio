import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import '../styles/Home.css';

const CATEGORIAS = [
  {
    indice: '01',
    titulo: 'Elétrica',
    descricao: 'Trocar uma tomada, entender o disjuntor, mexer sem levar susto.',
  },
  {
    indice: '02',
    titulo: 'Hidráulica',
    descricao: 'Vazamento, entupimento, registro — o básico pra não inundar a casa.',
  },
  {
    indice: '03',
    titulo: 'Eletrodomésticos',
    descricao: 'Usar, limpar e consertar o que já tem, sem chamar assistência pra tudo.',
  },
  {
    indice: '04',
    titulo: 'Limpeza',
    descricao: 'Rotinas que não tomam o fim de semana inteiro.',
  },
  {
    indice: '05',
    titulo: 'Culinária',
    descricao: 'Do arroz no ponto às compras da semana sem desperdício.',
  },
  {
    indice: '06',
    titulo: 'Costura',
    descricao: 'Pregar um botão, ajustar uma barra, resolver sem depender de costureira.',
  },
];

export default function Home() {
  return (
    <div className="sd-home">
      <Sidebar />

      <main className="sd-home__main">
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
          <h2 className="sd-home__section-title">Compartilhe o que você sabe</h2>
          <div className="sd-home__empty">
            <p className="sd-home__empty-text">
              Toda aula começa com alguém disposto a ensinar.
            </p>
            <Link to="/criar-aula" className="sd-home__button">
              Criar uma aula
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