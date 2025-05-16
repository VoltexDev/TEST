import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getUserBysteamId } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const steamId = searchParams.get("steamId")
    const status = searchParams.get("status")

    if (!steamId) {
      return NextResponse.json({ error: "Steam ID is required" }, { status: 400 })
    }

    const user = await getUserBysteamId(steamId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const supabase = createServerSupabaseClient()
    let query = supabase
      .from("tickets")
      .select(`
        *,
        users (username, avatar_url)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching tickets:", error)
      return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in tickets API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { steamId, title, type, message, skin } = await request.json()

    if (!steamId || !title || !type || !message) {
      return NextResponse.json({ error: "Steam ID, title, type, and message are required" }, { status: 400 })
    }

    const user = await getUserBysteamId(steamId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("tickets")
      .insert({
        user_id: user.id,
        title,
        type,
        message,
        skin: skin || null,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating ticket:", error)
      return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in tickets API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
