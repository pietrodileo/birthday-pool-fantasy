"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hashSecret, verifySecret } from "@/lib/crypto";
import { getActivePool } from "@/lib/data";
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

async function requireActivePool() {
  const pool = await getActivePool();

  if (!pool) {
    redirect("/login?error=no-pool");
  }

  return pool;
}

export async function registerParticipant(formData: FormData) {
  const session = await getSession();

  if (!session || session.role !== "guest") {
    redirect("/login");
  }

  const pool = await requireActivePool();

  if (!pool.registration_open) {
    redirect("/register?error=closed");
  }

  const characterName = value(formData, "characterName");
  const description = value(formData, "description");

  if (!characterName) {
    redirect("/register?error=missing");
  }

  const supabase = getSupabaseAdmin();
  const { error: participantError } = await supabase
    .from("participants")
    .update({ character_name: characterName })
    .eq("pool_id", pool.id)
    .eq("id", session.participantId);

  if (participantError) {
    redirect("/register?error=failed");
  }

  const costumePayload = {
    pool_id: pool.id,
    participant_id: session.participantId,
    name: characterName,
    description: description || `Costume di ${session.displayName}`,
    active: true
  };
  const { data: existingCostume } = await supabase
    .from("costumes")
    .select("id")
    .eq("pool_id", pool.id)
    .eq("participant_id", session.participantId)
    .maybeSingle();
  const { error: costumeError } = existingCostume
    ? await supabase.from("costumes").update(costumePayload).eq("id", existingCostume.id)
    : await supabase.from("costumes").insert(costumePayload);

  if (costumeError) {
    redirect("/register?error=failed");
  }

  redirect("/vote?registered=1");
}

export async function loginGuest(formData: FormData) {
  const pool = await requireActivePool();
  const participantId = value(formData, "participantId");
  const code = value(formData, "code");
  const supabase = getSupabaseAdmin();
  const { data: participant } = await supabase
    .from("participants")
    .select("id, pool_id, display_name, character_name, active, login_code_hash")
    .eq("pool_id", pool.id)
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

  const pool = await requireActivePool();

  if (!pool.voting_open) {
    redirect("/vote?error=voting-closed");
  }

  const costumeId = value(formData, "costumeId");
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("votes").insert({
    pool_id: pool.id,
    participant_id: session.participantId,
    costume_id: costumeId
  });

  if (error) {
    redirect("/vote?error=already-voted");
  }

  redirect("/thanks");
}

export async function updatePoolSettings(formData: FormData) {
  await requireAdmin();
  const pool = await requireActivePool();
  const supabase = getSupabaseAdmin();

  await supabase
    .from("pools")
    .update({
      name: value(formData, "name") || pool.name,
      registration_open: formData.get("registrationOpen") === "on",
      voting_open: formData.get("votingOpen") === "on",
      results_visible: formData.get("resultsVisible") === "on"
    })
    .eq("id", pool.id);

  revalidatePath("/admin");
  redirect("/admin");
}

export async function resetPoolVotes() {
  await requireAdmin();
  const pool = await requireActivePool();
  const supabase = getSupabaseAdmin();
  await supabase.from("votes").delete().eq("pool_id", pool.id);

  revalidatePath("/admin");
  redirect("/admin");
}

export async function createNewPool(formData: FormData) {
  await requireAdmin();
  const name = value(formData, "name") || `Concilio dei Costumi ${new Date().toLocaleDateString("it-IT")}`;
  const supabase = getSupabaseAdmin();

  await supabase.from("pools").update({ is_open: false, voting_open: false, results_visible: false }).eq("is_open", true);

  const { data: pool, error } = await supabase
    .from("pools")
    .insert({
      name,
      is_open: true,
      registration_open: true,
      voting_open: false,
      results_visible: false
    })
    .select("id")
    .single();

  if (error || !pool) {
    redirect("/admin?error=pool-create");
  }

  await supabase.from("costumes").insert([
    { pool_id: pool.id, name: "Il Cavaliere d'Argento", description: "Armatura, mantello e sguardo da leggenda." },
    { pool_id: pool.id, name: "La Strega del Bosco", description: "Pozioni, mistero e sentieri dimenticati." },
    { pool_id: pool.id, name: "Il Domatore di Draghi", description: "Scaglie, cuoio e coraggio temerario." },
    { pool_id: pool.id, name: "Il Bardo Reale", description: "Canti, dramma e carisma da sala del trono." }
  ]);

  revalidatePath("/admin");
  redirect("/admin");
}

export async function addParticipant(formData: FormData) {
  await requireAdmin();
  const pool = await requireActivePool();
  const displayName = value(formData, "displayName");
  const characterName = value(formData, "characterName");
  const code = value(formData, "code");

  if (!displayName || !code) {
    redirect("/admin?error=missing-participant");
  }

  const supabase = getSupabaseAdmin();
  await supabase.from("participants").insert({
    pool_id: pool.id,
    display_name: displayName,
    character_name: characterName,
    login_code_hash: hashSecret(code)
  });

  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateParticipant(formData: FormData) {
  await requireAdmin();
  const pool = await requireActivePool();
  const id = value(formData, "id");
  const displayName = value(formData, "displayName");
  const characterName = value(formData, "characterName");
  const active = formData.get("active") === "on";
  const code = value(formData, "code");
  const supabase = getSupabaseAdmin();
  const patch: { display_name: string; character_name: string | null; active: boolean; login_code_hash?: string } = {
    display_name: displayName,
    character_name: characterName || null,
    active
  };

  if (code) {
    patch.login_code_hash = hashSecret(code);
  }

  await supabase.from("participants").update(patch).eq("pool_id", pool.id).eq("id", id);

  revalidatePath("/admin");
  redirect("/admin");
}

export async function resetParticipantVote(formData: FormData) {
  await requireAdmin();
  const pool = await requireActivePool();
  const participantId = value(formData, "participantId");
  const supabase = getSupabaseAdmin();
  await supabase.from("votes").delete().eq("pool_id", pool.id).eq("participant_id", participantId);

  revalidatePath("/admin");
  redirect("/admin");
}

export async function addCostume(formData: FormData) {
  await requireAdmin();
  const pool = await requireActivePool();
  const name = value(formData, "name");
  const description = value(formData, "description");

  if (!name) {
    redirect("/admin?error=missing-costume");
  }

  const supabase = getSupabaseAdmin();
  await supabase.from("costumes").insert({ pool_id: pool.id, name, description });

  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateCostume(formData: FormData) {
  await requireAdmin();
  const pool = await requireActivePool();
  const id = value(formData, "id");
  const name = value(formData, "name");
  const description = value(formData, "description");
  const active = formData.get("active") === "on";
  const supabase = getSupabaseAdmin();

  await supabase.from("costumes").update({ name, description, active }).eq("pool_id", pool.id).eq("id", id);

  revalidatePath("/admin");
  redirect("/admin");
}
