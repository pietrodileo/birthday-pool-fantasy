import Link from "next/link";
import { redirect } from "next/navigation";
import { castVote, logout } from "@/app/actions";
import { MageGuide } from "@/components/MageGuide";
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
          <span className="eyebrow">Benvenuto, {session.displayName}</span>
          <h1>{pool?.voting_open ? "Scegli il campione del reame." : "Iscriviti, poi attendi il richiamo dell'urna."}</h1>
        </div>
        <form action={logout}>
          <button className="button secondary" type="submit">
            Esci
          </button>
        </form>
      </div>

      <MageGuide
        title={pool?.voting_open ? "L'urna attende" : "Il consiglio si prepara"}
        message={
          pool?.voting_open
            ? "Guarda i nomi, ascolta il tuo cuore, poi sigilla una sola runa."
            : "Iscrivi il tuo costume: quando il Custode aprira l'urna, il tuo nome sara gia tra le cronache."
        }
      />

      <form className="stack" action={castVote}>
        {params.registered ? <p className="error">La tua iscrizione e stata sigillata negli annali.</p> : null}
        <div className="panel stack">
          <h2>La tua iscrizione</h2>
          <p className="muted">
            {participant?.character_name
              ? `Sei iscritto come ${participant.character_name}.`
              : "Iscrivi il tuo costume prima che l'urna venga aperta, cosi apparira nel concilio."}
          </p>
          <p className="muted">Che il tuo nome sia ricordato tra torce, canti e antiche promesse.</p>
          <a className="button secondary" href="/register">
            {participant?.character_name ? "Modifica iscrizione" : "Iscriviti al concilio"}
          </a>
        </div>
        {params.error ? <p className="error">Il voto non e stato inciso. Forse hai gia parlato all'urna.</p> : null}
        {!pool?.voting_open ? <p className="error">L'urna e ancora chiusa: il Custode non ha dato il segnale.</p> : null}
        <div className="grid">
          {costumes.map((costume, index) => (
            <label className="card choice" key={costume.id}>
              <span className="index-badge">{index + 1}</span>
              <input name="costumeId" type="radio" value={costume.id} disabled={!pool?.voting_open} required />
              <strong>{costume.name}</strong>
              <span className="muted">
                {costume.owner_name ? `${costume.owner_name}` : "Voce del Custode"}
                {costume.description ? ` - ${costume.description}` : ""}
              </span>
            </label>
          ))}
        </div>
        <button className="button" type="submit" disabled={!pool?.voting_open}>
          Sigilla il voto
        </button>
      </form>

      <p className="muted" style={{ marginTop: 20 }}>
        La curiosita ti chiama? <Link href="/results">Consulta le cronache</Link>.
      </p>
    </main>
  );
}
