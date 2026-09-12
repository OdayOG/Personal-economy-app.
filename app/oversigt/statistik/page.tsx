import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/session";
import { prisma } from "@/app/lib/prisma";
import CategoryChart from "../chart";

export default async function StatistikPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/log-ind");
  }

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      type: "EXPENSE",
      date: {
        gte: monthStart,
        lt: nextMonth,
      },
    },
  });

  const categoryTotals = transactions.reduce<Record<string, number>>(
    (totals, transaction) => {
      totals[transaction.category] =
        (totals[transaction.category] || 0) + Number(transaction.amount);

      return totals;
    },
    {}
  );

  const chartData = Object.entries(categoryTotals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((first, second) => second.amount - first.amount);

  return (
    <main className="finance-dashboard">
      <section className="transaction-page-panel history-page-panel">
        <Link href="/oversigt" className="back-dashboard-link">
          ← Tilbage til oversigten
        </Link>

        <p className="eyebrow">Statistik</p>
        <h1>Udgifter pr. kategori</h1>
        <p>Her er dine udgifter i den aktuelle måned.</p>

        <CategoryChart data={chartData} />
      </section>
    </main>
  );
}