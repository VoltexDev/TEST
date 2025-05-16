export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          steam_id: string
          username: string
          avatar_url: string | null
          trade_url: string | null
          balance: number
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          steam_id: string
          username: string
          avatar_url?: string | null
          trade_url?: string | null
          balance?: number
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          steam_id?: string
          username?: string
          avatar_url?: string | null
          trade_url?: string | null
          balance?: number
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      skins: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          wear: number | null
          float_value: number | null
          rarity: string | null
          type: string | null
          weapon: string | null
          market_price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          wear?: number | null
          float_value?: number | null
          rarity?: string | null
          type?: string | null
          weapon?: string | null
          market_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          wear?: number | null
          float_value?: number | null
          rarity?: string | null
          type?: string | null
          weapon?: string | null
          market_price?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      inventory: {
        Row: {
          id: string
          user_id: string
          skin_id: string
          is_for_sale: boolean
          asking_price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skin_id: string
          is_for_sale?: boolean
          asking_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skin_id?: string
          is_for_sale?: boolean
          asking_price?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          user_id: string
          title: string
          status: string
          type: string
          message: string | null
          skin: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          status?: string
          type: string
          message?: string | null
          skin?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          status?: string
          type?: string
          message?: string | null
          skin?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ticket_messages: {
        Row: {
          id: string
          ticket_id: string
          user_id: string
          is_admin: boolean
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          user_id: string
          is_admin?: boolean
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          user_id?: string
          is_admin?: boolean
          message?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          seller_id: string | null
          buyer_id: string | null
          skin_id: string | null
          price: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id?: string | null
          buyer_id?: string | null
          skin_id?: string | null
          price: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string | null
          buyer_id?: string | null
          skin_id?: string | null
          price?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
