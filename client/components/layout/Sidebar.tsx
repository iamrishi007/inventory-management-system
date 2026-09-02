"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboardIcon,
  PackageIcon,
  WarehouseIcon,
  UsersIcon,
  BarChartIcon,
  LogOutIcon,
} from "@/components/ui/icons"
import { useAuth } from "@/app/context/AuthContext"

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/products", label: "Products", icon: PackageIcon },
  { href: "/inventory", label: "Inventory", icon: WarehouseIcon },
  { href: "/users", label: "Users", icon: UsersIcon },
  { href: "/stats", label: "Analytics", icon: BarChartIcon },
]

interface SidebarContentProps {
  onNavigate?: () => void
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(path)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
            <PackageIcon width={20} height={20} className="text-white" stroke="white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Inventory Pro</h2>
            <p className="text-xs text-slate-500">Management System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={active ? "sidebar-link sidebar-link-active" : "sidebar-link"}
            >
              <Icon width={18} height={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {user && (
        <div className="p-4 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-3">
            <p className="text-sm font-medium text-slate-900 truncate">{user.email}</p>
            <p className="text-xs text-slate-500 capitalize mt-0.5">
              {user.role.replace("_", " ")}
            </p>
          </div>
          <button
            onClick={logout}
            className="sidebar-link w-full text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOutIcon width={18} height={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  )
}
