import Link from "next/link";
import { loginGuest } from "@/app/actions";
import { getActiveParticipants } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const participants = await getActiveParticipants();
  const params = await searchParams;

  return (
    <main className="shell">
      <div className="topbar">
        <div className="brand">
          <span className="eyebrow">Birthday fantasy pool</span>
          <h1>Cast your vote for the finest costume in the realm.</h1>
        </div>
        <Link className="button secondary" href="/admin/login">
          Admin
        </Link>
      </div>

      <div className="split">
        <form className="panel stack" action={loginGuest}>
          <h2>Enter the hall</h2>
          <p className="muted">Choose your name and use the private code from the invitation list.</p>
          {params.error === "invalid" ? <p className="error">Name or code is not valid.</p> : null}
          <label className="field">
            <span>Name</span>
            <select name="participantId" required>
              <option value="">Select your name</option>
              {participants.map((participant) => (
                <option key={participant.id} value={participant.id}>
                  {participant.display_name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Private code</span>
            <input name="code" autoComplete="one-time-code" required />
          </label>
          <button className="button" type="submit">
            Continue
          </button>
        </form>

        <section className="panel">
          <h2>One name, one vote</h2>
          <p className="lede">
            The guest list is closed, every invite has a private code, and the database accepts one vote per
            participant. No IP tracking needed.
          </p>
        </section>
      </div>
    </main>
  );
}
