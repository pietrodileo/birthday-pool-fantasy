import Link from "next/link";
import { redirect } from "next/navigation";
import { castVote, logout } from "@/app/actions";
import { getActiveCostumes, getParticipantVote } from "@/lib/data";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function VotePage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();

  if (!session || session.role !== "guest") {
    redirect("/login");
  }

  const [costumes, vote, params] = await Promise.all([
    getActiveCostumes(),
    getParticipantVote(session.participantId),
    searchParams
  ]);

  if (vote) {
    redirect("/thanks");
  }

  return (
    <main className="shell">
      <div className="topbar">
        <div>
          <span className="eyebrow">Welcome, {session.displayName}</span>
          <h1>Choose the champion.</h1>
        </div>
        <form action={logout}>
          <button className="button secondary" type="submit">
            Logout
          </button>
        </form>
      </div>

      <form className="stack" action={castVote}>
        {params.error ? <p className="error">Your vote was not saved. You may have already voted.</p> : null}
        <div className="grid">
          {costumes.map((costume) => (
            <label className="card choice" key={costume.id}>
              <input name="costumeId" type="radio" value={costume.id} required />
              <strong>{costume.name}</strong>
              <span className="muted">{costume.description}</span>
            </label>
          ))}
        </div>
        <button className="button" type="submit">
          Seal the vote
        </button>
      </form>

      <p className="muted" style={{ marginTop: 20 }}>
        Curious already? <Link href="/results">View the current results</Link>.
      </p>
    </main>
  );
}
