import Link from "next/link";
import { loginGuest } from "@/app/actions";
import { getActiveParticipants, getActivePool } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [participants, pool, params] = await Promise.all([getActiveParticipants(), getActivePool(), searchParams]);

  return (
    <main className="shell">
      <div className="topbar">
        <div className="brand">
          <span className="eyebrow">{pool?.name ?? "Concilio dei costumi"}</span>
          <h1>Varca la soglia della sala e prepara il tuo voto.</h1>
        </div>
        <Link className="button secondary" href="/admin/login">
          Custode
        </Link>
      </div>

      <div className="split">
        <form className="panel stack" action={loginGuest}>
          <h2>Ingresso alla sala</h2>
          <p className="muted">Scegli il tuo nome e pronuncia il codice segreto. Potrai iscrivere il costume dopo l'accesso.</p>
          {params.error === "no-pool" ? <p className="error">Nessun concilio e aperto in questo momento.</p> : null}
          {params.error === "invalid" ? <p className="error">Nome o codice non riconosciuti dagli archivi del reame.</p> : null}
          <label className="field">
            <span>Nome</span>
            <select name="participantId" required>
              <option value="">Scegli il tuo nome</option>
              {participants.map((participant) => (
                <option key={participant.id} value={participant.id}>
                  {participant.display_name}
                  {participant.character_name ? ` - ${participant.character_name}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Codice segreto</span>
            <input name="code" autoComplete="one-time-code" required />
          </label>
          <button className="button" type="submit">
            Continua
          </button>
        </form>

        <section className="panel">
          <h2>Un eroe, un voto</h2>
          <p className="lede">
            Prima entra nella sala, poi iscrivi il tuo costume al concilio. Ogni partecipante potra deporre
            una sola runa nell'urna.
          </p>
          <p className="muted">Quando la notte chiama a raccolta, anche il piu umile mantello puo diventare leggenda.</p>
        </section>
      </div>
    </main>
  );
}
