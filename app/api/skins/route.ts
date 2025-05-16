import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("skins").select("*")

    if (error) {
      console.error("Error fetching skins:", error)
      return NextResponse.json({ error: "Failed to fetch skins" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in skins API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
