import '../styles.css';
import Sidebar from './Sidebar';

const headingStyle = {
    color: 'var(--azulPrincipal)',
    fontFamily: 'Bricolage Grotesque, sans-serif',
};

const cardStyle = {
    backgroundColor: 'var(--brancoPrincipal)',
    border: '4px solid var(--azulPrincipal)',
    borderRadius: '15px',
    minHeight: '220px',
};

const buttonStyle = {
    backgroundColor: 'var(--azulPrincipal)',
    color: 'var(--brancoPrincipal)',
    border: '3px solid #FFFFFF',
    borderRadius: '20px',
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontSize: '15pt',
    fontWeight: 700,
    padding: '10px 20px',
};

function PrimeiroCard() {
    return (
        <div className='card w-75 mx-auto content-card' style={cardStyle}>
            <div className='card-body d-flex flex-column justify-content-between p-4'>
                <h2
                    className='text-center mb-0'
                    style={{
                        ...headingStyle,
                        fontSize: '25pt',
                        fontWeight: 500,
                    }}
                >
                    Aprenda o essencial para cuidar de casa
                </h2>

                <div className='d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-end gap-3 mt-4'>
                    <p
                        className='mb-0'
                        style={{
                            ...headingStyle,
                            fontSize: '18pt',
                        }}
                    >
                        Assita à aulas criadas pela comunidade sobre temas cruciais para manter seu lar!
                    </p>
                    <button className='btn' style={buttonStyle}>
                        Aprender
                    </button>
                </div>
            </div>
        </div>
    );
}

function SegundoCard() {
    return (
        <div className='card w-75 mx-auto content-card' style={cardStyle}>
            <div className='card-body d-flex flex-column justify-content-between p-4'>
                <h2
                    className='text-center mb-0'
                    style={{
                        ...headingStyle,
                        fontSize: '25pt',
                        fontWeight: 500,
                    }}
                >
                    Crie suas próprias aulas 
                </h2>

                <div className='d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-end gap-3 mt-4'>
                    <p
                        className='mb-0'
                        style={{
                            ...headingStyle,
                            fontSize: '18pt',
                        }}
                    >
                        Quer ensinar outras pessoas como você? Crie uma aula você mesmo! Lembre-se de seguir as diretrizes da comunidade 
                    </p>
                    <button className='btn' style={buttonStyle}>
                        Criar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Home2() {
    return (
        <div className='w-100 min-vh-100 home2-page' style={{ backgroundColor: 'var(--brancoPrincipal)' }}>
            <Sidebar />
            <main
                className='d-flex flex-column align-items-center gap-4 px-3 main-layout'
            >
                <h1
                    className='text-center mb-0'
                    style={{
                        ...headingStyle,
                        fontSize: '60px',
                        fontWeight: 600,
                    }}
                >
                    Sobrevivência Doméstica
                </h1>

                <section className='w-100 pb-4 pt-3 content-wrap'>
                    <div className='d-flex flex-column cards-gap'>
                        <PrimeiroCard />
                        <SegundoCard />
                    </div>
                    <img
                        src='/images/imagemHome2.png'
                        alt=''
                        aria-hidden='true'
                        className='right-image'
                    />
                </section>
            </main>

            <div className='bottom-bar d-flex align-items-center justify-content-center text-center'>
                <span className='bottom-bar-text'>Envie feedback ou aplique para se tornar um administrador para mauroscan20@gmail.com</span>
            </div>
        </div>
    );
}
