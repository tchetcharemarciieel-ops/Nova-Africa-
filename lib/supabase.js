import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const CONTACT = {
  whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || "",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || "",
};
