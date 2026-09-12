import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/session";
import AddBudgetForm from "../../add-budget-form";

export default async function NytBudgetPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/log-ind");
  }

  return (
    <main className="finance-dashboard">
      <section className="transaction-page-panel">
        <Link href="/oversigt/budget" className="back-dashboard-link">
          ← Tilbage til budgetter
        </Link>

        <AddBudgetForm />
      </section>
    </main>
  );
}