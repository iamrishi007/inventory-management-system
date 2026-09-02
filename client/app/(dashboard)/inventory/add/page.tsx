"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "@tanstack/react-query"
import { productsApi, inventoryApi } from "@/lib/api"
import Toast from "@/app/components/Toast"
import Navbar from "@/app/components/Navbar"

interface Product {
  id: number
  name: string
}

export default function AddInventoryPage() {
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const [productId, setProductId] = useState<number | "">("")
  const [quantity, setQuantity] = useState<number>(0)

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.getAll({ limit: 100 }),
  })

  const products: Product[] = productsData?.data ?? []

  const createMutation = useMutation({
    mutationFn: () => inventoryApi.create({ productId: Number(productId), quantity }),
    onSuccess: () => {
      router.push("/inventory")
    },
    onError: (err: any) => {
      setToastMessage(err.message || "Failed to create inventory")
      setShowToast(true)
    },
  })

  return (
    <>
      <Navbar filters={[]} />
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Inventory</h1>
            <p className="text-gray-600 mb-6">Add stock for a product</p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (productId) {
                  createMutation.mutate()
                }
              }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                {productsLoading ? (
                  <p className="text-sm text-gray-500">Loading products…</p>
                ) : (
                  <select
                    required
                    value={productId}
                    onChange={(e) => setProductId(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                  >
                    <option value="">Select a product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status (Auto)</label>
                <input
                  disabled
                  value={quantity > 0 ? "IN STOCK" : "OUT OF STOCK"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-purple-50 text-gray-700 font-medium"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending || !productId}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? "Creating..." : "Create Inventory"}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type="error"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  )
}
