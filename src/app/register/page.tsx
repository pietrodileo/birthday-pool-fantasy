import Link from "next/link";
import { registerParticipant } from "@/app/actions";
import { getActivePool } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [pool, params] = await Promise.all([getActivePool(), searchParams]);
  const registrationClosed = !pool || !pool.registration_open;

  return (
    <main className="shell">
      <div className="topbar">
        <div>
          <span className="eyebrow">{pool?.name ?? "No open pool"}</span>
          <h1>Register your character.</h1>
        </div>
        <Link className="button secondary" href="/login">
          Login
        </Link>
      </div>

      <form className="panel stack" action={registerParticipant} style={{ maxWidth: 620 }}>
        <h2>Join the pool</h2>
        {registrationClosed ? <p className="error">Registration is closed right now.</p> : null}
        {params.error === "missing" ? <p className="error">Fill all fields before registering.</p> : null}
        {params.error === "failed" ? <p className="error">Registration failed. Try another name/code.</p> : null}
        <label className="field">
          <span>Your name</span>
          <input name="displayName" placeholder="Pietro" disabled={registrationClosed} required />
        </label>
        <label className="field">
          <span>Character name</span>
          <input name="characterName" placeholder="Otharin the Black Wizard" disabled={registrationClosed} required />
        </label>
        <label className="field">
          <span>Private code</span>
          <input name="code" placeholder="Choose a code you will remember" disabled={registrationClosed} required />
        </label>
        <button className="button" type="submit" disabled={registrationClosed}>
          Register
        </button>
      </form>
    </main>
  );
}
