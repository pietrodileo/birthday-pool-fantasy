import { getSupabaseAdmin, type Costume, type Participant, type ResultRow } from "./supabase";

export async function getActiveParticipants() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("participants")
    .select("id, display_name, active, login_code_hash")
    .eq("active", true)
    .order("display_name");

  if (error) {
    throw error;
  }

  return data as Participant[];
}

export async function getAllParticipants() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("participants")
    .select("id, display_name, active, login_code_hash")
    .order("display_name");

  if (error) {
    throw error;
  }

  return data as Participant[];
}

export async function getActiveCostumes() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("costumes")
    .select("id, name, description, active")
    .eq("active", true)
    .order("name");

  if (error) {
    throw error;
  }

  return data as Costume[];
}

export async function getAllCostumes() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("costumes")
    .select("id, name, description, active")
    .order("name");

  if (error) {
    throw error;
  }

  return data as Costume[];
}

export async function getParticipantVote(participantId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("votes")
    .select("costume_id, costumes(name)")
    .eq("participant_id", participantId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getResults(): Promise<ResultRow[]> {
  const supabase = getSupabaseAdmin();
  const { data: costumes, error: costumesError } = await supabase
    .from("costumes")
    .select("id, name")
    .eq("active", true)
    .order("name");

  if (costumesError) {
    throw costumesError;
  }

  const { data: votes, error: votesError } = await supabase.from("votes").select("costume_id");

  if (votesError) {
    throw votesError;
  }

  const counts = new Map<string, number>();
  votes.forEach((vote) => counts.set(vote.costume_id, (counts.get(vote.costume_id) ?? 0) + 1));

  return costumes.map((costume) => ({
    costume_id: costume.id,
    costume_name: costume.name,
    vote_count: counts.get(costume.id) ?? 0
  }));
}
