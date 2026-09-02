"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/app/context/AuthContext"
import { LoadingState } from "@/components/common/LoadingState"

const publicRoutes = ["/login", "/register"]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    if (!loading) {
      if (!user && !isPublicRoute) {
        router.replace("/login")
      } else if (user && isPublicRoute) {
        router.replace("/dashboard")
      }
    }
  }, [user, loading, isPublicRoute, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingState message="Initializing..." />
      </div>
    )
  }

  if (!user && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingState message="Redirecting to login..." />
      </div>
    )
  }

  return <>{children}</>
}
