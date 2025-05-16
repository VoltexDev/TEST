import { getSupabaseClient } from "@/lib/supabase/client"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// List of Steam IDs that have trader/admin privileges
export const TRADER_STEAM_IDS = [
  "76561198012345678", // Example Steam ID 1
  "76561198087654321", // Example Steam ID 2
]

// Check if a user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window !== "undefined") {
    const steamUser = localStorage.getItem("steamUser")
    return !!steamUser
  }
  return false
}

// Check if a user is a trader/admin
export function isTrader(): boolean {
  if (typeof window !== "undefined") {
    const steamUser = localStorage.getItem("steamUser")
    if (!steamUser) return false

    try {
      const user = JSON.parse(steamUser)
      return TRADER_STEAM_IDS.includes(user.steamid)
    } catch (error) {
      console.error("Error parsing steam user data:", error)
      return false
    }
  }
  return false
}

// Get the current user's data
export function getCurrentUser() {
  if (typeof window !== "undefined") {
    const steamUser = localStorage.getItem("steamUser")
    if (!steamUser) return null

    try {
      return JSON.parse(steamUser)
    } catch (error) {
      console.error("Error parsing steam user data:", error)
      return null
    }
  }
  return null
}

// Save user data to localStorage
export function saveUserData(userData: any): void {
  if (typeof window !== "undefined" && userData) {
    try {
      localStorage.setItem("steamUser", JSON.stringify(userData))
    } catch (error) {
      console.error("Error saving user data:", error)
    }
  }
}

// Clear user data from localStorage (logout)
export function clearUserData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("steamUser")
  }
}

// Create or update user in Supabase after Steam login
export async function createOrUpdateUser(steamUser: any) {
  const supabase = getSupabaseClient()

  // Check if user exists
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("steam_id", steamUser.steamid)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error fetching user:", fetchError)
    throw fetchError
  }

  if (existingUser) {
    // Update user
    const { error: updateError } = await supabase
      .from("users")
      .update({
        username: steamUser.personaname,
        avatar_url: steamUser.avatarfull,
        updated_at: new Date().toISOString(),
      })
      .eq("steam_id", steamUser.steamid)

    if (updateError) {
      console.error("Error updating user:", updateError)
      throw updateError
    }

    return existingUser
  } else {
    // Create new user
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        steam_id: steamUser.steamid,
        username: steamUser.personaname,
        avatar_url: steamUser.avatarfull,
        balance: 0,
        is_admin: TRADER_STEAM_IDS.includes(steamUser.steamid),
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating user:", insertError)
      throw insertError
    }

    return newUser
  }
}

// Get user by Steam ID (server-side)
export async function getUserBysteamId(steamId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("users").select("*").eq("steam_id", steamId).single()

  if (error) {
    console.error("Error fetching user:", error)
    return null
  }

  return data
}
