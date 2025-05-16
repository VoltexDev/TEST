"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { isAuthenticated, getCurrentUser } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [tradeUrl, setTradeUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in
    const authenticated = isAuthenticated()
    if (!authenticated) {
      router.push("/?login=required")
      return
    }

    const userData = getCurrentUser()
    setUser(userData)
    setLoading(false)

    // Fetch user profile data from API
    fetchUserProfile(userData.steamid)
  }, [router])

  const fetchUserProfile = async (steamId: string) => {
    try {
      const response = await fetch(`/api/users/profile?steamId=${steamId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch profile")
      }
      const data = await response.json()

      // Update trade URL if available
      if (data.trade_url) {
        setTradeUrl(data.trade_url)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const handleUpdateTradeUrl = async () => {
    try {
      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          steamId: user.steamid,
          tradeUrl,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update trade URL")
      }

      toast({
        title: "Success",
        description: "Trade URL updated successfully",
      })
    } catch (error) {
      console.error("Error updating trade URL:", error)
      toast({
        title: "Error",
        description: "Failed to update trade URL",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {user?.avatarfull && (
                <Image
                  src={user.avatarfull || "/placeholder.svg"}
                  alt={user.personaname}
                  width={184}
                  height={184}
                  className="rounded-lg mb-4"
                />
              )}
              <h2 className="text-xl font-bold">{user?.personaname}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Steam ID: {user?.steamid}</p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(`https://steamcommunity.com/profiles/${user?.steamid}`, "_blank")}
              >
                View Steam Profile
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="settings">
            <TabsList className="mb-4">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            </TabsList>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account settings and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="trade-url">Steam Trade URL</Label>
                    <Input
                      id="trade-url"
                      placeholder="https://steamcommunity.com/tradeoffer/new/?partner=..."
                      value={tradeUrl}
                      onChange={(e) => setTradeUrl(e.target.value)}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Your trade URL is required for receiving skins. You can find it in your{" "}
                      <a
                        href="https://steamcommunity.com/my/tradeoffers/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Steam inventory privacy settings
                      </a>
                      .
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleUpdateTradeUrl}>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>View your recent purchases and sales</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No transactions found. Start trading to see your history here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
