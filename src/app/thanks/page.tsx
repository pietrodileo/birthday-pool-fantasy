import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions";
import { getParticipantVote } from "@/lib/data";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ThanksPage() {
  const session = await getSession();

  if (!session || session.role !== "guest") {
    redirect("/login");
  }

  const vote = await getParticipantVote(session.participantId);

  return (
    <main className="shell">
      <section className="panel stack">
        <span className="eyebrow">Vote recorded</span>
        <h1>Thanks, {session.displayName}.</h1>
        <p className="lede">
          Your vote has been sealed{vote ? " and cannot be cast again from this account" : ""}.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link className="button" href="/results">
            See results
          </Link>
          <form action={logout}>
            <button className="button secondary" type="submit">
              Logout
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
