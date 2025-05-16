import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getUserBysteamId } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const steamId = searchParams.get("steamId")

    if (!steamId) {
      return NextResponse.json({ error: "Steam ID is required" }, { status: 400 })
    }

    const user = await getUserBysteamId(steamId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        seller:seller_id (username, avatar_url),
        buyer:buyer_id (username, avatar_url),
        skins (*)
      `)
      .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching transactions:", error)
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in transactions API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
