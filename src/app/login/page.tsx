import Link from "next/link";
import { loginGuest } from "@/app/actions";
import { getActiveParticipants, getActivePool } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const [participants, pool, params] = await Promise.all([getActiveParticipants(), getActivePool(), searchParams]);

  return (
    <main className="shell">
      <div className="topbar">
        <div className="brand">
          <span className="eyebrow">{pool?.name ?? "Birthday fantasy pool"}</span>
          <h1>Enter the hall and prepare your vote.</h1>
        </div>
        <Link className="button secondary" href="/admin/login">
          Admin
        </Link>
      </div>

      <div className="split">
        <form className="panel stack" action={loginGuest}>
          <h2>Enter the hall</h2>
          <p className="muted">Choose your name and use the private code you created during registration.</p>
          {params.registered ? <p className="error">Registration saved. You can login now.</p> : null}
          {params.error === "no-pool" ? <p className="error">There is no open pool yet.</p> : null}
          {params.error === "invalid" ? <p className="error">Name or code is not valid.</p> : null}
          <label className="field">
            <span>Name</span>
            <select name="participantId" required>
              <option value="">Select your name</option>
              {participants.map((participant) => (
                <option key={participant.id} value={participant.id}>
                  {participant.display_name}
                  {participant.character_name ? ` - ${participant.character_name}` : ""}
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
          <Link className="button secondary" href="/register">
            Register for the pool
          </Link>
        </form>

        <section className="panel">
          <h2>One character, one vote</h2>
          <p className="lede">
            Register your name and character, then return here with your private code. The database accepts one
            vote per registered participant.
          </p>
        </section>
      </div>
    </main>
  );
}
