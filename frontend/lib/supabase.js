import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Sign-in only exists when Supabase is set up. Without it, everyone is a guest.
export const supabase = url && key ? createClient(url, key) : null;

// The signed-in user's token, sent to our backend so it knows who is asking
export async function accessToken() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}
