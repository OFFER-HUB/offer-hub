"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ClockIcon,
  CreditCard,
  DollarSign,
  FileText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import PaymentChart from "@/components/payments/payment-chart";
import RecentTransactionsTable from "@/components/payments/recent-transactions-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PaymentOverview() {
  const [timeframe, setTimeframe] = useState("month");

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#002333]">
          Financial Overview
        </h2>
        <div className="flex items-center gap-2">
          <Select defaultValue={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last 3 months</SelectItem>
              <SelectItem value="year">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="h-10 w-10">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#002333]/70">
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-[#002333]">
                    $8,450.50
                  </div>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>+12.5% from last {timeframe}</span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#002333]/70">
                Pending Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-[#002333]">
                    $1,245.00
                  </div>
                  <p className="text-xs text-amber-600 flex items-center mt-1">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    <span>3 payments awaiting</span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <ClockIcon className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#002333]/70">
                Paid Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-[#002333]">24</div>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>+4 from last {timeframe}</span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#002333]/70">
                Platform Fees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-[#002333]">
                    $422.50
                  </div>
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    <span>-2.3% from last {timeframe}</span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <ArrowDownRight className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Alert className="bg-[#DEEFE7]/30 border-[#15949C]">
          <AlertCircle className="h-4 w-4 text-[#15949C]" />
          <AlertTitle className="text-[#002333] font-medium">
            Payment Reminder
          </AlertTitle>
          <AlertDescription className="text-[#002333]/70">
            You have 3 pending payments totaling $1,245.00. The next payment is
            due in 5 days.
          </AlertDescription>
        </Alert>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment Trends</CardTitle>
              <CardDescription>
                Your earnings and expenses over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentChart timeframe={timeframe} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Your active payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#DEEFE7]/30 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-[#15949C]/10 rounded flex items-center justify-center mr-3">
                    <CreditCard className="h-5 w-5 text-[#15949C]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#002333]">
                      Visa ending in 4242
                    </p>
                    <p className="text-xs text-[#002333]/70">Expires 12/25</p>
                  </div>
                </div>
                <Badge className="bg-[#15949C]/10 text-[#15949C] hover:bg-[#15949C]/20">
                  Default
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-blue-100 rounded flex items-center justify-center mr-3">
                    <svg
                      className="h-5 w-5 text-blue-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 12H18M12 6V18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-[#002333]">
                      Add Payment Method
                    </p>
                    <p className="text-xs text-[#002333]/70">
                      Connect a new card or account
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-[#15949C]">
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest financial activities
              </CardDescription>
            </div>
            <Button
              variant="outline"
              className="border-[#15949C] text-[#15949C] hover:bg-[#DEEFE7]"
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <RecentTransactionsTable />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
