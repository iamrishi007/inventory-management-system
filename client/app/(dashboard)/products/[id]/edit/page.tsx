"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { productsApi } from "@/lib/api"
import Toast from "@/app/components/Toast"
import Navbar from "@/app/components/Navbar"

interface Product {
  id: number
  name: string
  price: number
  description?: string
}

interface UpdateProductPayload {
  name?: string
  price?: number
  description?: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const id = params.id as string
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const [form, setForm] = useState<UpdateProductPayload>({
    name: "",
    price: undefined,
    description: "",
  })

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsApi.getById(Number(id)),
    enabled: !!id,
  })

  useEffect(() => {
  if (data) {
    setForm({
      name: data.name,
      price: Number(data.price),
      description: data.description ?? "",
    })
  }
}, [data])

  const mutation = useMutation({
    mutationFn: (payload: UpdateProductPayload) => productsApi.update(Number(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      router.push("/products")
    },
    onError: (err: any) => {
      setToastMessage(err.message || "Failed to update product")
      setShowToast(true)
    },
  })

  if (!id) {
    return (
      <>
        <Navbar filters={[]} />
        <div className="p-6">
          <p className="text-red-600">Invalid product ID</p>
        </div>
      </>
    )
  }

  if (isLoading) {
    return (
      <>
        <Navbar filters={[]} />
        <div className="p-6">
          <p className="text-gray-600">Loading product…</p>
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

  return (
    <>
      <Navbar filters={[]} />
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Product</h1>
            <p className="text-gray-600 mb-6">Update product information</p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                mutation.mutate(form)
              }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                  value={form.price ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all resize-none"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mutation.isPending ? "Updating..." : "Update Product"}
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
