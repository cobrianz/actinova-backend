"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  Download,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { toast } from "sonner"

const revenueKPIs = [
  {
    title: "Total Revenue This Month",
    value: "$45,230",
    change: "+12.5%",
    icon: DollarSign,
    color: "green",
    trend: "up",
  },
  {
    title: "Monthly Recurring Revenue",
    value: "$38,450",
    change: "+8.2%",
    icon: TrendingUp,
    color: "blue",
    trend: "up",
  },
  {
    title: "Churn Rate",
    value: "2.4%",
    change: "-0.8%",
    icon: TrendingDown,
    color: "red",
    trend: "down",
  },
  {
    title: "Average Revenue Per User",
    value: "$89.50",
    change: "+5.1%",
    icon: Users,
    color: "purple",
    trend: "up",
  },
]

const mrrData = [
  { month: "Jan", mrr: 32000, target: 35000 },
  { month: "Feb", mrr: 34500, target: 36000 },
  { month: "Mar", mrr: 36200, target: 37000 },
  { month: "Apr", mrr: 35800, target: 38000 },
  { month: "May", mrr: 37900, target: 39000 },
  { month: "Jun", mrr: 38450, target: 40000 },
]

const upgradesData = [
  { week: "Week 1", upgrades: 12, downgrades: 3 },
  { week: "Week 2", upgrades: 18, downgrades: 5 },
  { week: "Week 3", upgrades: 15, downgrades: 2 },
  { week: "Week 4", upgrades: 22, downgrades: 4 },
]

const revenueByPlanData = [
  { name: "Free", value: 0, color: "#8884d8", users: 1250 },
  { name: "Basic", value: 35, color: "#82ca9d", users: 450 },
  { name: "Pro", value: 45, color: "#ffc658", users: 280 },
  { name: "Enterprise", value: 20, color: "#ff7300", users: 85 },
]

const mockTransactions = [
  {
    id: 1,
    user: "John Doe",
    userId: 1,
    amount: "$29.99",
    plan: "Pro Monthly",
    date: "2024-01-22",
    status: "completed",
    paymentMethod: "Credit Card",
  },
  {
    id: 2,
    user: "Jane Smith",
    userId: 2,
    amount: "$299.99",
    plan: "Enterprise Annual",
    date: "2024-01-22",
    status: "completed",
    paymentMethod: "PayPal",
  },
  {
    id: 3,
    user: "Mike Johnson",
    userId: 3,
    amount: "$9.99",
    plan: "Basic Monthly",
    date: "2024-01-21",
    status: "failed",
    paymentMethod: "Credit Card",
  },
  {
    id: 4,
    user: "Sarah Wilson",
    userId: 4,
    amount: "$99.99",
    plan: "Pro Annual",
    date: "2024-01-21",
    status: "completed",
    paymentMethod: "Credit Card",
  },
  {
    id: 5,
    user: "Tom Brown",
    userId: 5,
    amount: "$29.99",
    plan: "Pro Monthly",
    date: "2024-01-20",
    status: "pending",
    paymentMethod: "Bank Transfer",
  },
]

export default function RevenueAnalytics() {
  const [transactions, setTransactions] = useState(mockTransactions)
  const [selectedTimeRange, setSelectedTimeRange] = useState("6months")
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  const handleExportCSV = () => {
    const csvData = transactions.map((t) => ({
      User: t.user,
      Amount: t.amount,
      Plan: t.plan,
      Date: t.date,
      Status: t.status,
      PaymentMethod: t.paymentMethod,
    }))

    const csvContent = [Object.keys(csvData[0]).join(","), ...csvData.map((row) => Object.values(row).join(","))].join(
      "\n",
    )

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `revenue-data-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("Revenue data exported successfully!")
  }

  const handleRefund = (transaction) => {
    setSelectedTransaction(transaction)
    setShowRefundModal(true)
  }

  const processRefund = () => {
    if (!selectedTransaction) return

    setTransactions((prev) => prev.map((t) => (t.id === selectedTransaction.id ? { ...t, status: "refunded" } : t)))
    setShowRefundModal(false)
    setSelectedTransaction(null)
    toast.success("Refund processed successfully!")
  }

  const handleRetryPayment = (transactionId) => {
    setTransactions((prev) => prev.map((t) => (t.id === transactionId ? { ...t, status: "completed" } : t)))
    toast.success("Payment retry initiated!")
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100 dark:bg-green-900/20"
      case "failed":
        return "text-red-600 bg-red-100 dark:bg-red-900/20"
      case "pending":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20"
      case "refunded":
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Revenue Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track revenue, subscriptions, and financial performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <button
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {revenueKPIs.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{kpi.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{kpi.value}</p>
                  <p className={`text-sm font-medium mt-2 ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {kpi.change}
                  </p>
                </div>
                <div className={`p-4 rounded-xl bg-gradient-to-r from-${kpi.color}-500 to-${kpi.color}-600`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MRR Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Recurring Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mrrData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
              <Line type="monotone" dataKey="mrr" stroke="#3B82F6" strokeWidth={3} name="Actual MRR" />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Upgrades Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Plan Changes per Week</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={upgradesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="upgrades" fill="#10B981" name="Upgrades" />
              <Bar dataKey="downgrades" fill="#EF4444" name="Downgrades" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Plan */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue by Plan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueByPlanData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {revenueByPlanData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Statistics */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Plan Statistics</h3>
          <div className="space-y-4">
            {revenueByPlanData.map((plan, index) => (
              <div key={plan.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: plan.color }} />
                  <span className="text-gray-700 dark:text-gray-300">{plan.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{plan.users} users</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{plan.value}% revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {transactions.filter((t) => t.status === "failed").length} failed payments
              </span>
              {transactions.filter((t) => t.status === "failed").length > 0 && (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{transaction.user}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white font-medium">{transaction.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{transaction.plan}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      {transaction.paymentMethod}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {transaction.status === "completed" && (
                        <button
                          onClick={() => handleRefund(transaction)}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                        >
                          Refund
                        </button>
                      )}
                      {transaction.status === "failed" && (
                        <button
                          onClick={() => handleRetryPayment(transaction.id)}
                          className="flex items-center text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Retry
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirm Refund</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to refund {selectedTransaction.amount} to {selectedTransaction.user}? This action
              cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={processRefund}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Process Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
