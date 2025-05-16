import type { Database } from "@/types/supabase"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}
