export type UserRole = "super_admin" | "admin" | "manager" | "staff" | "user"

export interface User {
  id: number
  email: string
  role: UserRole
  isActive: boolean
  createdBy?: string
  updatedBy?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface Product {
  id: number
  name: string
  price: string | number
  description?: string
  createdBy: string
  updatedBy?: string | null
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  id: number
  productId: number
  product: {
    id: number
    name: string
    price?: string | number
  }
  quantity: number
  status: "in_stock" | "out_of_stock"
  createdBy: string
  updatedBy?: string | null
  createdAt: string
  updatedAt: string
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface InventoryStats {
  totalItems: number
  inStockItems: number
  outOfStockItems: number
  totalQuantity: number
  averageQuantity: string | number
}

export interface ProductStats {
  totalProducts: number
  averagePrice?: string | number
}

export interface AuthResponse {
  user: User
  accessToken: string
}

export interface ApiError {
  message: string
  statusCode?: number
}

export interface ListFilters {
  search?: string
  sortBy?: string
  sortOrder?: "ASC" | "DESC"
  page?: number
  limit?: number
  [key: string]: string | number | boolean | undefined
}
