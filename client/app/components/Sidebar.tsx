"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Sidebar() {
  const pathname = usePathname()

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
      pathname === path
        ? "bg-purple-100 text-purple-700 shadow-md border border-purple-200"
        : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
    }`

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/products", label: "Products", icon: "📦" },
    { href: "/inventory", label: "Inventory", icon: "📊" },
    { href: "/users", label: "Users", icon: "👥" },
    { href: "/stats", label: "Stats", icon: "📈" },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col h-screen">
      <div className="mb-8 p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-1">
          Inventory Pro
        </h2>
        <p className="text-sm text-gray-500">Management System</p>
      </div>

      <nav className="space-y-2 flex-1 px-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={linkClass(item.href)}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* System Status */}
      {/* <div className="p-4 border-t border-gray-200">
        <div className="px-4 py-3 bg-purple-50 rounded-lg border border-purple-100">
          <p className="text-xs text-gray-600 mb-1 font-medium">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-700">All Systems Operational</span>
          </div>
        </div>
      </div> */}
    </aside>
  )
}
