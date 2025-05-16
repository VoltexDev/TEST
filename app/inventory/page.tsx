"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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

interface InventoryItem {
  id: string
  user_id: string
  skin_id: string
  is_for_sale: boolean
  asking_price: number | null
  skins: Skin
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [price, setPrice] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const user = getCurrentUser()
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to view your inventory",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`/api/inventory?steamId=${user.steamid}`)
      if (!response.ok) {
        throw new Error("Failed to fetch inventory")
      }
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error("Error fetching inventory:", error)
      toast({
        title: "Error",
        description: "Failed to load inventory items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSellClick = (item: InventoryItem) => {
    setSelectedItem(item)
    setPrice(item.is_for_sale && item.asking_price ? item.asking_price.toString() : "")
    setDialogOpen(true)
  }

  const handleSellSubmit = async () => {
    try {
      if (!selectedItem) return

      const priceValue = Number.parseFloat(price)
      if (isNaN(priceValue) || priceValue <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid price",
          variant: "destructive",
        })
        return
      }

      const user = getCurrentUser()
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to sell items",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/marketplace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          steamId: user.steamid,
          inventoryId: selectedItem.id,
          price: priceValue,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to list item for sale")
      }

      toast({
        title: "Success",
        description: "Item listed for sale successfully!",
      })

      setDialogOpen(false)
      fetchInventory()
    } catch (error: any) {
      console.error("Error listing item for sale:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to list item for sale",
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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Inventory</h1>

      <div className="mb-6">
        <Input placeholder="Search skins..." value={filter} onChange={(e) => setFilter(e.target.value)} />
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
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No items found</h2>
          <p className="text-gray-500 dark:text-gray-400">
            You don't have any items in your inventory that match your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
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
                {item.is_for_sale && (
                  <div className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-sm">
                    For Sale: ${item.asking_price?.toFixed(2)}
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{item.skins.name}</CardTitle>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {item.skins.weapon} | Float: {item.skins.float_value}
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-xl font-bold">${item.skins.market_price.toFixed(2)}</div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={item.is_for_sale ? "outline" : "default"}
                  onClick={() => handleSellClick(item)}
                >
                  {item.is_for_sale ? "Update Price" : "Sell Item"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem?.is_for_sale ? "Update Listing Price" : "List Item for Sale"}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                <img
                  src={selectedItem?.skins.image_url || "/placeholder.svg?height=64&width=64"}
                  alt={selectedItem?.skins.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-medium">{selectedItem?.skins.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Market Price: ${selectedItem?.skins.market_price.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">
                Your Price
              </label>
              <Input
                id="price"
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter your asking price"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSellSubmit}>{selectedItem?.is_for_sale ? "Update Price" : "List for Sale"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
