"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const budgetCategories = [
  "Mad og drikke",
  "Transport",
  "Bolig",
  "Fritid",
  "Sundhed",
  "Shopping",
];

export default function AddBudgetForm() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: formData.get("category"),
          amount: formData.get("amount"),
          month: formData.get("month"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setMessage("Budgettet er gemt.");
      form.reset();
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
        <p className="small-title">Nyt budget</p>
        <h2>Sæt et budget</h2>
      </div>

      <form className="transaction-form" onSubmit={handleSubmit}>
        <label>
          Kategori
          <select name="category" required>
            <option value="">Vælg kategori</option>

            {budgetCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          Budgetbeløb
          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Fx 3000"
            required
          />
        </label>

        <label>
          Måned
          <input name="month" type="month" required />
        </label>

        <button className="save-button" type="submit" disabled={isLoading}>
          {isLoading ? "Gemmer..." : "Gem budget"}
        </button>

        {message && <p className="form-message">{message}</p>}
      </form>
    </section>
  );
}