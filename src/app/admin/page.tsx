import { redirect } from "next/navigation";
import {
  addCostume,
  addParticipant,
  logout,
  resetParticipantVote,
  updateCostume,
  updateParticipant
} from "@/app/actions";
import { getAllCostumes, getAllParticipants, getResults } from "@/lib/data";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  const [participants, costumes, results] = await Promise.all([
    getAllParticipants(),
    getAllCostumes(),
    getResults()
  ]);

  return (
    <main className="shell">
      <div className="topbar">
        <div>
          <span className="eyebrow">Admin panel</span>
          <h1>Manage the guest list and the ballot.</h1>
        </div>
        <form action={logout}>
          <button className="button secondary" type="submit">
            Logout
          </button>
        </form>
      </div>

      <div className="stack">
        <section className="panel stack">
          <h2>Results</h2>
          {results.map((row) => (
            <div className="bar-row" key={row.costume_id}>
              <strong>{row.costume_name}</strong>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${Math.max(4, row.vote_count * 20)}%` }} />
              </div>
              <span>{row.vote_count}</span>
            </div>
          ))}
        </section>

        <section className="panel stack">
          <h2>Guests</h2>
          <form className="row-form" action={addParticipant}>
            <input name="displayName" placeholder="Guest name" required />
            <input name="code" placeholder="Private code" required />
            <button className="button" type="submit">
              Add guest
            </button>
          </form>

          <div className="stack">
            {participants.map((participant) => (
              <div className="card" key={participant.id}>
                <form className="row-form" action={updateParticipant}>
                  <input type="hidden" name="id" value={participant.id} />
                  <input name="displayName" defaultValue={participant.display_name} required />
                  <input name="code" placeholder="New code optional" />
                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      name="active"
                      type="checkbox"
                      defaultChecked={participant.active}
                      style={{ width: 18, minHeight: 18 }}
                    />
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
            {costumes.map((costume) => (
              <form className="card row-form" action={updateCostume} key={costume.id}>
                <input type="hidden" name="id" value={costume.id} />
                <input name="name" defaultValue={costume.name} required />
                <input name="description" defaultValue={costume.description ?? ""} />
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    name="active"
                    type="checkbox"
                    defaultChecked={costume.active}
                    style={{ width: 18, minHeight: 18 }}
                  />
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
    </main>
  );
}
