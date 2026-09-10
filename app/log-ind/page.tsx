
import Link from "next/link";

export default function LogIndPage() {
  return (
    <main className="account-page">
      <section className="account-card">
        <Link href="/" className="back-link">
          ← Tilbage til forsiden
        </Link>

        <p className="small-title">Velkommen tilbage</p>
        <h1>Log ind</h1>
        <p>Log ind for at se din personlige økonomi.</p>

        <form className="account-form">
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" required />

          <label htmlFor="password">Adgangskode</label>
          <input id="password" name="password" type="password" required />

          <button type="button">Log ind</button>
        </form>
      </section>
    </main>
  );
}