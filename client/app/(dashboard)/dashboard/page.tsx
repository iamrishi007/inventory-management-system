"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/app/context/AuthContext"
import { usersApi, productsApi, inventoryApi } from "@/lib/api"
import Navbar from "@/app/components/Navbar"
import Link from "next/link"

export default function DashboardPage() {
const { user } = useAuth()

// Total users
const { data: usersData } = useQuery({
queryKey: ["users-stats"],
queryFn: () => usersApi.getAll({ limit: 1 }),
enabled: !!user,
})

// Active users
const { data: usersActiveData } = useQuery({
queryKey: ["users-active"],
queryFn: () => usersApi.getAll({ isActive: true, limit: 1 }),
enabled: !!user,
})

// Inactive users
const { data: usersInactiveData } = useQuery({
queryKey: ["users-inactive"],
queryFn: () => usersApi.getAll({ isActive: false, limit: 1 }),
enabled: !!user,
})

// Total products
const { data: productsData } = useQuery({
queryKey: ["products-count"],
queryFn: () => productsApi.getAll({ limit: 1 }),
enabled: !!user,
})

// Inventory statistics
const { data: inventoryStats } = useQuery({
queryKey: ["inventory-stats"],
queryFn: () => inventoryApi.getStats(),
enabled: !!user,
})

// Wait until authentication data is available
if (!user) {
return ( <div className="flex min-h-screen items-center justify-center bg-gray-50"> <p className="text-gray-600">Loading...</p> </div>
)
}

const totalUsers = usersData?.meta?.total ?? 0
const activeUsers = usersActiveData?.meta?.total ?? 0
const inactiveUsers = usersInactiveData?.meta?.total ?? 0
const totalProducts = productsData?.meta?.total ?? 0

const inStockItems = inventoryStats?.inStockItems ?? 0
const outOfStockItems = inventoryStats?.outOfStockItems ?? 0

return (
<> <Navbar filters={[]} />

```
  <main className="min-h-screen bg-gray-50 p-6">
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">
          Dashboard Overview
        </h1>

        <p className="text-gray-600">
          Welcome back,{" "}
          <span className="font-semibold text-purple-600">
            {user.email}
          </span>
        </p>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Users */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:border-purple-300">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Users
            </h2>

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <span className="text-2xl">👥</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-600">Total Users</span>

              <span className="text-2xl font-bold text-gray-900">
                {totalUsers}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium text-green-600">
                Active
              </span>

              <span className="text-xl font-bold text-green-600">
                {activeUsers}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium text-red-600">
                Inactive
              </span>

              <span className="text-xl font-bold text-red-600">
                {inactiveUsers}
              </span>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:border-purple-300">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Products
            </h2>

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <span className="text-2xl">📦</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">
                Total Products
              </span>

              <span className="text-2xl font-bold text-gray-900">
                {totalProducts}
              </span>
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:border-purple-300">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Inventory
            </h2>

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <span className="text-2xl">📊</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <span className="font-medium text-green-600">
                In Stock
              </span>

              <span className="text-xl font-bold text-green-600">
                {inStockItems}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium text-red-600">
                Out of Stock
              </span>

              <span className="text-xl font-bold text-red-600">
                {outOfStockItems}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Link
          href="/products"
          className="group rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:border-purple-300 hover:shadow-xl"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-linear-to-br from-purple-400 to-purple-600 text-2xl text-white transition-transform group-hover:scale-110">
              📦
            </div>

            <div>
              <h3 className="mb-1 text-lg font-semibold text-gray-900">
                Products
              </h3>

              <p className="text-sm text-gray-600">
                Manage product catalog
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/inventory"
          className="group rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:border-purple-300 hover:shadow-xl"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-linear-to-br from-purple-400 to-purple-600 text-2xl text-white transition-transform group-hover:scale-110">
              📊
            </div>

            <div>
              <h3 className="mb-1 text-lg font-semibold text-gray-900">
                Inventory
              </h3>

              <p className="text-sm text-gray-600">
                Track stock levels
              </p>
            </div>
          </div>
        </Link>

        {/* Current User Role */}
        <div className="rounded-xl border border-purple-200 bg-linear-to-br from-purple-50 to-purple-100 p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white text-2xl text-purple-600 shadow-md">
              👤
            </div>

            <div>
              <h3 className="mb-1 text-lg font-semibold text-gray-900">
                Your Role
              </h3>

              <p className="text-sm font-medium capitalize text-purple-700">
                {user.role.replace("_", " ")}
              </p>

              <p className="mt-1 text-xs text-gray-600">
                {user.isActive
                  ? "✓ Active Account"
                  : "⚠ Inactive Account"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</>

)
}
