"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/AuthContext"
import { usersApi } from "@/lib/api"
import Toast from "@/app/components/Toast"

export default function AddUserPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "user" as "super_admin" | "admin" | "manager" | "staff" | "user",
    isActive: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowToast(false)

    try {
      await usersApi.create(form)
      router.push("/users")
    } catch (error: any) {
      setToastMessage(error.message || "Failed to create user")
      setShowToast(true)
    }
  }

  // Manager can only create staff
  const allowedRoles = user?.role === "manager" 
    ? ["staff"] 
    : ["super_admin", "admin", "manager", "staff", "user"]

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create User</h1>
          <p className="text-gray-600 mb-6">Add a new user to the system</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="user@example.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                placeholder="Password"
                required
                minLength={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Must contain uppercase, lowercase, number, and special character
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as any })}
              >
                {allowedRoles.map((role) => (
                  <option key={role} value={role}>
                    {role.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
              {user?.role === "manager" && (
                <p className="text-xs text-purple-600 mt-1">
                  Managers can only create staff members
                </p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-400"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Active Account
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                Create User
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

      {showToast && (
        <Toast
          message={toastMessage}
          type="error"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  )
}
