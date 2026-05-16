import {
  getSupabaseAdmin,
  type Costume,
  type Participant,
  type ParticipantVoteRow,
  type Pool,
  type ResultRow
} from "./supabase";

export async function getActivePool() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("pools")
    .select("id, name, is_open, registration_open, voting_open, results_visible, created_at")
    .eq("is_open", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Pool | null;
}

export async function getAllPools() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("pools")
    .select("id, name, is_open, registration_open, voting_open, results_visible, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as Pool[];
}

export async function getActiveParticipants() {
  const pool = await getActivePool();

  if (!pool) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("participants")
    .select("id, pool_id, display_name, character_name, active, login_code_hash")
    .eq("pool_id", pool.id)
    .eq("active", true)
    .order("display_name");

  if (error) {
    throw error;
  }

  return data as Participant[];
}

export async function getAllParticipants(poolId?: string) {
  const pool = poolId ? { id: poolId } : await getActivePool();

  if (!pool) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("participants")
    .select("id, pool_id, display_name, character_name, active, login_code_hash")
    .eq("pool_id", pool.id)
    .order("display_name");

  if (error) {
    throw error;
  }

  return data as Participant[];
}

export async function getActiveCostumes() {
  const pool = await getActivePool();

  if (!pool) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("costumes")
    .select("id, pool_id, name, description, active")
    .eq("pool_id", pool.id)
    .eq("active", true)
    .order("name");

  if (error) {
    throw error;
  }

  return data as Costume[];
}

export async function getAllCostumes(poolId?: string) {
  const pool = poolId ? { id: poolId } : await getActivePool();

  if (!pool) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("costumes")
    .select("id, pool_id, name, description, active")
    .eq("pool_id", pool.id)
    .order("name");

  if (error) {
    throw error;
  }

  return data as Costume[];
}

export async function getParticipantVote(participantId: string) {
  const pool = await getActivePool();

  if (!pool) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("votes")
    .select("costume_id, created_at, costumes(name)")
    .eq("pool_id", pool.id)
    .eq("participant_id", participantId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getResults(poolId?: string): Promise<ResultRow[]> {
  const pool = poolId ? { id: poolId } : await getActivePool();

  if (!pool) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  const { data: costumes, error: costumesError } = await supabase
    .from("costumes")
    .select("id, name")
    .eq("pool_id", pool.id)
    .eq("active", true)
    .order("name");

  if (costumesError) {
    throw costumesError;
  }

  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("costume_id")
    .eq("pool_id", pool.id);

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

export async function getParticipantVotes(poolId?: string): Promise<ParticipantVoteRow[]> {
  const pool = poolId ? { id: poolId } : await getActivePool();

  if (!pool) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  const { data: participants, error: participantError } = await supabase
    .from("participants")
    .select("id, display_name, character_name")
    .eq("pool_id", pool.id)
    .order("display_name");

  if (participantError) {
    throw participantError;
  }

  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("participant_id, created_at, costumes(name)")
    .eq("pool_id", pool.id);

  if (votesError) {
    throw votesError;
  }

  const votesByParticipant = new Map<string, { costume_name: string | null; voted_at: string | null }>();

  votes.forEach((vote) => {
    const costume = vote.costumes as { name?: string } | null;
    votesByParticipant.set(vote.participant_id, {
      costume_name: costume?.name ?? null,
      voted_at: vote.created_at ?? null
    });
  });

  return participants.map((participant) => {
    const vote = votesByParticipant.get(participant.id);

    return {
      participant_id: participant.id,
      display_name: participant.display_name,
      character_name: participant.character_name,
      costume_name: vote?.costume_name ?? null,
      voted_at: vote?.voted_at ?? null
    };
  });
}
