"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useAuth } from "@/app/context/AuthContext"
import { inventoryApi } from "@/lib/api"
import Navbar from "@/app/components/Navbar"
import RoleGuard from "@/app/components/RoleGuard"

interface Inventory {
  id: number
  productId: number
  product: {
    id: number
    name: string
  }
  quantity: number
  status: "in_stock" | "out_of_stock"
  createdBy: string
  updatedBy?: string | null
  createdAt: string
  updatedAt: string
}

interface Filters {
  [key: string]: string | number | boolean | undefined
  search: string
  status: "" | "in_stock" | "out_of_stock"
  sortBy: string
  sortOrder: "ASC" | "DESC"
  page: number
  limit: number
}

export default function InventoryPage() {
  const { user, hasPermission } = useAuth()

  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "DESC",
    page: 1,
    limit: 10,
  })

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["inventory", filters],
    queryFn: () => inventoryApi.getAll(filters),
  })

  const inventory: Inventory[] = data?.data ?? []
  const meta = data?.meta

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  const canCreate = hasPermission("create", "inventory")
  const canUpdate = hasPermission("update", "inventory")

  return (
    <>
      <Navbar filters={[]} />
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
              <p className="text-gray-600">Track and manage your stock levels</p>
            </div>
            <RoleGuard allowedRoles={["super_admin", "admin"]}>
              {canCreate && (
                <Link
                  href="/inventory/add"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  + Add Inventory
                </Link>
              )}
            </RoleGuard>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              />
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as "" | "in_stock" | "out_of_stock", page: 1 })}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value, page: 1 })}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              >
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
                <option value="quantity">Quantity</option>
                <option value="status">Status</option>
              </select>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as "ASC" | "DESC", page: 1 })}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              >
                <option value="DESC">Descending</option>
                <option value="ASC">Ascending</option>
              </select>
            </div>
          </div>

          {/* Inventory Table - Main Content */}
          {isLoading && (
            <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
              <p className="text-gray-600">Loading inventory...</p>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{(error as Error)?.message || "Failed to load inventory"}</p>
            </div>
          )}

          {!isLoading && inventory.length > 0 && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-50 border-b border-purple-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Quantity</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Created By</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Last Updated</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-purple-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.product?.name || `Product #${item.productId}`}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <span className={`font-bold ${item.quantity === 0 ? "text-red-600" : item.quantity < 10 ? "text-yellow-600" : "text-green-600"}`}>
                            {item.quantity}
                          </span>
                          <span className="text-gray-500 ml-1">units</span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            item.status === "in_stock"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {item.status === "in_stock" ? "In Stock" : "Out of Stock"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.createdBy}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          {canUpdate && (
                            <Link
                              href={`/inventory/${item.id}/edit`}
                              className="px-3 py-1 text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                            >
                              Edit
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {meta && (
                <div className="px-6 py-4 bg-purple-50 border-t border-purple-100 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {meta.page} to {meta.totalPages} of {meta.total} results
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={!meta.hasPreviousPage}
                      onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      disabled={!meta.hasNextPage}
                      onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isLoading && inventory.length === 0 && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
              <p className="text-gray-600">No inventory records found</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
