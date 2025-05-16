"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { isAuthenticated, getCurrentUser, isTrader } from "@/lib/auth"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Home, ShoppingBag, Package, Ticket, User, LogOut, Settings } from "lucide-react"

export function Navigation() {
  const [user, setUser] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is logged in
    const authenticated = isAuthenticated()
    setIsLoggedIn(authenticated)

    if (authenticated) {
      const userData = getCurrentUser()
      setUser(userData)
      setIsAdmin(isTrader())
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("steamUser")
    window.location.href = "/"
  }

  const navItems = [
    { name: "Home", href: "/", icon: <Home className="h-5 w-5" /> },
    { name: "Marketplace", href: "/marketplace", icon: <ShoppingBag className="h-5 w-5" /> },
    { name: "Inventory", href: "/inventory", icon: <Package className="h-5 w-5" />, requireAuth: true },
    { name: "Support", href: "/tickets", icon: <Ticket className="h-5 w-5" />, requireAuth: true },
    { name: "Profile", href: "/profile", icon: <User className="h-5 w-5" />, requireAuth: true },
    { name: "Admin", href: "/admin/dashboard", icon: <Settings className="h-5 w-5" />, requireAdmin: true },
  ]

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              SkinsExpress
            </Link>
            <nav className="ml-10 hidden md:flex space-x-4">
              {navItems.map((item) => {
                if ((item.requireAuth && !isLoggedIn) || (item.requireAdmin && !isAdmin)) {
                  return null
                }
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === item.href
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex items-center">
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
                  <span className="text-gray-900 dark:text-white hidden md:inline">{user?.personaname}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => {
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
                }}
              >
                Login with Steam
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
