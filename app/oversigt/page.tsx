import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { deleteSession, getCurrentUser } from "@/app/lib/session";
import { prisma } from "@/app/lib/prisma";
import MonthSelector from "./month-selector";


function formatAmount(amount: number) {
  return new Intl.NumberFormat("da-DK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

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

type OversigtPageProps = {
  searchParams: Promise<{ month?: string }>;
};

export default async function OversigtPage({
  searchParams,
}: OversigtPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/log-ind");
  }
    const { month } = await searchParams;
  const defaultMonth = new Date().toISOString().slice(0, 7);

  const selectedMonth =
    month && /^\d{4}-\d{2}$/.test(month) ? month : defaultMonth;

  const [year, monthNumber] = selectedMonth.split("-").map(Number);

  const monthStart = new Date(year, monthNumber - 1, 1);
  const nextMonth = new Date(year, monthNumber, 1);

  const transactions = await prisma.transaction.findMany({
   where: {
  userId: user.id,
  date: {
    gte: monthStart,
    lt: nextMonth,
  },

    },
    orderBy: {
      date: "desc",
    },
  });

  const budgets = await prisma.budget.findMany({
    where: {
      userId: user.id,
      month: {
        gte: monthStart,
        lt: nextMonth,
      },
    },
    orderBy: {
      category: "asc",
    },
  });

  const incomeTotal = transactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const expenseTotal = transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const balance = incomeTotal - expenseTotal;

  const categories = transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce<Record<string, number>>((totals, transaction) => {
      totals[transaction.category] =
        (totals[transaction.category] || 0) + Number(transaction.amount);

      return totals;
    }, {});

  const categoryItems = Object.entries(categories).sort(
    ([, firstAmount], [, secondAmount]) => secondAmount - firstAmount
  );

  const largestCategoryAmount = Math.max(
    ...categoryItems.map(([, amount]) => amount),
    1
  );
  const budgetItems = budgets.map((budget) => {
    const spent = categories[budget.category] || 0;
    const budgetAmount = Number(budget.amount);
    const percentage =
      budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

    return {
      category: budget.category,
      spent,
      budgetAmount,
      percentage,
    };
  });
  const chartTransactions = transactions.slice(0, 10).reverse();
  const largestTransactionAmount = Math.max(
    ...chartTransactions.map((transaction) => Number(transaction.amount)),
    1
  );

  return (
    <main className="finance-dashboard">
      <div className="finance-shell">
        <aside className="finance-sidebar">
          <a className="finance-logo" href="/">
            Personlig <span>økonomi</span>
          </a>

          <div className="profile-summary">
            <div className="profile-avatar">{user.name.charAt(0)}</div>
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>

          <nav className="finance-nav">
            <a className="active" href="/oversigt">
              Oversigt
            </a>
            <a href="#transaktioner">Transaktioner</a>
            <a href="/oversigt/budget">Budgetter</a>
            <a href="/oversigt/tilfoej-ny-transaktion">Tilføj transaktion</a>
          </nav>

          <form className="sidebar-logout" action={logUd}>
            <button type="submit">Log ud</button>
          </form>
        </aside>

        <section className="finance-main">
          <header className="finance-header">
            <div>
              <p className="eyebrow">Dit økonomiske overblik</p>
              <h1>Goddag, {user.name}!</h1>
              <p>Her er status på din økonomi.</p>
            </div>
            
            <MonthSelector selectedMonth={selectedMonth} />
            <a className="add-transaction-link" href="/oversigt/tilfoej-ny-transaktion">
              + Tilføj transaktion
            </a>
          </header>

          <div className="summary-cards">
            <article className="summary-card balance-card">
              <span>Samlet balance</span>
              <strong className={balance >= 0 ? "positive" : "negative"}>
                {balance >= 0 ? "+" : "−"} {formatAmount(Math.abs(balance))} kr.
              </strong>
            </article>

            <article className="summary-card">
              <span>Indtægter</span>
              <strong className="positive">
                + {formatAmount(incomeTotal)} kr.
              </strong>
            </article>

            <article className="summary-card">
              <span>Udgifter</span>
              <strong className="negative">
                − {formatAmount(expenseTotal)} kr.
              </strong>
            </article>
          </div>

          <section className="overview-card spending-chart">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Udvikling</p>
                <h2>Dine seneste transaktioner</h2>
              </div>
            </div>

            {chartTransactions.length === 0 ? (
              <p className="empty-state">Tilføj din første transaktion.</p>
            ) : (
              <div className="bar-chart">
                {chartTransactions.map((transaction) => (
                  <div className="chart-column" key={transaction.id}>
                    <div
                      className={
                        transaction.type === "INCOME"
                          ? "chart-bar income-bar"
                          : "chart-bar expense-bar"
                      }
                      style={{
                        height: `${
                          (Number(transaction.amount) /
                            largestTransactionAmount) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="overview-card" id="transaktioner">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Historik</p>
                <h2>Seneste transaktioner</h2>
              </div>
              <span>{transactions.length} i alt</span>
            </div>

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

                    <div className="transaction-controls">
                      <details>
                        <summary>Rediger</summary>

                        <form
                          className="edit-transaction-form"
                          action={redigerTransaktion}
                        >
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

                          <button className="save-button" type="submit">
                            Gem ændringer
                          </button>
                        </form>
                      </details>

                      <form action={sletTransaktion}>
                        <input
                          type="hidden"
                          name="transactionId"
                          value={transaction.id}
                        />
                        <button className="delete-button" type="submit">
                          Slet
                        </button>
                      </form>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

        </section>

        <aside className="finance-insights">
          <section className="insight-card">
            <section className="insight-card budget-card">
  <p className="eyebrow">Månedens budgetter</p>
  <h2>Forbrug mod budget</h2>

  {budgetItems.length === 0 ? (
    <p className="insight-empty">
      Du har ikke sat et budget for denne måned endnu.
    </p>
  ) : (
    <div className="budget-list">
      {budgetItems.map((budget) => (
        <div className="budget-item" key={budget.category}>
          <div className="budget-heading">
            <strong>{budget.category}</strong>
            <span
              className={
                budget.percentage >= 100
                  ? "budget-warning"
                  : "budget-percentage"
              }
            >
              {Math.round(budget.percentage)}%
            </span>
          </div>

          <div className="budget-track">
            <div
              className={
                budget.percentage >= 100
                  ? "budget-fill budget-fill-over"
                  : "budget-fill"
              }
              style={{
                width: `${Math.min(budget.percentage, 100)}%`,
              }}
            />
          </div>

          <p>
            {formatAmount(budget.spent)} kr. brugt af{" "}
            {formatAmount(budget.budgetAmount)} kr.
          </p>
        </div>
      ))}
    </div>
  )}
</section>
            <p className="eyebrow">Forbrug pr. kategori</p>
            <h2>Hvor går pengene hen?</h2>

            {categoryItems.length === 0 ? (
              <p className="insight-empty">Ingen udgifter endnu.</p>
            ) : (
              <div className="category-list">
                {categoryItems.map(([category, amount]) => (
                  <div className="category-item" key={category}>
                    <div>
                      <span>{category}</span>
                      <strong>{formatAmount(amount)} kr.</strong>
                    </div>

                    <div className="category-track">
                      <div
                        className="category-progress"
                        style={{
                          width: `${(amount / largestCategoryAmount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="tips-card">
            <p className="eyebrow">Lille tip</p>
            <h2>Få mere overblik</h2>
            <p>
              Registrér dine udgifter løbende, så bliver dit økonomiske
              overblik mere præcist.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}