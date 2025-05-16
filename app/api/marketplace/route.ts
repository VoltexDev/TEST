import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getUserBysteamId } from "@/lib/auth"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("inventory")
      .select(`
        *,
        skins (*),
        users (username, avatar_url)
      `)
      .eq("is_for_sale", true)

    if (error) {
      console.error("Error fetching marketplace items:", error)
      return NextResponse.json({ error: "Failed to fetch marketplace items" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in marketplace API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { steamId, inventoryId, price } = await request.json()

    if (!steamId || !inventoryId || !price) {
      return NextResponse.json({ error: "Steam ID, Inventory ID, and Price are required" }, { status: 400 })
    }

    const user = await getUserBysteamId(steamId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const supabase = createServerSupabaseClient()

    // First, check if the inventory item belongs to the user
    const { data: inventoryItem, error: inventoryError } = await supabase
      .from("inventory")
      .select("*")
      .eq("id", inventoryId)
      .eq("user_id", user.id)
      .single()

    if (inventoryError || !inventoryItem) {
      console.error("Error fetching inventory item:", inventoryError)
      return NextResponse.json({ error: "Inventory item not found or doesn't belong to user" }, { status: 404 })
    }

    // Update the inventory item to be for sale
    const { data, error } = await supabase
      .from("inventory")
      .update({
        is_for_sale: true,
        asking_price: price,
        updated_at: new Date().toISOString(),
      })
      .eq("id", inventoryId)
      .select()
      .single()

    if (error) {
      console.error("Error listing item for sale:", error)
      return NextResponse.json({ error: "Failed to list item for sale" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in marketplace API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
