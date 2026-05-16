import { NextResponse } from "next/server";
import { getActivePool, getParticipantVotes } from "@/lib/data";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function csvCell(value: string | null) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const pool = await getActivePool();
  const rows = await getParticipantVotes();
  const csv = [
    ["pool_id", "pool_name", "participant_name", "character_name", "vote", "voted_at"].map(csvCell).join(","),
    ...rows.map((row) =>
      [
        pool?.id ?? "",
        pool?.name ?? "",
        row.display_name,
        row.character_name ?? "",
        row.costume_name ?? "",
        row.voted_at ?? ""
      ]
        .map(csvCell)
        .join(",")
    )
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${pool?.name ?? "pool"}-votes.csv"`
    }
  });
}
