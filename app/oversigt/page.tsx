import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { deleteSession, getCurrentUser } from "@/app/lib/session";
import { prisma } from "@/app/lib/prisma";
import AddTransactionForm from "./add-transaction-form";

async function logUd() {
  "use server";

  await deleteSession();
  redirect("/");
}

async function sletTransaktion(formData: FormData) {
  "use server";

  const user = await getCurrentUser();

  if (!user) {
    redirect("/log-ind");
  }

  const transactionId = Number(formData.get("transactionId"));

  if (!Number.isInteger(transactionId)) {
    return;
  }

  await prisma.transaction.deleteMany({
    where: {
      id: transactionId,
      userId: user.id,
    },
  });

  revalidatePath("/oversigt");
}

async function redigerTransaktion(formData: FormData) {
  "use server";

  const user = await getCurrentUser();

  if (!user) {
    redirect("/log-ind");
  }

  const transactionId = Number(formData.get("transactionId"));
  const amount = Number(formData.get("amount"));
  const type = String(formData.get("type"));
  const category = String(formData.get("category")).trim();
  const description = String(formData.get("description")).trim();
  const date = String(formData.get("date"));

  if (
    !Number.isInteger(transactionId) ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    (type !== "INCOME" && type !== "EXPENSE") ||
    !category ||
    !date
  ) {
    return;
  }

  await prisma.transaction.updateMany({
    where: {
      id: transactionId,
      userId: user.id,
    },
    data: {
      amount,
      type,
      category,
      description: description || null,
      date: new Date(date),
    },
  });

  revalidatePath("/oversigt");
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

                <form action={sletTransaktion}>
                  <input
                    type="hidden"
                    name="transactionId"
                    value={transaction.id}
                  />
                  <button type="submit">Slet</button>
                </form>

                <details>
                  <summary>Rediger</summary>

                  <form action={redigerTransaktion}>
                    <input
                      type="hidden"
                      name="transactionId"
                      value={transaction.id}
                    />

                    <label>
                      Type
                      <select name="type" defaultValue={transaction.type}>
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
                        defaultValue={transaction.amount.toString()}
                        required
                      />
                    </label>

                    <label>
                      Kategori
                      <input
                        name="category"
                        defaultValue={transaction.category}
                        required
                      />
                    </label>

                    <label>
                      Beskrivelse
                      <input
                        name="description"
                        defaultValue={transaction.description ?? ""}
                      />
                    </label>

                    <label>
                      Dato
                      <input
                        name="date"
                        type="date"
                        defaultValue={transaction.date
                          .toISOString()
                          .slice(0, 10)}
                        required
                      />
                    </label>

                    <button type="submit">Gem ændringer</button>
                  </form>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}