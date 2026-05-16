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
        <span className="eyebrow">Admin</span>
        <h1>Open the control room.</h1>
        {params.error === "invalid" ? <p className="error">Admin credentials are not valid.</p> : null}
        <label className="field">
          <span>Username</span>
          <input name="username" autoComplete="username" required />
        </label>
        <label className="field">
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button className="button" type="submit">
          Login
        </button>
        <Link href="/login">Guest login</Link>
      </form>
    </main>
  );
}
