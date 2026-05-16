import Link from "next/link";
import { loginAdmin } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="shell">
      <form className="panel stack" action={loginAdmin} style={{ maxWidth: 460, margin: "0 auto" }}>
        <span className="eyebrow">Custode</span>
        <h1>Apri la camera del consiglio.</h1>
        {params.error === "invalid" ? <p className="error">Le credenziali del Custode non sono valide.</p> : null}
        <label className="field">
          <span>Nome del Custode</span>
          <input name="username" autoComplete="username" required />
        </label>
        <label className="field">
          <span>Parola segreta</span>
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button className="button" type="submit">
          Entra
        </button>
        <Link href="/login">Ingresso degli invitati</Link>
      </form>
    </main>
  );
}
