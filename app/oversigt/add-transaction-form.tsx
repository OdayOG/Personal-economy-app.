"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const expenseCategories = [
  "Mad og drikke",
  "Transport",
  "Bolig",
  "Fritid",
  "Sundhed",
  "Shopping",
];

const incomeCategories = [
  "Løn",
  "Gave",
  "Salg",
  "Anden indtægt",
];

export default function AddTransactionForm() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState("EXPENSE");
  const [category, setCategory] = useState("");
  const router = useRouter();

  const categories =
    type === "EXPENSE" ? expenseCategories : incomeCategories;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const selectedCategory = formData.get("category");
    const customCategory = formData.get("customCategory");

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: formData.get("amount"),
          type: formData.get("type"),
          category:
            selectedCategory === "Andet"
              ? customCategory
              : selectedCategory,
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
      form.reset();
      setType("EXPENSE");
      setCategory("");
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
            <select
              name="type"
              value={type}
              onChange={(event) => {
                setType(event.target.value);
                setCategory("");
              }}
            >
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
            <select
              name="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
            >
              <option value="">Vælg kategori</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}

              <option value="Andet">Andet</option>
            </select>
          </label>

          <label>
            Dato
            <input name="date" type="date" required />
          </label>
        </div>

        {category === "Andet" && (
          <label>
            Din egen kategori
            <input
              name="customCategory"
              placeholder="Fx Kæledyr"
              required
            />
          </label>
        )}

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