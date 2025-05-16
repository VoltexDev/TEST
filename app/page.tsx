"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { isAuthenticated, getCurrentUser, saveUserData } from "@/lib/auth"
import { useRouter, useSearchParams } from "next/navigation"

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if user is logged in
    const authenticated = isAuthenticated()
    setIsLoggedIn(authenticated)

    if (authenticated) {
      const userData = getCurrentUser()
      setUser(userData)
    }

    // Handle login callback
    const login = searchParams.get("login")
    const userData = searchParams.get("userData")

    if (login === "success" && userData) {
      try {
        const parsedUserData = JSON.parse(userData)
        saveUserData(parsedUserData)
        setUser(parsedUserData)
        setIsLoggedIn(true)

        // Remove query params from URL
        window.history.replaceState({}, document.title, window.location.pathname)
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [searchParams])

  const handleSteamLogin = () => {
    // Redirect to Steam OpenID login
    const steamOpenIDUrl = "https://steamcommunity.com/openid/login"
    const returnUrl = `${window.location.origin}/api/auth/steam/callback`

    const params = new URLSearchParams({
      "openid.ns": "http://specs.openid.net/auth/2.0",
      "openid.mode": "checkid_setup",
      "openid.return_to": returnUrl,
      "openid.realm": window.location.origin,
      "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
      "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    })

    window.location.href = `${steamOpenIDUrl}?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SkinsExpress</h1>
          <div>
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {user?.avatarmedium && (
                    <Image
                      src={user.avatarmedium || "/placeholder.svg"}
                      alt={user.personaname}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-gray-900 dark:text-white">{user?.personaname}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    localStorage.removeItem("steamUser")
                    setUser(null)
                    setIsLoggedIn(false)
                    router.push("/")
                  }}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button onClick={handleSteamLogin}>Login with Steam</Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Marketplace</CardTitle>
              <CardDescription>Browse and purchase CS:GO skins from other users</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Explore our marketplace to find the best deals on CS:GO skins.</p>
            </CardContent>
            <CardFooter>
              <Link href="/marketplace" className="w-full">
                <Button className="w-full">Browse Marketplace</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Inventory</CardTitle>
              <CardDescription>Manage your CS:GO skin inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <p>View your inventory, list items for sale, or manage your collection.</p>
            </CardContent>
            <CardFooter>
              <Link href="/inventory" className="w-full">
                <Button className="w-full" disabled={!isLoggedIn}>
                  View Inventory
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support</CardTitle>
              <CardDescription>Get help with your account or transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Create a support ticket if you need assistance with anything.</p>
            </CardContent>
            <CardFooter>
              <Link href="/tickets" className="w-full">
                <Button className="w-full" disabled={!isLoggedIn}>
                  Support Tickets
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
