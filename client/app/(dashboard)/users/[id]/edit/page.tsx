"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { usersApi } from "@/lib/api"
import Toast from "@/app/components/Toast"
import Navbar from "@/app/components/Navbar"

export default function EditUserPage() {
  const { id } = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const [form, setForm] = useState({
    role: "" as "super_admin" | "admin" | "manager" | "staff" | "user",
    isActive: true,
  })

  const { data } = useQuery({
    queryKey: ["user", id],
    queryFn: () => usersApi.getById(Number(id)),
    enabled: !!id,
  })

  useEffect(() => {
    if (data) {
      setForm({
        role: data.role as any,
        isActive: data.isActive,
      })
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: () => usersApi.update(Number(id), form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      router.push("/users")
    },
    onError: (err: any) => {
      setToastMessage(err.message || "Failed to update user")
      setShowToast(true)
    },
  })

  return (
    <>
      <Navbar filters={[]} />
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit User</h1>
            <p className="text-gray-600 mb-6">Update user information</p>

            {data && (
              <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="text-lg font-semibold text-gray-900">{data.email}</p>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                mutation.mutate()
              }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  required
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                >
                  <option value="">Select role</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                  <option value="user">User</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-400"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                  Active Account
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mutation.isPending ? "Updating..." : "Update User"}
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
