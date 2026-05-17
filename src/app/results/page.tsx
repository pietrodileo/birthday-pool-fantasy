import Link from "next/link";
import { MageGuide } from "@/components/MageGuide";
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
          <p className="lede">La classifica apparirà quando il Custode scioglierà il sigillo.</p>
          <Link className="button" href="/login">
            Indietro
          </Link>
        </section>
      </main>
    );
  }

  const totalVotes = results.reduce((sum, row) => sum + row.vote_count, 0);
  const maxVotes = Math.max(1, ...results.map((row) => row.vote_count));
  const winningVotes = Math.max(0, ...results.map((row) => row.vote_count));
  const winners = winningVotes > 0 ? results.filter((row) => row.vote_count === winningVotes) : [];

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
        <MageGuide
          greeting="Le cronache parlano."
          message={
            <>
              <p>Ogni barra è una traccia lasciata nell'urna del concilio: i nomi più acclamati sorgono in cima.</p>
              <p>
                {winners.length === 0
                  ? "Nessun vincitore è ancora inciso nelle pergamene: l'urna attende i suoi voti."
                  : winners.length === 1
                    ? `Il vincitore è ${winners[0].costume_name}, con ${winningVotes} ${winningVotes === 1 ? "voto" : "voti"}.`
                    : `Il verdetto proclama un pari merito: ${winners
                        .map((winner) => winner.costume_name)
                        .join(", ")}, con ${winningVotes} voti ciascuno.`}
              </p>
            </>
          }
        />
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
