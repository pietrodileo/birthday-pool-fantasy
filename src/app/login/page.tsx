import Link from "next/link";
import { loginGuest } from "@/app/actions";
import { MageGuide } from "@/components/MageGuide";
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
          <span className="eyebrow">{pool?.name ?? "Il Gran Ballo del Bosco"}</span>
          <h1>Varca la soglia della sala e prepara il tuo voto.</h1>
        </div>
        <Link className="button secondary" href="/admin/login">
          Custode
        </Link>
      </div>

      <div className="split">
        <form className="panel stack login-form-panel" action={loginGuest}>
          <h2>Ingresso alla sala</h2>
          <p className="muted">Scegli il tuo nome e pronuncia il codice segreto. Potrai iscrivere il costume dopo l'accesso.</p>
          {params.error === "no-pool" ? <p className="error">Nessun concilio è aperto in questo momento.</p> : null}
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

        <section className="panel login-guide-panel">
          <MageGuide
            greeting="Salute a te, nobile ospite del gran ballo."
            message={
              <>
                <p>
                  Quando la notte chiama a raccolta, anche il più umile mantello può diventare leggenda. Un eroe,
                  un voto: questa è la legge del concilio.
                </p>
                <p>
                  Scegli il tuo nome, pronuncia il codice segreto, e le porte della sala si apriranno al tuo passo.
                  Entra, iscrivi il tuo costume e, quando giungerà il momento, affida il tuo voto al verdetto del
                  reame.
                </p>
              </>
            }
          />
        </section>
      </div>
    </main>
  );
}
