import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Client-side (browser safe)
export const supabase = createClient(url || "https://placeholder.supabase.co", anon || "placeholder");

// Server-side only — lazy init to avoid build-time crash when env vars missing
export function getSupabaseAdmin() {
  if (!url || !service) {
    throw new Error("Supabase env vars not configured");
  }
  return createClient(url, service);
}

// Keep named export for backwards compat
export const supabaseAdmin = {
  from: (table: string) => getSupabaseAdmin().from(table),
};
