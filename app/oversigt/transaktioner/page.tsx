import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/session";
import { prisma } from "@/app/lib/prisma";

function formatAmount(amount: number) {
  return new Intl.NumberFormat("da-DK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default async function TransaktionerPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/log-ind");
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      date: "desc",
    },
  });

  return (
    <main className="finance-dashboard">
      <section className="transaction-page-panel history-page-panel">
        <Link href="/oversigt" className="back-dashboard-link">
          ← Tilbage til oversigten
        </Link>

        <p className="eyebrow">Historik</p>
        <h1>Alle transaktioner</h1>
        <p>Her kan du se alle dine indtægter og udgifter.</p>

        {transactions.length === 0 ? (
          <p className="empty-state">Du har endnu ingen transaktioner.</p>
        ) : (
          <div className="finance-transaction-list">
            {transactions.map((transaction) => (
              <article className="finance-transaction" key={transaction.id}>
                <div
                  className={
                    transaction.type === "INCOME"
                      ? "transaction-icon income-icon"
                      : "transaction-icon expense-icon"
                  }
                >
                  {transaction.type === "INCOME" ? "↗" : "↘"}
                </div>

                <div className="transaction-copy">
                  <strong>{transaction.category}</strong>
                  <span>
                    {transaction.description || "Ingen beskrivelse"} ·{" "}
                    {transaction.date.toLocaleDateString("da-DK")}
                  </span>
                </div>

                <strong
                  className={
                    transaction.type === "INCOME"
                      ? "positive transaction-value"
                      : "negative transaction-value"
                  }
                >
                  {transaction.type === "INCOME" ? "+" : "−"}{" "}
                  {formatAmount(Number(transaction.amount))} kr.
                </strong>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}