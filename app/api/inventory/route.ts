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
      .from("inventory")
      .select(`
        *,
        skins (*)
      `)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error fetching inventory:", error)
      return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in inventory API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { steamId, skinId } = await request.json()

    if (!steamId || !skinId) {
      return NextResponse.json({ error: "Steam ID and Skin ID are required" }, { status: 400 })
    }

    const user = await getUserBysteamId(steamId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("inventory")
      .insert({
        user_id: user.id,
        skin_id: skinId,
        is_for_sale: false,
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding skin to inventory:", error)
      return NextResponse.json({ error: "Failed to add skin to inventory" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in inventory API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
