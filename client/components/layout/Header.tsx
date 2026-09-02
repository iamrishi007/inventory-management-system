"use client"

import { useState } from "react"
import { useAuth } from "@/app/context/AuthContext"
import { ChevronDownIcon } from "@/components/ui/icons"

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const { user, logout } = useAuth()
  const [showProfile, setShowProfile] = useState(false)

  return (
    <header className="sticky top-0 z-30 glass border-b border-slate-200/80 px-4 sm:px-6 py-3.5">
      <div className="flex items-center justify-between">
        <div className="pl-10 lg:pl-0">
          {title && (
            <h2 className="text-lg font-semibold text-slate-900 hidden sm:block">{title}</h2>
          )}
        </div>

        {user && (
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-slate-900 leading-tight">{user.email}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role.replace("_", " ")}</p>
              </div>
              <ChevronDownIcon width={16} height={16} className="text-slate-400 hidden md:block" />
            </button>

            {showProfile && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-elevated border border-slate-200 z-50 overflow-hidden animate-fade-in">
                  <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100/50 border-b border-primary-100">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
                    <p className="text-xs text-slate-600 capitalize mt-0.5">{user.role.replace("_", " ")}</p>
                  </div>
                  <div className="p-3 space-y-2 text-sm">
                    <div className="flex justify-between px-2">
                      <span className="text-slate-500">Status</span>
                      <span className={user.isActive ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex justify-between px-2">
                      <span className="text-slate-500">User ID</span>
                      <span className="text-slate-900 font-medium">#{user.id}</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 p-2">
                    <button
                      onClick={() => { setShowProfile(false); logout() }}
                      className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
