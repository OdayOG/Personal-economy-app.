"use client";

import { FormEvent, useState } from "react";

export default function AddTransactionForm() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: formData.get("amount"),
          type: formData.get("type"),
          category: formData.get("category"),
          description: formData.get("description"),
          date: formData.get("date"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setMessage("Transaktionen er gemt.");
      event.currentTarget.reset();
    } catch {
      setMessage("Der opstod en fejl. Prøv igen.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="account-card">
      <p className="small-title">Ny transaktion</p>
      <h2>Tilføj indtægt eller udgift</h2>

      <form className="account-form" onSubmit={handleSubmit}>
        <label htmlFor="type">Type</label>
        <select id="type" name="type" defaultValue="EXPENSE">
          <option value="EXPENSE">Udgift</option>
          <option value="INCOME">Indtægt</option>
        </select>

        <label htmlFor="amount">Beløb</label>
        <input
          id="amount"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Fx 125.50"
          required
        />

        <label htmlFor="category">Kategori</label>
        <input
          id="category"
          name="category"
          list="categories"
          placeholder="Fx Mad"
          required
        />
        <datalist id="categories">
          <option value="Mad" />
          <option value="Transport" />
          <option value="Bolig" />
          <option value="Fritid" />
          <option value="Løn" />
          <option value="Andet" />
        </datalist>

        <label htmlFor="description">Beskrivelse (valgfri)</label>
        <input
          id="description"
          name="description"
          type="text"
          placeholder="Fx Indkøb i Netto"
        />

        <label htmlFor="date">Dato</label>
        <input id="date" name="date" type="date" required />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Gemmer..." : "Gem transaktion"}
        </button>

        {message && <p>{message}</p>}
      </form>
    </section>
  );
}