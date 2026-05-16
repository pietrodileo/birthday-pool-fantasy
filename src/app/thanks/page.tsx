import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions";
import { getParticipantVote } from "@/lib/data";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ThanksPage() {
  const session = await getSession();

  if (!session || session.role !== "guest") {
    redirect("/login");
  }

  const vote = await getParticipantVote(session.participantId);

  return (
    <main className="shell">
      <section className="panel stack">
        <span className="eyebrow">Voto inciso</span>
        <h1>Onore a te, {session.displayName}.</h1>
        <p className="lede">
          La tua runa e stata sigillata{vote ? " e da questo account non potra essere deposta di nuovo" : ""}.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link className="button" href="/results">
            Consulta le cronache
          </Link>
          <form action={logout}>
            <button className="button secondary" type="submit">
              Esci
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
