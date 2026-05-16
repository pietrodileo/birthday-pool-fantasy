"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hashSecret, verifySecret } from "@/lib/crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { clearSession, getSession, setSession } from "@/lib/session";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function requireAdmin() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  return session;
}

export async function loginGuest(formData: FormData) {
  const participantId = value(formData, "participantId");
  const code = value(formData, "code");
  const supabase = getSupabaseAdmin();
  const { data: participant } = await supabase
    .from("participants")
    .select("id, display_name, active, login_code_hash")
    .eq("id", participantId)
    .maybeSingle();

  if (!participant || !participant.active || !verifySecret(code, participant.login_code_hash)) {
    redirect("/login?error=invalid");
  }

  await setSession({
    role: "guest",
    participantId: participant.id,
    displayName: participant.display_name
  });

  redirect("/vote");
}

export async function loginAdmin(formData: FormData) {
  const username = value(formData, "username");
  const password = value(formData, "password");
  const supabase = getSupabaseAdmin();
  const { data: admin } = await supabase
    .from("admins")
    .select("id, username, password_hash")
    .eq("username", username)
    .maybeSingle();

  if (!admin || !verifySecret(password, admin.password_hash)) {
    redirect("/admin/login?error=invalid");
  }

  await setSession({
    role: "admin",
    adminId: admin.id,
    username: admin.username
  });

  redirect("/admin");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}

export async function castVote(formData: FormData) {
  const session = await getSession();

  if (!session || session.role !== "guest") {
    redirect("/login");
  }

  const costumeId = value(formData, "costumeId");
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("votes").insert({
    participant_id: session.participantId,
    costume_id: costumeId
  });

  if (error) {
    redirect("/vote?error=already-voted");
  }

  redirect("/thanks");
}

export async function addParticipant(formData: FormData) {
  await requireAdmin();
  const displayName = value(formData, "displayName");
  const code = value(formData, "code");

  if (!displayName || !code) {
    redirect("/admin?error=missing-participant");
  }

  const supabase = getSupabaseAdmin();
  await supabase.from("participants").insert({
    display_name: displayName,
    login_code_hash: hashSecret(code)
  });

  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateParticipant(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id");
  const displayName = value(formData, "displayName");
  const active = formData.get("active") === "on";
  const code = value(formData, "code");
  const supabase = getSupabaseAdmin();
  const patch: { display_name: string; active: boolean; login_code_hash?: string } = {
    display_name: displayName,
    active
  };

  if (code) {
    patch.login_code_hash = hashSecret(code);
  }

  await supabase.from("participants").update(patch).eq("id", id);

  revalidatePath("/admin");
  redirect("/admin");
}

export async function resetParticipantVote(formData: FormData) {
  await requireAdmin();
  const participantId = value(formData, "participantId");
  const supabase = getSupabaseAdmin();
  await supabase.from("votes").delete().eq("participant_id", participantId);

  revalidatePath("/admin");
  redirect("/admin");
}

export async function addCostume(formData: FormData) {
  await requireAdmin();
  const name = value(formData, "name");
  const description = value(formData, "description");

  if (!name) {
    redirect("/admin?error=missing-costume");
  }

  const supabase = getSupabaseAdmin();
  await supabase.from("costumes").insert({ name, description });

  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateCostume(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id");
  const name = value(formData, "name");
  const description = value(formData, "description");
  const active = formData.get("active") === "on";
  const supabase = getSupabaseAdmin();

  await supabase.from("costumes").update({ name, description, active }).eq("id", id);

  revalidatePath("/admin");
  redirect("/admin");
}
