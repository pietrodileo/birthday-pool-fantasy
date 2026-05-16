import Link from "next/link";
import { redirect } from "next/navigation";
import {
  addCostume,
  addParticipant,
  createNewPool,
  logout,
  resetParticipantVote,
  resetPoolVotes,
  updateCostume,
  updateParticipant,
  updatePoolSettings
} from "@/app/actions";
import { getActivePool, getAllCostumes, getAllParticipants, getParticipantVotes, getResults } from "@/lib/data";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  const [pool, participants, costumes, results, participantVotes] = await Promise.all([
    getActivePool(),
    getAllParticipants(),
    getAllCostumes(),
    getResults(),
    getParticipantVotes()
  ]);

  const maxVotes = Math.max(1, ...results.map((row) => row.vote_count));

  return (
    <main className="shell">
      <div className="topbar">
        <div>
          <span className="eyebrow">Admin panel</span>
          <h1>Manage the pool and the ballot.</h1>
        </div>
        <form action={logout}>
          <button className="button secondary" type="submit">
            Logout
          </button>
        </form>
      </div>

      {!pool ? (
        <section className="panel stack">
          <h2>No open pool</h2>
          <form className="grid" action={createNewPool}>
            <input name="name" placeholder="Birthday Costume Pool" required />
            <button className="button" type="submit">
              Create pool
            </button>
          </form>
        </section>
      ) : (
        <div className="stack">
          <section className="panel stack">
            <h2>{pool.name}</h2>
            <form className="grid" action={updatePoolSettings}>
              <label className="field">
                <span>Pool name</span>
                <input name="name" defaultValue={pool.name} required />
              </label>
              <label className="toggle">
                <input name="registrationOpen" type="checkbox" defaultChecked={pool.registration_open} />
                Registration open
              </label>
              <label className="toggle">
                <input name="votingOpen" type="checkbox" defaultChecked={pool.voting_open} />
                Voting open
              </label>
              <label className="toggle">
                <input name="resultsVisible" type="checkbox" defaultChecked={pool.results_visible} />
                Results visible to participants
              </label>
              <button className="button" type="submit">
                Save pool settings
              </button>
            </form>
            <div className="actions">
              <form action={resetPoolVotes}>
                <button className="button danger" type="submit">
                  Reset votes to zero
                </button>
              </form>
              <form className="actions" action={createNewPool}>
                <input name="name" placeholder="New pool name" required />
                <button className="button secondary" type="submit">
                  Create new pool
                </button>
              </form>
              <Link className="button secondary" href="/admin/download">
                Download votes CSV
              </Link>
            </div>
          </section>

          <section className="panel stack">
            <h2>Results</h2>
            {results.map((row, index) => (
              <div className="bar-row" key={row.costume_id}>
                <span className="index-badge">{index + 1}</span>
                <strong>{row.costume_name}</strong>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${Math.max(4, (row.vote_count / maxVotes) * 100)}%` }} />
                </div>
                <span>{row.vote_count}</span>
              </div>
            ))}
          </section>

          <section className="panel stack">
            <h2>Registered participants</h2>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Registration</th>
                    <th>Vote</th>
                    <th>Name</th>
                    <th>Character</th>
                    <th>Chosen costume</th>
                    <th>Voted at</th>
                  </tr>
                </thead>
                <tbody>
                  {participantVotes.map((row, index) => (
                    <tr key={row.participant_id}>
                      <td>{index + 1}</td>
                      <td>
                        <span className={row.character_name ? "badge success" : "badge"}>
                          {row.character_name ? "Registered" : "Missing"}
                        </span>
                      </td>
                      <td>
                        <span className={row.costume_name ? "badge success" : "badge"}>
                          {row.costume_name ? "Voted" : "Pending"}
                        </span>
                      </td>
                      <td>{row.display_name}</td>
                      <td>{row.character_name || "-"}</td>
                      <td>{row.costume_name || "-"}</td>
                      <td>{row.voted_at ? new Date(row.voted_at).toLocaleString("en-GB") : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel stack">
            <h2>Guests</h2>
            <form className="grid" action={addParticipant}>
              <input name="displayName" placeholder="Guest name" required />
              <input name="characterName" placeholder="Costume name optional" />
              <input name="code" placeholder="Private code" required />
              <button className="button" type="submit">
                Add guest
              </button>
            </form>

            <div className="stack">
              {participants.map((participant, index) => (
                <div className="card" key={participant.id}>
                  <span className="index-badge">{index + 1}</span>
                  <form className="admin-row-form" action={updateParticipant}>
                    <input type="hidden" name="id" value={participant.id} />
                    <input name="displayName" defaultValue={participant.display_name} required />
                    <input name="characterName" defaultValue={participant.character_name ?? ""} placeholder="Costume name" />
                    <input name="code" placeholder="New code optional" />
                    <label className="toggle">
                      <input name="active" type="checkbox" defaultChecked={participant.active} />
                      Active
                    </label>
                    <button className="button secondary" type="submit">
                      Save
                    </button>
                  </form>
                  <form action={resetParticipantVote}>
                    <input type="hidden" name="participantId" value={participant.id} />
                    <button className="button danger" type="submit">
                      Reset vote
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>

          <section className="panel stack">
            <h2>Costumes</h2>
            <form className="grid" action={addCostume}>
              <input name="name" placeholder="Costume name" required />
              <input name="description" placeholder="Short description" />
              <button className="button" type="submit">
                Add costume
              </button>
            </form>

            <div className="stack">
              {costumes.map((costume, index) => (
                <form className="card admin-row-form" action={updateCostume} key={costume.id}>
                  <span className="index-badge">{index + 1}</span>
                  <input type="hidden" name="id" value={costume.id} />
                  <input name="name" defaultValue={costume.name} required />
                  <input name="description" defaultValue={costume.description ?? ""} />
                  <span className="muted">{costume.owner_name ? `By ${costume.owner_name}` : "Admin entry"}</span>
                  <label className="toggle">
                    <input name="active" type="checkbox" defaultChecked={costume.active} />
                    Active
                  </label>
                  <button className="button secondary" type="submit">
                    Save
                  </button>
                </form>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
