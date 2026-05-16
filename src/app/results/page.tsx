import Link from "next/link";
import { getActivePool, getResults } from "@/lib/data";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const [pool, session, results] = await Promise.all([getActivePool(), getSession(), getResults()]);
  const canSeeResults = session?.role === "admin" || Boolean(pool?.results_visible);

  if (!canSeeResults) {
    return (
      <main className="shell">
        <section className="panel stack">
          <span className="eyebrow">{pool?.name ?? "Concilio dei costumi"}</span>
          <h1>Le cronache sono ancora velate.</h1>
          <p className="lede">La classifica apparira quando il Custode sciogliera il sigillo.</p>
          <Link className="button" href="/login">
            Indietro
          </Link>
        </section>
      </main>
    );
  }

  const totalVotes = results.reduce((sum, row) => sum + row.vote_count, 0);
  const maxVotes = Math.max(1, ...results.map((row) => row.vote_count));

  return (
    <main className="shell">
      <div className="topbar">
        <div>
          <span className="eyebrow">{totalVotes} voti deposti</span>
          <h1>Le cronache del concilio.</h1>
        </div>
        <Link className="button secondary" href="/login">
          Indietro
        </Link>
      </div>

      <section className="panel stack">
        {results.map((row, index) => (
          <div className="bar-row" key={row.costume_id}>
            <span className="index-badge">{index + 1}</span>
            <strong>{row.costume_name}</strong>
            <div className="bar-track" aria-label={`${row.vote_count} voti`}>
              <div
                className="bar-fill"
                style={{
                  width: `${Math.max(4, (row.vote_count / maxVotes) * 100)}%`
                }}
              />
            </div>
            <span>{row.vote_count}</span>
          </div>
        ))}
      </section>
    </main>
  );
}
