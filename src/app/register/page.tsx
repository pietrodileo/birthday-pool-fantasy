import Link from "next/link";
import { redirect } from "next/navigation";
import { registerParticipant } from "@/app/actions";
import { getActivePool, getParticipant } from "@/lib/data";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();

  if (!session || session.role !== "guest") {
    redirect("/login");
  }

  const [pool, participant, params] = await Promise.all([
    getActivePool(),
    getParticipant(session.participantId),
    searchParams
  ]);
  const registrationClosed = !pool || !pool.registration_open;

  return (
    <main className="shell">
      <div className="topbar">
        <div>
          <span className="eyebrow">{pool?.name ?? "Nessun concilio aperto"}</span>
          <h1>Iscrivi il tuo costume alle cronache.</h1>
        </div>
        <Link className="button secondary" href="/vote">
          Torna al concilio
        </Link>
      </div>

      <form className="panel stack" action={registerParticipant} style={{ maxWidth: 620 }}>
        <h2>{session.displayName}</h2>
        <p className="muted">Cosi il tuo costume apparira sulla pergamena del voto.</p>
        {registrationClosed ? <p className="error">Le iscrizioni sono chiuse: il portale tace.</p> : null}
        {params.error === "missing" ? <p className="error">Dai un nome al tuo costume prima di sigillare.</p> : null}
        {params.error === "failed" ? <p className="error">L'iscrizione non e riuscita. Ritenta, viandante.</p> : null}
        <label className="field">
          <span>Nome del costume / personaggio</span>
          <input
            name="characterName"
            placeholder="Gandalf il Bianco"
            defaultValue={participant?.character_name ?? ""}
            disabled={registrationClosed}
            required
          />
        </label>
        <label className="field">
          <span>Breve descrizione</span>
          <textarea
            name="description"
            placeholder="Veste bianca, bastone luminoso, sguardo di chi ha visto l'alba dopo l'ombra"
            disabled={registrationClosed}
          />
        </label>
        <button className="button" type="submit" disabled={registrationClosed}>
          Sigilla iscrizione
        </button>
      </form>
    </main>
  );
}
