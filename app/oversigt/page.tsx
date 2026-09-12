import { redirect } from "next/navigation";
import { deleteSession, getCurrentUser } from "@/app/lib/session";

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
    </main>
  );
}