import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://oynpeusuqylibcmolvub.supabase.co"
const supabaseAnonKey = "sb_publishable_qysuqVBUW9wvYFQaZEHygA__xNQYxso"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
