/**
 * Permail needs credentials before it can do anything. Rather than throwing deep
 * inside the Supabase client, we check up front and show a setup screen.
 */

export const SUPABASE_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export const SENDING_VARS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
] as const;

/** NEXT_PUBLIC_* values are inlined at build time, so read them literally. */
function read(name: string): string | undefined {
  switch (name) {
    case "NEXT_PUBLIC_SUPABASE_URL":
      return process.env.NEXT_PUBLIC_SUPABASE_URL;
    case "NEXT_PUBLIC_SUPABASE_ANON_KEY":
      return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    case "SUPABASE_SERVICE_ROLE_KEY":
      return process.env.SUPABASE_SERVICE_ROLE_KEY;
    case "GOOGLE_CLIENT_ID":
      return process.env.GOOGLE_CLIENT_ID;
    case "GOOGLE_CLIENT_SECRET":
      return process.env.GOOGLE_CLIENT_SECRET;
    default:
      return undefined;
  }
}

export function missingVars(names: readonly string[]): string[] {
  return names.filter((name) => !read(name)?.trim());
}

export function isConfigured(): boolean {
  return missingVars(SUPABASE_VARS).length === 0;
}
