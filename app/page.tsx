import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="homepage">
      <header className="top-menu">
        <p className="app-name">Personlig <span style={{ color: '#3e9b6d' }}>økonomi</span></p>

        <nav className="menu-links">
          <a href="#funktioner">Funktioner</a>
          <a href="#om-appen">Om appen</a>
          <Link href="/log-ind" className="login-button">
            Log ind
          </Link>
        </nav>
      </header>

      <section className="welcome-section">
        <p className="small-title">Få overblik over din økonomi</p>

        <h1>Tag styring over <br />dine <span style={{ color: '#3e9b6d' }}>penge</span>.</h1>



        <p className="welcome-text">
          Registrér indtægter og udgifter, sæt budgetter <br />og følg dit forbrug
          ét sted.
        </p>

        <div className="welcome-buttons">
          <Link href="/opret-konto" className="primary-button">
            Opret konto
            </Link>
          <a href="#funktioner" className="secondary-button">
  Se funktioner
</a>
        </div>
      </section>
      <section className="features-section" id="funktioner">
  <p className="small-title">Alt samlet ét sted</p>

  <h2>Gør økonomi nemmere at forstå.</h2>

  <p className="features-description">
    Personlig økonomi hjælper dig med at holde styr på dine penge i hverdagen.
  </p>

  <div className="feature-cards">
    <article className="feature-card">
      <Image
      src="/images/transaktioner.png.png"
      alt="Illustration af transaktioner"
      width={140}
      height={140}
      className="feature-image"
/>
      <h3>Transaktioner</h3>
      <p>Registrér nemt dine indtægter og udgifter.</p>
    </article>

    <article className="feature-card">
       <Image
      src="/images/budgetter.png.png"
      alt="Illustration af budgetter"
      width={140}
      height={140}
      className="feature-image"
      />

      <h3>Budgetter</h3>
      <p>Sæt et budget og følg dit forbrug måned for måned.</p>
    </article>

    <article className="feature-card">
       <Image
      src="/images/overblik.png.png"
      alt="Illustration af overblik"
      width={140}
      height={140}
      className="feature-image"
      />

      <h3>Overblik</h3>
      <p>Se balance, kategorier og udvikling samlet ét sted.</p>
    </article>
  </div>
</section>
<section className="steps-section" id="om-appen">
  <p className="small-title">Sådan virker det</p>

  <h2>Kom godt i gang på få minutter.</h2>

  <div className="steps">
    <article className="step">
      <p className="step-number">01</p>
      <h3>Opret en konto</h3>
      <p>Lav din personlige profil og få et sikkert overblik.</p>
    </article>

    <article className="step">
      <p className="step-number">02</p>
      <h3>Tilføj transaktioner</h3>
      <p>Registrér indtægter og udgifter i de rigtige kategorier.</p>
    </article>

    <article className="step">
      <p className="step-number">03</p>
      <h3>Følg din økonomi</h3>
      <p>Se dit forbrug, dine budgetter og din udvikling.</p>
    </article>
  </div>
</section>
<section className="cta-section">
  <p className="small-title">Din økonomi, dit overblik</p>

  <h2>Klar til at tage styringen?</h2>

  <p>
    Opret en konto og begynd at få overblik over dine indtægter, udgifter og
    budgetter.
  </p>

  <Link href="/opret-konto" className="primary-button">
  Opret konto
</Link>
</section>
    </main>
  );
}

