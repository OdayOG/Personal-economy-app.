
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function OpretKontoPage() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        form.reset();
      }
    } catch {
      setMessage("Kunne ikke oprette konto. Prøv igen.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="account-page">
      <section className="account-card">
        <Link href="/" className="back-link">
  ← Tilbage til forsiden
</Link>
        <p className="small-title">Kom i gang</p>
        <h1>Opret din konto</h1>
        <p>Få et bedre overblik over din økonomi.</p>

        <form className="account-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Navn</label>
          <input id="name" name="name" type="text" required />

          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" required />

          <label htmlFor="password">Adgangskode</label>
          <input id="password" name="password" type="password" required />

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Opretter konto..." : "Opret konto"}
          </button>

          {message && <p className="form-message">{message}</p>}
        </form>
      </section>
    </main>
  );
}