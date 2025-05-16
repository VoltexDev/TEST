import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getUserBysteamId } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
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
      .from("tickets")
      .select(`
        *,
        users (username, avatar_url)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching ticket:", error)
      return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 })
    }

    // Check if the ticket belongs to the user or if the user is an admin
    if (data.user_id !== user.id && !user.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in ticket API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { steamId, status } = await request.json()

    if (!steamId || !status) {
      return NextResponse.json({ error: "Steam ID and status are required" }, { status: 400 })
    }

    const user = await getUserBysteamId(steamId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Only admins can update ticket status
    if (!user.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("tickets")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating ticket:", error)
      return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in ticket API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
