"use client"

import { useState } from "react"
import { useAuth } from "@/app/context/AuthContext"
import { useRouter } from "next/navigation"

export interface FilterConfig {
  type: "input" | "select" | "date"
  name: string
  placeholder?: string
  options?: string[]
}

export default function Navbar({ filters, onFilterChange }: { filters: FilterConfig[], onFilterChange?: (name: string, value: string) => void }) {
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [showProfile, setShowProfile] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleChange = (name: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [name]: value }))
    if (onFilterChange) {
      onFilterChange(name, value)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {filters.map((f) => {
          if (f.type === "input") {
            return (
              <input
                key={f.name}
                name={f.name}
                placeholder={f.placeholder}
                value={filterValues[f.name] || ""}
                onChange={(e) => handleChange(f.name, e.target.value)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
              />
            )
          }

          if (f.type === "select") {
            return (
              <select
                key={f.name}
                name={f.name}
                value={filterValues[f.name] || ""}
                onChange={(e) => handleChange(f.name, e.target.value)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
              >
                <option value="">{f.placeholder}</option>
                {f.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )
          }

          if (f.type === "date") {
            return (
              <input
                key={f.name}
                name={f.name}
                type="date"
                value={filterValues[f.name] || ""}
                onChange={(e) => handleChange(f.name, e.target.value)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
              />
            )
          }
        })}
      </div>

      {/* Profile Section - Top Right */}
      {user && (
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <div className="w-10 h-10 bg-linear-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-semibold text-gray-900">{user.email}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role.replace("_", " ")}</p>
            </div>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showProfile && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfile(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-linear-to-r from-purple-50 to-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-linear-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                      <p className="text-xs text-gray-600 capitalize">{user.role.replace("_", " ")}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${user.isActive ? "text-green-600" : "text-red-600"}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">ID:</span>
                    <span className="text-gray-900 font-medium">#{user.id}</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  )
}
