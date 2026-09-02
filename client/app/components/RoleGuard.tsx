"use client"

import { ReactNode, useState } from "react"
import { useAuth } from "@/app/context/AuthContext"
import { UserRole } from "@/app/context/AuthContext"
import Toast from "./Toast"

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: UserRole[]
  fallback?: ReactNode
  showToast?: boolean
}

export default function RoleGuard({ children, allowedRoles, fallback = null, showToast = true }: RoleGuardProps) {
  const { hasRole } = useAuth()
  const [showAccessDenied, setShowAccessDenied] = useState(false)
  
  if (!hasRole(allowedRoles)) {
    if (showToast && !showAccessDenied) {
      setTimeout(() => setShowAccessDenied(true), 100)
    }
    return (
      <>
        {fallback}
        {showAccessDenied && showToast && (
          <Toast
            message="You don't have access to this feature"
            type="error"
            onClose={() => setShowAccessDenied(false)}
          />
        )}
      </>
    )
  }
  
  return <>{children}</>
}
