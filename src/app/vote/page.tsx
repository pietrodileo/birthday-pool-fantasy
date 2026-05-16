import Link from "next/link";
import { redirect } from "next/navigation";
import { castVote, logout } from "@/app/actions";
import { getActiveCostumes, getActivePool, getParticipant, getParticipantVote } from "@/lib/data";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function VotePage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const session = await getSession();

  if (!session || session.role !== "guest") {
    redirect("/login");
  }

  const [pool, participant, costumes, vote, params] = await Promise.all([
    getActivePool(),
    getParticipant(session.participantId),
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
          <h1>{pool?.voting_open ? "Choose the champion." : "Register, then await the ballot."}</h1>
        </div>
        <form action={logout}>
          <button className="button secondary" type="submit">
            Logout
          </button>
        </form>
      </div>

      <form className="stack" action={castVote}>
        {params.registered ? <p className="error">Your costume registration is saved.</p> : null}
        <div className="panel stack">
          <h2>Your registration</h2>
          <p className="muted">
            {participant?.character_name
              ? `Registered as ${participant.character_name}.`
              : "Register your costume before voting opens so it appears in the pool."}
          </p>
          <a className="button secondary" href="/register">
            {participant?.character_name ? "Edit costume registration" : "Register for the pool"}
          </a>
        </div>
        {params.error ? <p className="error">Your vote was not saved. You may have already voted.</p> : null}
        {!pool?.voting_open ? <p className="error">Voting is disabled until the admin opens the ballot.</p> : null}
        <div className="grid">
          {costumes.map((costume) => (
            <label className="card choice" key={costume.id}>
              <input name="costumeId" type="radio" value={costume.id} disabled={!pool?.voting_open} required />
              <strong>{costume.name}</strong>
              <span className="muted">
                {costume.owner_name ? `${costume.owner_name}` : "Admin entry"}
                {costume.description ? ` - ${costume.description}` : ""}
              </span>
            </label>
          ))}
        </div>
        <button className="button" type="submit" disabled={!pool?.voting_open}>
          Seal the vote
        </button>
      </form>

      <p className="muted" style={{ marginTop: 20 }}>
        Curious already? <Link href="/results">View the current results</Link>.
      </p>
    </main>
  );
}
