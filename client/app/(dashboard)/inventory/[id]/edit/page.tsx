"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { inventoryApi } from "@/lib/api"
import Toast from "@/app/components/Toast"
import Navbar from "@/app/components/Navbar"

interface Inventory {
  id: number
  productId: number
  quantity: number
  status: "in_stock" | "out_of_stock"
  product: {
    id: number
    name: string
  }
  createdBy: string
  updatedBy?: string | null
  createdAt: string
  updatedAt: string
}

export default function EditInventoryPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const [quantity, setQuantity] = useState<number>(0)

  const { data: inventory, isLoading, isError, error } = useQuery<Inventory>({
    queryKey: ["inventory", id],
    queryFn: () => inventoryApi.getById(Number(id)),
    enabled: !!id,
  })

  useEffect(() => {
    if (inventory) {
      setQuantity(inventory.quantity)
    }
  }, [inventory])

  const updateMutation = useMutation({
    mutationFn: (payload: { quantity: number }) => inventoryApi.update(Number(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] })
      router.push("/inventory")
    },
    onError: (err: any) => {
      setToastMessage(err.message || "Failed to update inventory")
      setShowToast(true)
    },
  })

  if (!id) {
    return (
      <>
        <Navbar filters={[]} />
        <div className="p-6">
          <p className="text-red-600">Invalid inventory ID</p>
        </div>
      </>
    )
  }

  if (isLoading) {
    return (
      <>
        <Navbar filters={[]} />
        <div className="p-6">
          <p className="text-gray-600">Loading inventory…</p>
        </div>
      </>
    )
  }

  if (isError) {
    return (
      <>
        <Navbar filters={[]} />
        <div className="p-6">
          <p className="text-red-600">{(error as Error).message}</p>
        </div>
      </>
    )
  }

  if (!inventory) {
    return (
      <>
        <Navbar filters={[]} />
        <div className="p-6">
          <p className="text-red-600">Inventory not found</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar filters={[]} />
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Inventory</h1>
            <p className="text-gray-600 mb-6">Update stock quantity</p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                updateMutation.mutate({ quantity })
              }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                <input
                  value={inventory.product.name}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-purple-50 text-gray-700"
                />
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
                  value={quantity > 0 ? "IN STOCK" : "OUT OF STOCK"}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-purple-50 text-gray-700 font-medium"
                />
              </div>

              <div className="bg-purple-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created By:</span>
                  <span className="text-gray-900 font-medium">{inventory.createdBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Updated By:</span>
                  <span className="text-gray-900 font-medium">{inventory.updatedBy || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created At:</span>
                  <span className="text-gray-900">{new Date(inventory.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Updated At:</span>
                  <span className="text-gray-900">{new Date(inventory.updatedAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
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
