import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/session";

function formatAmount(amount: number) {
  return new Intl.NumberFormat("da-DK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default async function BudgetPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/log-ind");
  }

  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), 1)
  );
  const nextMonth = new Date(
    Date.UTC(now.getFullYear(), now.getMonth() + 1, 1)
  );

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

  const expenses = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      type: "EXPENSE",
      date: {
        gte: monthStart,
        lt: nextMonth,
      },
    },
  });

  const spentByCategory = expenses.reduce<Record<string, number>>(
    (totals, transaction) => {
      totals[transaction.category] =
        (totals[transaction.category] || 0) + Number(transaction.amount);

      return totals;
    },
    {}
  );

  const budgetItems = budgets.map((budget) => {
    const spent = spentByCategory[budget.category] || 0;
    const budgetAmount = Number(budget.amount);
    const percentage =
      budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

    return {
      category: budget.category,
      spent,
      budgetAmount,
      percentage,
      remaining: budgetAmount - spent,
    };
  });

  const monthName = now.toLocaleDateString("da-DK", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="finance-dashboard">
      <section className="budget-overview-panel">
        <Link href="/oversigt" className="back-dashboard-link">
          ← Tilbage til oversigten
        </Link>

        <header className="budget-page-header">
          <div>
            <p className="eyebrow">Månedens plan</p>
            <h1>Mine budgetter</h1>
            <p>{monthName}</p>
          </div>

          <Link href="/oversigt/budget/ny" className="add-transaction-link">
            + Opret budget
          </Link>
        </header>

        {budgetItems.length === 0 ? (
          <section className="budget-empty-card">
            <h2>Du har ingen budgetter endnu</h2>
            <p>Opret et budget for at følge dit forbrug pr. kategori.</p>

            <Link
              href="/oversigt/budget/ny"
              className="add-transaction-link"
            >
              + Opret dit første budget
            </Link>
          </section>
        ) : (
          <div className="budget-overview-grid">
            {budgetItems.map((budget) => (
              <article className="budget-overview-card" key={budget.category}>
                <div className="budget-card-top">
                  <div>
                    <p className="eyebrow">Kategori</p>
                    <h2>{budget.category}</h2>
                  </div>

                  <strong
                    className={
                      budget.percentage >= 100
                        ? "budget-warning"
                        : "budget-percentage"
                    }
                  >
                    {Math.round(budget.percentage)}%
                  </strong>
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

                <div className="budget-numbers">
                  <div>
                    <span>Brugt</span>
                    <strong>{formatAmount(budget.spent)} kr.</strong>
                  </div>

                  <div>
                    <span>Budget</span>
                    <strong>{formatAmount(budget.budgetAmount)} kr.</strong>
                  </div>

                  <div>
                    <span>Tilbage</span>
                    <strong
                      className={
                        budget.remaining < 0 ? "negative" : "positive"
                      }
                    >
                      {formatAmount(Math.abs(budget.remaining))} kr.
                    </strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}