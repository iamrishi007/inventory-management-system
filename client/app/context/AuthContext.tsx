"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"

export type UserRole = "super_admin" | "admin" | "manager" | "staff" | "user"

export interface User {
  id: number
  email: string
  role: UserRole
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  fetchProfile: () => Promise<void>
  hasRole: (roles: UserRole[]) => boolean
  hasPermission: (action: string, resource: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Load token and user from localStorage on mount
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      fetchProfile(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchProfile = async (authToken?: string) => {
    const auth = authToken || token
    if (!auth) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setUser(data.data)
        localStorage.setItem("user", JSON.stringify(data.data))
      } else {
        throw new Error("Failed to fetch profile")
      }
    } catch (error) {
      console.error("Profile fetch error:", error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch( `${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Login failed")
      }

      const data = await res.json()
      const newToken = data.data.accessToken
      const userData = data.data.user

      setToken(newToken)
      setUser(userData)
      localStorage.setItem("token", newToken)
      localStorage.setItem("user", JSON.stringify(userData))

      router.push("/dashboard")
    } catch (error: any) {
      throw error
    }
  }

//   const login = async (email: string, password: string) => {
//   try {
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email,
//           password,
//         }),
//       }
//     );

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(
//         Array.isArray(data.message)
//           ? data.message[0]
//           : data.message || "Login failed"
//       );
//     }

//     // Example: save token if backend returns access_token
//     if (data.access_token) {
//       localStorage.setItem("access_token", data.access_token);
//     }

//     return data;
//   } catch (error) {
//     throw error;
//   }
// };

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false
    return roles.includes(user.role)
  }

  const hasPermission = (actionOrRoles: string | UserRole[], resource?: string): boolean => {
    // If it's an array, check if user has one of the roles
    if (Array.isArray(actionOrRoles)) {
      return hasRole(actionOrRoles)
    }
    
    // Otherwise, check action and resource
    const action = actionOrRoles
    if (!resource) return false
    if (!user) return false

    const role = user.role

    // Super Admin and Admin have full access to everything
    if (role === "super_admin" || role === "admin") {
      return true
    }

    // Manager permissions
    if (role === "manager") {
      // Manager can create users (staff only)
      if (resource === "users" && action === "create") {
        return true
      }
      // Manager can read users
      if (resource === "users" && action === "read") {
        return true
      }
      // Manager has CRU (Create, Read, Update) on products
      if (resource === "products" && ["create", "read", "update"].includes(action)) {
        return true
      }
      // Manager has CRU (Create, Read, Update) on inventory
      if (resource === "inventory" && ["create", "read", "update"].includes(action)) {
        return true
      }
      // Manager cannot delete products or inventory
      if (resource === "products" && action === "delete") {
        return false
      }
      if (resource === "inventory" && action === "delete") {
        return false
      }
      // Manager cannot update or delete users
      if (resource === "users" && ["update", "delete"].includes(action)) {
        return false
      }
    }

    // Staff and User permissions - only CR (Create, Read)
    if (role === "staff" || role === "user") {
      if (["create", "read"].includes(action)) {
        return true
      }
      // No update or delete permissions
      if (["update", "delete"].includes(action)) {
        return false
      }
    }

    return false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        fetchProfile,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
