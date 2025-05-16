import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getUserBysteamId } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const ticketId = params.id
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

    // First, check if the ticket exists and if the user has access to it
    const { data: ticket, error: ticketError } = await supabase.from("tickets").select("*").eq("id", ticketId).single()

    if (ticketError) {
      console.error("Error fetching ticket:", ticketError)
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Check if the ticket belongs to the user or if the user is an admin
    if (ticket.user_id !== user.id && !user.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get the ticket messages
    const { data, error } = await supabase
      .from("ticket_messages")
      .select(`
        *,
        users (username, avatar_url)
      `)
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching ticket messages:", error)
      return NextResponse.json({ error: "Failed to fetch ticket messages" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in ticket messages API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const ticketId = params.id
    const { steamId, message } = await request.json()

    if (!steamId || !message) {
      return NextResponse.json({ error: "Steam ID and message are required" }, { status: 400 })
    }

    const user = await getUserBysteamId(steamId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const supabase = createServerSupabaseClient()

    // First, check if the ticket exists and if the user has access to it
    const { data: ticket, error: ticketError } = await supabase.from("tickets").select("*").eq("id", ticketId).single()

    if (ticketError) {
      console.error("Error fetching ticket:", ticketError)
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Check if the ticket belongs to the user or if the user is an admin
    if (ticket.user_id !== user.id && !user.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Add the message
    const { data, error } = await supabase
      .from("ticket_messages")
      .insert({
        ticket_id: ticketId,
        user_id: user.id,
        is_admin: user.is_admin,
        message,
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding ticket message:", error)
      return NextResponse.json({ error: "Failed to add ticket message" }, { status: 500 })
    }

    // Update the ticket's updated_at timestamp
    await supabase
      .from("tickets")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in ticket messages API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
