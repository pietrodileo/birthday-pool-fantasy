import { createClient } from "@supabase/supabase-js";

export type Participant = {
  id: string;
  pool_id: string;
  display_name: string;
  character_name: string | null;
  active: boolean;
  login_code_hash: string;
};

export type Costume = {
  id: string;
  pool_id: string;
  name: string;
  description: string | null;
  active: boolean;
};

export type Pool = {
  id: string;
  name: string;
  is_open: boolean;
  registration_open: boolean;
  voting_open: boolean;
  results_visible: boolean;
  created_at: string;
};

export type ResultRow = {
  costume_id: string;
  costume_name: string;
  vote_count: number;
};

export type ParticipantVoteRow = {
  participant_id: string;
  display_name: string;
  character_name: string | null;
  costume_name: string | null;
  voted_at: string | null;
};

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
