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
          <span className="eyebrow">Sala del Custode</span>
          <h1>Governa il concilio e l'urna.</h1>
        </div>
        <form action={logout}>
          <button className="button secondary" type="submit">
            Esci
          </button>
        </form>
      </div>

      {!pool ? (
        <section className="panel stack">
          <h2>Nessun concilio aperto</h2>
          <form className="grid" action={createNewPool}>
            <input name="name" placeholder="Concilio dei Costumi" required />
            <button className="button" type="submit">
              Crea concilio
            </button>
          </form>
        </section>
      ) : (
        <div className="stack">
          <section className="panel stack">
            <h2>{pool.name}</h2>
            <form className="grid" action={updatePoolSettings}>
              <label className="field">
                <span>Nome del concilio</span>
                <input name="name" defaultValue={pool.name} required />
              </label>
              <label className="toggle">
                <input name="registrationOpen" type="checkbox" defaultChecked={pool.registration_open} />
                Iscrizioni aperte
              </label>
              <label className="toggle">
                <input name="votingOpen" type="checkbox" defaultChecked={pool.voting_open} />
                Urna aperta
              </label>
              <label className="toggle">
                <input name="resultsVisible" type="checkbox" defaultChecked={pool.results_visible} />
                Cronache visibili ai partecipanti
              </label>
              <button className="button" type="submit">
                Salva editti
              </button>
            </form>
            <div className="actions">
              <form action={resetPoolVotes}>
                <button className="button danger" type="submit">
                  Azzera l'urna
                </button>
              </form>
              <form className="actions" action={createNewPool}>
                <input name="name" placeholder="Nome del nuovo concilio" required />
                <button className="button secondary" type="submit">
                  Crea nuovo concilio
                </button>
              </form>
              <Link className="button secondary" href="/admin/download">
                Scarica cronache CSV
              </Link>
            </div>
          </section>

          <section className="panel stack">
            <h2>Esito dell'urna</h2>
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
            <h2>Compagnia iscritta</h2>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Iscrizione</th>
                    <th>Voto</th>
                    <th>Nome</th>
                    <th>Personaggio</th>
                    <th>Costume scelto</th>
                    <th>Ora del voto</th>
                  </tr>
                </thead>
                <tbody>
                  {participantVotes.map((row, index) => (
                    <tr key={row.participant_id}>
                      <td>{index + 1}</td>
                      <td>
                        <span className={row.character_name ? "badge success" : "badge"}>
                          {row.character_name ? "Iscritto" : "Mancante"}
                        </span>
                      </td>
                      <td>
                        <span className={row.costume_name ? "badge success" : "badge"}>
                          {row.costume_name ? "Ha votato" : "In attesa"}
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
            <h2>Invitati</h2>
            <form className="grid" action={addParticipant}>
              <input name="displayName" placeholder="Nome dell'invitato" required />
              <input name="characterName" placeholder="Nome costume opzionale" />
              <input name="code" placeholder="Codice segreto" required />
              <button className="button" type="submit">
                Aggiungi invitato
              </button>
            </form>

            <div className="stack">
              {participants.map((participant, index) => (
                <div className="card" key={participant.id}>
                  <span className="index-badge">{index + 1}</span>
                  <form className="admin-row-form" action={updateParticipant}>
                    <input type="hidden" name="id" value={participant.id} />
                    <input name="displayName" defaultValue={participant.display_name} required />
                    <input name="characterName" defaultValue={participant.character_name ?? ""} placeholder="Nome costume" />
                    <input name="code" placeholder="Nuovo codice opzionale" />
                    <label className="toggle">
                      <input name="active" type="checkbox" defaultChecked={participant.active} />
                      Attivo
                    </label>
                    <button className="button secondary" type="submit">
                      Salva
                    </button>
                  </form>
                  <form action={resetParticipantVote}>
                    <input type="hidden" name="participantId" value={participant.id} />
                    <button className="button danger" type="submit">
                      Azzera voto
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>

          <section className="panel stack">
            <h2>Costumi</h2>
            <form className="grid" action={addCostume}>
              <input name="name" placeholder="Nome del costume" required />
              <input name="description" placeholder="Breve descrizione" />
              <button className="button" type="submit">
                Aggiungi costume
              </button>
            </form>

            <div className="stack">
              {costumes.map((costume, index) => (
                <form className="card admin-row-form" action={updateCostume} key={costume.id}>
                  <span className="index-badge">{index + 1}</span>
                  <input type="hidden" name="id" value={costume.id} />
                  <input name="name" defaultValue={costume.name} required />
                  <input name="description" defaultValue={costume.description ?? ""} />
                  <span className="muted">{costume.owner_name ? `Di ${costume.owner_name}` : "Voce del Custode"}</span>
                  <label className="toggle">
                    <input name="active" type="checkbox" defaultChecked={costume.active} />
                    Attivo
                  </label>
                  <button className="button secondary" type="submit">
                    Salva
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
