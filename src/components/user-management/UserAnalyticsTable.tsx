"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, CalendarIcon, Copy } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"

interface AnalyticsUser {
  id: number
  name: string
  email: string
  location: string
  userId: string
  dateJoined: string
  analytics: {
    totalClients: number
    clientsChange: number
    completedJobs: number
    jobsChange: number
    totalPayments: number
    paymentsChange: number
    profileViews: number
    viewsChange: number
  }
}

export default function UserAnalyticsTable() {
  const [roleFilter, setRoleFilter] = useState<string>("Freelancer")
  const [searchQuery, setSearchQuery] = useState("")
  const [date, setDate] = useState<Date | undefined>()
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AnalyticsUser | null>(null)

  // Mock data for analytics users
  const mockAnalyticsData: AnalyticsUser[] = [
    {
      id: 1,
      name: "Darlene Robertson",
      email: "darlene@example.com",
      location: "USA",
      userId: "wdsh1245w",
      dateJoined: "2016-03-04",
      analytics: {
        totalClients: 40,
        clientsChange: 8.5,
        completedJobs: 102,
        jobsChange: 13,
        totalPayments: 89000,
        paymentsChange: -5.3,
        profileViews: 134,
        viewsChange: -5.3,
      },
    },
    {
      id: 2,
      name: "Guy Hawkins",
      email: "guy@example.com",
      location: "England",
      userId: "wdsh1246w",
      dateJoined: "2019-07-11",
      analytics: {
        totalClients: 35,
        clientsChange: 12.2,
        completedJobs: 87,
        jobsChange: 8.7,
        totalPayments: 76500,
        paymentsChange: 15.8,
        profileViews: 98,
        viewsChange: 22.1,
      },
    },
    {
      id: 3,
      name: "Esther Howard",
      email: "esther@example.com",
      location: "Germany",
      userId: "wdsh1247w",
      dateJoined: "2012-10-28",
      analytics: {
        totalClients: 52,
        clientsChange: -2.1,
        completedJobs: 145,
        jobsChange: 5.4,
        totalPayments: 112000,
        paymentsChange: 8.9,
        profileViews: 187,
        viewsChange: -1.2,
      },
    },
    {
      id: 4,
      name: "Wade Warren",
      email: "wade@example.com",
      location: "Italy",
      userId: "wdsh1248w",
      dateJoined: "2012-05-19",
      analytics: {
        totalClients: 28,
        clientsChange: 18.3,
        completedJobs: 73,
        jobsChange: 25.6,
        totalPayments: 54200,
        paymentsChange: 32.1,
        profileViews: 156,
        viewsChange: 14.7,
      },
    },
    {
      id: 5,
      name: "Devon Lane",
      email: "devon@example.com",
      location: "New Zealand",
      userId: "wdsh1249w",
      dateJoined: "2012-04-21",
      analytics: {
        totalClients: 63,
        clientsChange: 7.8,
        completedJobs: 198,
        jobsChange: -3.2,
        totalPayments: 145000,
        paymentsChange: 12.4,
        profileViews: 234,
        viewsChange: 9.8,
      },
    },
    {
      id: 6,
      name: "Kathryn Murphy",
      email: "kathryn@example.com",
      location: "Australia",
      userId: "wdsh1250w",
      dateJoined: "2015-05-27",
      analytics: {
        totalClients: 41,
        clientsChange: -4.6,
        completedJobs: 119,
        jobsChange: 16.8,
        totalPayments: 98700,
        paymentsChange: -8.1,
        profileViews: 203,
        viewsChange: 11.3,
      },
    },
    {
      id: 7,
      name: "Cameron Williamson",
      email: "cameron@example.com",
      location: "Ireland",
      userId: "wdsh1251w",
      dateJoined: "2012-02-11",
      analytics: {
        totalClients: 37,
        clientsChange: 21.4,
        completedJobs: 156,
        jobsChange: 7.9,
        totalPayments: 87300,
        paymentsChange: 19.6,
        profileViews: 178,
        viewsChange: -6.4,
      },
    },
    {
      id: 8,
      name: "Floyd Miles",
      email: "floyd@example.com",
      location: "Scotland",
      userId: "wdsh1252w",
      dateJoined: "2014-08-30",
      analytics: {
        totalClients: 29,
        clientsChange: 14.7,
        completedJobs: 84,
        jobsChange: -2.8,
        totalPayments: 67800,
        paymentsChange: 6.3,
        profileViews: 142,
        viewsChange: 18.9,
      },
    },
    {
      id: 9,
      name: "Ronald Richards",
      email: "ronald@example.com",
      location: "Brazil",
      userId: "wdsh1253w",
      dateJoined: "2014-06-19",
      analytics: {
        totalClients: 48,
        clientsChange: 9.2,
        completedJobs: 167,
        jobsChange: 12.5,
        totalPayments: 123400,
        paymentsChange: -3.7,
        profileViews: 289,
        viewsChange: 8.1,
      },
    },
    {
      id: 10,
      name: "Annette Black",
      email: "annette@example.com",
      location: "Japan",
      userId: "wdsh1254w",
      dateJoined: "2017-07-18",
      analytics: {
        totalClients: 33,
        clientsChange: -7.3,
        completedJobs: 91,
        jobsChange: 19.4,
        totalPayments: 71200,
        paymentsChange: 24.8,
        profileViews: 167,
        viewsChange: -12.6,
      },
    },
    {
      id: 11,
      name: "Dianne Russell",
      email: "dianne@example.com",
      location: "France",
      userId: "wdsh1255w",
      dateJoined: "2016-11-07",
      analytics: {
        totalClients: 56,
        clientsChange: 13.8,
        completedJobs: 203,
        jobsChange: 6.7,
        totalPayments: 156700,
        paymentsChange: 11.9,
        profileViews: 312,
        viewsChange: 15.2,
      },
    },
    {
      id: 12,
      name: "Theresa Webb",
      email: "theresa@example.com",
      location: "Mexico",
      userId: "wdsh1256w",
      dateJoined: "2015-05-27",
      analytics: {
        totalClients: 44,
        clientsChange: 5.1,
        completedJobs: 128,
        jobsChange: -8.9,
        totalPayments: 94500,
        paymentsChange: 17.3,
        profileViews: 198,
        viewsChange: 3.4,
      },
    },
  ]

  const filteredData = mockAnalyticsData.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleExport = () => {
    console.log("Exporting analytics report...")
    alert("Analytics report export initiated. This feature is currently stubbed.")
  }

  const handleViewAnalytics = (user: AnalyticsUser) => {
    setSelectedUser(user)
    setIsAnalyticsModalOpen(true)
  }

  const handleOverflowAction = (action: string, userId: number) => {
    console.log(`Action ${action} for user ID: ${userId}`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    const isPositive = value >= 0
    return (
      <span className={isPositive ? "text-green-600" : "text-red-600"}>
        {isPositive ? "↗" : "↘"} {Math.abs(value)}% {isPositive ? "Up from yesterday" : "Down from last week"}
      </span>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 mb-3">
      {/* Filters */}
      <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center justify-between gap-4 bg-white p-3 rounded border-b">
        {/* Left side controls */}
        <div className="flex flex-col sm:flex-row w-full md:w-auto flex-wrap items-start sm:items-center gap-3 md:gap-4">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value)}>
              <SelectTrigger className="w-full sm:w-[140px] h-10 border-[#B4B9C9]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Freelancer">Freelancer</SelectItem>
                <SelectItem value="Customer">Customer</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-[#149A9B] hover:bg-[#108080] text-white h-10 px-4 w-full sm:w-auto">
              View {roleFilter.toLowerCase()}
            </Button>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-[240px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B4B9C9]" size={16} />
            <Input
              placeholder="Search by customer name"
              className="pl-9 h-10 border-[#B4B9C9] focus-visible:ring-offset-0 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-start sm:justify-end mt-3 md:mt-0">
          {/* Date filter */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-3 border-[#B4B9C9] text-[#6D758F] hover:bg-gray-50 gap-2 w-full sm:w-auto"
                >
                  <CalendarIcon className="h-4 w-4 text-[#6D758F]" />
                  {date ? format(date, "MM/dd/yy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              className="h-10 px-4 border-[#B4B9C9] text-[#6D758F] hover:bg-gray-50 w-full sm:w-auto"
            >
              Filter
            </Button>
          </div>

          {/* Export button */}
          <Button
            className="h-10 px-4 bg-[#002333] hover:bg-[#001a26] text-white rounded-full w-full sm:w-auto"
            onClick={handleExport}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Table view (hidden on mobile) */}
      <div className="hidden md:block rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#F9FAFB]">
              <tr className="border-b border-[#f9fbfa] bg-[#F9FAFB] mb-2 p-3">
                <th className="text-left py-3 px-4 font-medium text-black text-sm">Customer Name</th>
                <th className="text-left py-3 px-4 font-medium text-black text-sm">Email</th>
                <th className="text-left py-3 px-4 font-medium text-black text-sm">Location</th>
                <th className="text-left py-3 px-4 font-medium text-black text-sm">User ID</th>
                <th className="text-left py-3 px-4 font-medium text-black text-sm">Date Joined</th>
                <th className="text-left py-3 px-4 font-medium text-black text-sm">Action</th>
              </tr>
            </thead>
            <tbody className="bg-[#fffefe]">
              {filteredData.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{user.name}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className="text-blue-600">Validated</span>
                  </td>
                  <td className="py-3 px-4 text-sm">{user.location}</td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">{user.userId}</span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Copy size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm whitespace-nowrap">
                    {new Date(user.dateJoined).toLocaleDateString("en-US", {
                      month: "numeric",
                      day: "numeric",
                      year: "2-digit",
                    })}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center gap-4">
                      <button className="text-blue-600 hover:underline" onClick={() => handleViewAnalytics(user)}>
                        View Analytics
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="focus:outline-none">
                            <MoreHorizontal size={18} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleOverflowAction("view", user.id)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOverflowAction("export", user.id)}>
                            Export Data
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOverflowAction("contact", user.id)}>
                            Contact User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card view (visible only on mobile) */}
      <div className="md:hidden space-y-4">
        {filteredData.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium">{user.name}</h3>
              <span className="text-blue-600 text-sm">Validated</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span>{user.email}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Location:</span>
                <span>{user.location}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">User ID:</span>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">{user.userId}</span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Date Joined:</span>
                <span>
                  {new Date(user.dateJoined).toLocaleDateString("en-US", {
                    month: "numeric",
                    day: "numeric",
                    year: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
              <button className="text-blue-600 hover:underline text-sm" onClick={() => handleViewAnalytics(user)}>
                View Analytics
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none">
                    <MoreHorizontal size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleOverflowAction("view", user.id)}>
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleOverflowAction("export", user.id)}>
                    Export Data
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleOverflowAction("contact", user.id)}>
                    Contact User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Modal */}
      <Dialog open={isAnalyticsModalOpen} onOpenChange={setIsAnalyticsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>View Analytics</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Client</p>
                      <p className="text-2xl font-bold">{selectedUser.analytics.totalClients}</p>
                      <p className="text-xs mt-1">{formatPercentage(selectedUser.analytics.clientsChange)}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-lg">👥</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Completed jobs</p>
                      <p className="text-2xl font-bold">{selectedUser.analytics.completedJobs}</p>
                      <p className="text-xs mt-1">{formatPercentage(selectedUser.analytics.jobsChange)}</p>
                    </div>
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-600 text-lg">🏆</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Payments</p>
                      <p className="text-2xl font-bold">{formatCurrency(selectedUser.analytics.totalPayments)}</p>
                      <p className="text-xs mt-1">{formatPercentage(selectedUser.analytics.paymentsChange)}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-lg">💰</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Profile view</p>
                      <p className="text-2xl font-bold">{selectedUser.analytics.profileViews}</p>
                      <p className="text-xs mt-1">{formatPercentage(selectedUser.analytics.viewsChange)}</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-lg">👁️</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsAnalyticsModalOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#149A9B] hover:bg-[#108080] text-white">View profile</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
