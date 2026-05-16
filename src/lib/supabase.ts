import { createClient } from "@supabase/supabase-js";

export type Participant = {
  id: string;
  display_name: string;
  active: boolean;
  login_code_hash: string;
};

export type Costume = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
};

export type ResultRow = {
  costume_id: string;
  costume_name: string;
  vote_count: number;
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
