export default function Home() {
  return (
    <main className="landing-page">
      <section className="hero-section">
        <p className="app-label">Personlig økonomi-app</p>
        <h1 className="hero-heading">Få overblik over din økonomi.</h1>
        <p className="hero-description">
          Registrér indtægter og udgifter, sæt månedlige budgetter og forstå,
          hvor dine penge bliver af.
        </p>
        <div className="button-group">
          <button className="primary-button">Kom i gang</button>
          <button className="secondary-button">Se funktioner</button>
        </div>
        <div className="feature-list">
          <article className="feature-card"><h2>Transaktioner</h2><p>Hold styr på indtægter og udgifter.</p></article>
          <article className="feature-card"><h2>Budgetter</h2><p>Sæt en grænse for dit forbrug.</p></article>
          <article className="feature-card"><h2>Overblik</h2><p>Se dit forbrug samlet ét sted.</p></article>
        </div>
      </section>
    </main>
  );
}
