"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentUser } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface Skin {
  id: string
  name: string
  description: string
  image_url: string
  wear: number
  float_value: number
  rarity: string
  type: string
  weapon: string
  market_price: number
}

interface MarketplaceItem {
  id: string
  user_id: string
  skin_id: string
  is_for_sale: boolean
  asking_price: number
  skins: Skin
  users: {
    username: string
    avatar_url: string
  }
}

export default function MarketplacePage() {
  const [items, setItems] = useState<MarketplaceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [sortBy, setSortBy] = useState("price_asc")
  const { toast } = useToast()

  useEffect(() => {
    fetchMarketplaceItems()
  }, [])

  const fetchMarketplaceItems = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/marketplace")
      if (!response.ok) {
        throw new Error("Failed to fetch marketplace items")
      }
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error("Error fetching marketplace items:", error)
      toast({
        title: "Error",
        description: "Failed to load marketplace items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (itemId: string) => {
    try {
      const user = getCurrentUser()
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to purchase items",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`/api/marketplace/${itemId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          steamId: user.steamid,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to purchase item")
      }

      toast({
        title: "Success",
        description: "Item purchased successfully!",
      })

      // Refresh the marketplace items
      fetchMarketplaceItems()
    } catch (error: any) {
      console.error("Error purchasing item:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to purchase item",
        variant: "destructive",
      })
    }
  }

  const filteredItems = items.filter((item) => {
    if (!filter) return true
    return (
      item.skins.name.toLowerCase().includes(filter.toLowerCase()) ||
      item.skins.weapon.toLowerCase().includes(filter.toLowerCase()) ||
      item.skins.type.toLowerCase().includes(filter.toLowerCase())
    )
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "price_asc":
        return a.asking_price - b.asking_price
      case "price_desc":
        return b.asking_price - a.asking_price
      case "name_asc":
        return a.skins.name.localeCompare(b.skins.name)
      case "name_desc":
        return b.skins.name.localeCompare(a.skins.name)
      default:
        return 0
    }
  })

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Marketplace</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input placeholder="Search skins..." value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
        <div className="w-full md:w-64">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="name_asc">Name: A to Z</SelectItem>
              <SelectItem value="name_desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="h-48 bg-gray-200 dark:bg-gray-700" />
              <CardContent className="py-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No items found</h2>
          <p className="text-gray-500 dark:text-gray-400">
            There are no items available in the marketplace that match your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <img
                  src={item.skins.image_url || "/placeholder.svg?height=300&width=300"}
                  alt={item.skins.name}
                  className="h-full w-full object-contain"
                />
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  {item.skins.rarity}
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{item.skins.name}</CardTitle>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {item.skins.weapon} | Float: {item.skins.float_value}
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={item.users.avatar_url || "/placeholder.svg?height=32&width=32"}
                    alt={item.users.username}
                    className="h-6 w-6 rounded-full"
                  />
                  <span className="text-sm">{item.users.username}</span>
                </div>
                <div className="text-xl font-bold">${item.asking_price.toFixed(2)}</div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handlePurchase(item.id)}>
                  Purchase
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
