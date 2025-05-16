import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getUserBysteamId } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("inventory")
      .select(`
        *,
        skins (*),
        users (username, avatar_url)
      `)
      .eq("id", id)
      .eq("is_for_sale", true)
      .single()

    if (error) {
      console.error("Error fetching marketplace item:", error)
      return NextResponse.json({ error: "Failed to fetch marketplace item" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in marketplace item API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { steamId } = await request.json()

    if (!steamId) {
      return NextResponse.json({ error: "Steam ID is required" }, { status: 400 })
    }

    const buyer = await getUserBysteamId(steamId)
    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 })
    }

    const supabase = createServerSupabaseClient()

    // Get the marketplace item
    const { data: item, error: itemError } = await supabase
      .from("inventory")
      .select(`
        *,
        skins (*),
        users (*)
      `)
      .eq("id", id)
      .eq("is_for_sale", true)
      .single()

    if (itemError || !item) {
      console.error("Error fetching marketplace item:", itemError)
      return NextResponse.json({ error: "Marketplace item not found" }, { status: 404 })
    }

    // Check if buyer has enough balance
    if (buyer.balance < item.asking_price) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Start a transaction
    const { error: transactionError } = await supabase.rpc("purchase_skin", {
      p_inventory_id: id,
      p_buyer_id: buyer.id,
      p_seller_id: item.user_id,
      p_price: item.asking_price,
      p_skin_id: item.skin_id,
    })

    if (transactionError) {
      console.error("Error processing purchase:", transactionError)
      return NextResponse.json({ error: "Failed to process purchase" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Purchase successful" })
  } catch (error) {
    console.error("Error in marketplace purchase API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
