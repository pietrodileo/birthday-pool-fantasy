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
          <span className="eyebrow">{pool?.name ?? "No open pool"}</span>
          <h1>Register your costume.</h1>
        </div>
        <Link className="button secondary" href="/vote">
          Back to pool
        </Link>
      </div>

      <form className="panel stack" action={registerParticipant} style={{ maxWidth: 620 }}>
        <h2>{session.displayName}</h2>
        <p className="muted">This is how your costume will appear on the ballot.</p>
        {registrationClosed ? <p className="error">Registration is closed right now.</p> : null}
        {params.error === "missing" ? <p className="error">Add a costume name before saving.</p> : null}
        {params.error === "failed" ? <p className="error">Registration failed. Try again.</p> : null}
        <label className="field">
          <span>Costume / character name</span>
          <input
            name="characterName"
            placeholder="Otharin the Black Wizard"
            defaultValue={participant?.character_name ?? ""}
            disabled={registrationClosed}
            required
          />
        </label>
        <label className="field">
          <span>Short description</span>
          <textarea
            name="description"
            placeholder="Black robe, staff, ancient forbidden vibes"
            disabled={registrationClosed}
          />
        </label>
        <button className="button" type="submit" disabled={registrationClosed}>
          Save registration
        </button>
      </form>
    </main>
  );
}
