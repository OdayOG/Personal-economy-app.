import { redirect } from "next/navigation";
import { deleteSession, getCurrentUser } from "@/app/lib/session";
import { prisma } from "@/app/lib/prisma";
import AddTransactionForm from "./add-transaction-form";

async function logUd() {
  "use server";

  await deleteSession();
  redirect("/");
}

export default async function OversigtPage() {
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
    <main className="account-page">
      <section className="account-card">
        <p className="small-title">Dit overblik</p>
        <h1>Hej, {user.name}!</h1>
        <p>Du er logget ind og kan nu se din personlige økonomi.</p>

        <form action={logUd}>
          <button type="submit">Log ud</button>
        </form>
      </section>

      <AddTransactionForm />

      <section className="account-card">
        <p className="small-title">Dine transaktioner</p>
        <h2>Seneste transaktioner</h2>

        {transactions.length === 0 ? (
          <p>Du har endnu ingen transaktioner.</p>
        ) : (
          <ul>
            {transactions.map((transaction) => (
              <li key={transaction.id}>
                <strong>
                  {transaction.type === "INCOME" ? "Indtægt" : "Udgift"}:
                </strong>{" "}
                {transaction.category} — {transaction.amount.toFixed(2)} kr.
                {transaction.description && ` (${transaction.description})`}
                {" — "}
                {transaction.date.toLocaleDateString("da-DK")}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}