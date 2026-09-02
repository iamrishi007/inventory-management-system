"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/app/context/AuthContext"
import { productsApi } from "@/lib/api"
import Navbar from "@/app/components/Navbar"
import RoleGuard from "@/app/components/RoleGuard"

interface Product {
  id: number
  name: string
  price: string | number
  description?: string
  createdBy: string
  updatedBy?: string | null
  createdAt: string
  updatedAt: string
}

interface Filters {
  [key: string]: string | number | boolean | undefined

  search: string
  minPrice?: number
  maxPrice?: number
  sortBy: string
  sortOrder: "ASC" | "DESC"
  page: number
  limit: number
}

export default function ProductsPage() {
  const router = useRouter()
  const { user, hasPermission } = useAuth()
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState<Filters>({
    search: "",
    sortBy: "createdAt",
    sortOrder: "DESC",
    page: 1,
    limit: 10,
  })

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => productsApi.getAll(filters),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      })
    },
  })

  const products: Product[] = data?.data ?? []
  const meta = data?.meta

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  const canCreate = hasPermission("create", "products")
  const canUpdate = hasPermission("update", "products")
  const canDelete = hasPermission("delete", "products")

  return (
    <>
      <Navbar filters={[]} />

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Products
              </h1>

              <p className="text-gray-600">
                Manage your product catalog
              </p>
            </div>

            <RoleGuard allowedRoles={["super_admin", "admin"]}>
              {canCreate && (
                <Link
                  href="/products/add"
                  className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-purple-700 hover:shadow-xl"
                >
                  + Add Product
                </Link>
              )}
            </RoleGuard>
          </div>

          {/* Filters */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-md">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Search */}
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    search: e.target.value,
                    page: 1,
                  })
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-400"
              />

              {/* Sort By */}
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sortBy: e.target.value,
                    page: 1,
                  })
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
                <option value="price">Price</option>
                <option value="name">Name</option>
              </select>

              {/* Sort Order */}
              <select
                value={filters.sortOrder}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sortOrder: e.target.value as "ASC" | "DESC",
                    page: 1,
                  })
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="DESC">Descending</option>
                <option value="ASC">Ascending</option>
              </select>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="py-12 text-center">
              <p className="text-gray-600">
                Loading products...
              </p>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-red-600">
                {(error as Error)?.message || "Failed to load products"}
              </p>
            </div>
          )}

          {/* Products Table */}
          {!isLoading && products.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-purple-100 bg-purple-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-700">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-700">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-700">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-700">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-700">
                        Created By
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="transition-colors hover:bg-purple-50/50"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {product.id}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {product.name}
                        </td>

                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          ₹{Number(product.price).toLocaleString()}
                        </td>

                        <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-600">
                          {product.description || "-"}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {product.createdBy}
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {canUpdate && (
                              <Link
                                href={`/products/${product.id}/edit`}
                                className="rounded-lg bg-purple-50 px-3 py-1 text-purple-600 transition-colors hover:bg-purple-100 hover:text-purple-800"
                              >
                                Edit
                              </Link>
                            )}

                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    confirm(
                                      "Are you sure you want to delete this product?"
                                    )
                                  ) {
                                    deleteMutation.mutate(product.id)
                                  }
                                }}
                                disabled={deleteMutation.isPending}
                                className="rounded-lg bg-red-50 px-3 py-1 text-red-600 transition-colors hover:bg-red-100 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deleteMutation.isPending
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta && (
                <div className="flex items-center justify-between border-t border-purple-100 bg-purple-50 px-6 py-4">
                  <div className="text-sm text-gray-700">
                    Page {meta.page} of {meta.totalPages} — {meta.total} results
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!meta.hasPreviousPage}
                      onClick={() =>
                        setFilters({
                          ...filters,
                          page: filters.page - 1,
                        })
                      }
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      disabled={!meta.hasNextPage}
                      onClick={() =>
                        setFilters({
                          ...filters,
                          page: filters.page + 1,
                        })
                      }
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && products.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-md">
              <p className="text-gray-600">
                No products found
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

