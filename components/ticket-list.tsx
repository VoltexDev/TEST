"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentUser, isTrader } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface User {
  username: string
  avatar_url: string | null
}

interface Ticket {
  id: string
  user_id: string
  title: string
  status: string
  type: string
  message: string | null
  skin: string | null
  created_at: string
  updated_at: string
  users: User
}

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const router = useRouter()
  const { toast } = useToast()
  const isAdmin = isTrader()

  useEffect(() => {
    fetchTickets()
  }, [statusFilter])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const user = getCurrentUser()
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to view tickets",
          variant: "destructive",
        })
        return
      }

      let url = `/api/tickets?steamId=${user.steamid}`
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Failed to fetch tickets")
      }
      const data = await response.json()
      setTickets(data)
    } catch (error) {
      console.error("Error fetching tickets:", error)
      toast({
        title: "Error",
        description: "Failed to load tickets",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "in_progress":
        return "bg-blue-500"
      case "resolved":
        return "bg-green-500"
      case "closed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  const handleViewTicket = (ticketId: string) => {
    router.push(`/tickets/${ticketId}`)
  }

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      const user = getCurrentUser()
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to update ticket status",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          steamId: user.steamid,
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update ticket status")
      }

      toast({
        title: "Success",
        description: "Ticket status updated successfully!",
      })

      // Update the ticket in the list
      setTickets((prevTickets) =>
        prevTickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket)),
      )
    } catch (error: any) {
      console.error("Error updating ticket status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update ticket status",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Support Tickets</h2>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tickets</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => router.push("/tickets/new")}>New Ticket</Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </CardHeader>
              <CardContent className="py-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No tickets found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {statusFilter === "all"
              ? "You don't have any support tickets yet."
              : `You don't have any ${statusFilter} tickets.`}
          </p>
          <Button className="mt-4" onClick={() => router.push("/tickets/new")}>
            Create a New Ticket
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{ticket.title}</CardTitle>
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)} • Created:{" "}
                  {formatDate(ticket.created_at)}
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-sm line-clamp-2">{ticket.message}</p>
                {ticket.skin && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Related Skin:</span> {ticket.skin}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleViewTicket(ticket.id)}>
                  View Details
                </Button>
                {isAdmin && (
                  <Select value={ticket.status} onValueChange={(value) => handleUpdateStatus(ticket.id, value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
