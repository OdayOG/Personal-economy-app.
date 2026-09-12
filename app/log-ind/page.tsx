"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LogIndPage() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      window.location.href = "/oversigt";
    } catch {
      setMessage("Der opstod en fejl. Prøv igen.");
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

        <p className="small-title">Velkommen tilbage</p>
        <h1>Log ind</h1>
        <p>Log ind for at se din personlige økonomi.</p>

        <form className="account-form" onSubmit={handleSubmit}>
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" required />

          <label htmlFor="password">Adgangskode</label>
          <input id="password" name="password" type="password" required />

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logger ind..." : "Log ind"}
          </button>

          {message && <p>{message}</p>}
        </form>
      </section>
    </main>
  );
}