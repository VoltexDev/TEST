"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { getCurrentUser, isTrader } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  steam_id: string
  username: string
  avatar_url: string | null
  balance: number
  is_admin: boolean
  created_at: string
}

interface Ticket {
  id: string
  user_id: string
  title: string
  status: string
  type: string
  created_at: string
  users: {
    username: string
    avatar_url: string | null
  }
}

interface Transaction {
  id: string
  seller_id: string | null
  buyer_id: string | null
  skin_id: string | null
  price: number
  status: string
  created_at: string
  seller: {
    username: string
    avatar_url: string | null
  } | null
  buyer: {
    username: string
    avatar_url: string | null
  } | null
  skins: {
    name: string
    image_url: string | null
  } | null
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkAdmin = () => {
      if (!isTrader()) {
        toast({
          title: "Unauthorized",
          description: "You do not have permission to access this page",
          variant: "destructive",
        })
        router.push("/")
      } else {
        fetchData()
      }
    }

    checkAdmin()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const user = getCurrentUser()
      if (!user) return

      // Fetch users
      const usersResponse = await fetch(`/api/admin/users?steamId=${user.steamid}`)
      if (!usersResponse.ok) {
        throw new Error("Failed to fetch users")
      }
      const usersData = await usersResponse.json()
      setUsers(usersData)

      // Fetch tickets
      const ticketsResponse = await fetch(`/api/admin/tickets?steamId=${user.steamid}`)
      if (!ticketsResponse.ok) {
        throw new Error("Failed to fetch tickets")
      }
      const ticketsData = await ticketsResponse.json()
      setTickets(ticketsData)

      // Fetch transactions
      const transactionsResponse = await fetch(`/api/admin/transactions?steamId=${user.steamid}`)
      if (!transactionsResponse.ok) {
        throw new Error("Failed to fetch transactions")
      }
      const transactionsData = await transactionsResponse.json()
      setTransactions(transactionsData)
    } catch (error) {
      console.error("Error fetching admin data:", error)
      toast({
        title: "Error",
        description: "Failed to load admin dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-500"
      case "in_progress":
        return "text-blue-500"
      case "resolved":
        return "text-green-500"
      case "completed":
        return "text-green-500"
      case "closed":
        return "text-gray-500"
      default:
        return "text-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              </CardHeader>
              <CardContent>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {tickets.filter((ticket) => ticket.status !== "resolved" && ticket.status !== "closed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tickets">
        <TabsList className="mb-4">
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Recent Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 dark:text-gray-400">No tickets found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Title</th>
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Created</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.slice(0, 10).map((ticket) => (
                        <tr key={ticket.id} className="border-b">
                          <td className="py-3 px-4">{ticket.title}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <img
                                src={ticket.users.avatar_url || "/placeholder.svg?height=32&width=32"}
                                alt={ticket.users.username}
                                className="h-6 w-6 rounded-full"
                              />
                              <span>{ticket.users.username}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{ticket.type}</td>
                          <td className={`py-3 px-4 ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace("_", " ")}
                          </td>
                          <td className="py-3 px-4">{formatDate(ticket.created_at)}</td>
                          <td className="py-3 px-4">
                            <Button variant="outline" size="sm" onClick={() => router.push(`/tickets/${ticket.id}`)}>
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 dark:text-gray-400">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Steam ID</th>
                        <th className="text-left py-3 px-4">Balance</th>
                        <th className="text-left py-3 px-4">Admin</th>
                        <th className="text-left py-3 px-4">Joined</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <img
                                src={user.avatar_url || "/placeholder.svg?height=32&width=32"}
                                alt={user.username}
                                className="h-6 w-6 rounded-full"
                              />
                              <span>{user.username}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{user.steam_id}</td>
                          <td className="py-3 px-4">${user.balance.toFixed(2)}</td>
                          <td className="py-3 px-4">{user.is_admin ? "Yes" : "No"}</td>
                          <td className="py-3 px-4">{formatDate(user.created_at)}</td>
                          <td className="py-3 px-4">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Item</th>
                        <th className="text-left py-3 px-4">Seller</th>
                        <th className="text-left py-3 px-4">Buyer</th>
                        <th className="text-left py-3 px-4">Price</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 10).map((transaction) => (
                        <tr key={transaction.id} className="border-b">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <img
                                src={transaction.skins?.image_url || "/placeholder.svg?height=32&width=32"}
                                alt={transaction.skins?.name}
                                className="h-6 w-6 rounded"
                              />
                              <span>{transaction.skins?.name || "Unknown Item"}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {transaction.seller ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={transaction.seller.avatar_url || "/placeholder.svg?height=32&width=32"}
                                  alt={transaction.seller.username}
                                  className="h-6 w-6 rounded-full"
                                />
                                <span>{transaction.seller.username}</span>
                              </div>
                            ) : (
                              "Unknown"
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {transaction.buyer ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={transaction.buyer.avatar_url || "/placeholder.svg?height=32&width=32"}
                                  alt={transaction.buyer.username}
                                  className="h-6 w-6 rounded-full"
                                />
                                <span>{transaction.buyer.username}</span>
                              </div>
                            ) : (
                              "Unknown"
                            )}
                          </td>
                          <td className="py-3 px-4">${transaction.price.toFixed(2)}</td>
                          <td className={`py-3 px-4 ${getStatusColor(transaction.status)}`}>{transaction.status}</td>
                          <td className="py-3 px-4">{formatDate(transaction.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
