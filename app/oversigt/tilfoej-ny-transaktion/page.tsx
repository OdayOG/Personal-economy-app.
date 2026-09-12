import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/session";
import AddTransactionForm from "../add-transaction-form";

export default async function TilfoejTransaktionPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/log-ind");
  }

  return (
    <main className="finance-dashboard">
      <section className="transaction-page-panel">
        <Link href="/oversigt" className="back-dashboard-link">
          ← Tilbage til oversigten
        </Link>

        <AddTransactionForm />
      </section>
    </main>
  );
}