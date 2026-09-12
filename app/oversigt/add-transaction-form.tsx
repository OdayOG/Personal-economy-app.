"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddTransactionForm() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
      router.refresh();
    } catch {
      setMessage("Der opstod en fejl. Prøv igen.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="dashboard-card transaction-form-card">
      <div className="card-heading">
        <p className="small-title">Ny transaktion</p>
        <h2>Tilføj indtægt eller udgift</h2>
      </div>

      <form className="transaction-form" onSubmit={handleSubmit}>
        <div className="transaction-fields">
          <label>
            Type
            <select name="type" defaultValue="EXPENSE">
              <option value="EXPENSE">Udgift</option>
              <option value="INCOME">Indtægt</option>
            </select>
          </label>

          <label>
            Beløb
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Fx 125.50"
              required
            />
          </label>

          <label>
            Kategori
            <input
              name="category"
              list="categories"
              placeholder="Fx Mad"
              required
            />
          </label>

          <label>
            Dato
            <input name="date" type="date" required />
          </label>
        </div>

        <datalist id="categories">
          <option value="Mad" />
          <option value="Transport" />
          <option value="Bolig" />
          <option value="Fritid" />
          <option value="Løn" />
          <option value="Andet" />
        </datalist>

        <label>
          Beskrivelse <span>(valgfri)</span>
          <input
            name="description"
            type="text"
            placeholder="Fx Indkøb i Netto"
          />
        </label>

        <button className="save-button" type="submit" disabled={isLoading}>
          {isLoading ? "Gemmer..." : "Gem transaktion"}
        </button>

        {message && <p className="form-message">{message}</p>}
      </form>
    </section>
  );
}