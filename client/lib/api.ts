import type {
  AuthResponse,
  InventoryItem,
  InventoryStats,
  ListFilters,
  PaginatedResponse,
  Product,
  ProductStats,
  User,
} from "@/types";

// IMPORTANT:
// This URL already contains /api.
// Do NOT add /api again in endpoint paths.
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ??
  "https://inventory-management-backend-tmmu.onrender.com/api"
).replace(/\/$/, "");

function getToken(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("token");
}

async function getErrorMessage(response: Response): Promise<string> {
  const error = await response.json().catch(() => null);

  if (Array.isArray(error?.message)) {
    return error.message.join(", ");
  }

  return error?.message || `Request failed with status ${response.status}`;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  const json = await response.json();

  // Backend response format:
  // {
  //   success: true,
  //   message: "...",
  //   data: {...},
  //   statusCode: 200
  // }
  return json.data !== undefined ? json.data : json;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  // Add Content-Type only when sending a body.
  // This also keeps the function flexible for GET/DELETE requests.
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return handleResponse<T>(response);
}

export async function apiRequestPaginated<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<PaginatedResponse<T>> {
  const token = getToken();

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const json = await response.json();

  // Supports:
  // { success, data: { data: [], meta: {} } }
  if (json.data?.data && json.data?.meta) {
    return json.data as PaginatedResponse<T>;
  }

  // Supports:
  // { success, data: [], meta: {} }
  if (Array.isArray(json.data)) {
    return {
      data: json.data,
      meta: json.meta ?? {
        total: json.data.length,
        page: 1,
        limit: json.data.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  // Supports:
  // { data: [], meta: {} }
  if (json.data && json.meta) {
    return json as PaginatedResponse<T>;
  }

  return json.data ?? json;
}

function buildQuery(params?: ListFilters): string {
  if (!params) return "";

  const filtered = Object.entries(params).reduce(
    (acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        acc[key] = String(value);
      }

      return acc;
    },
    {} as Record<string, string>,
  );

  const query = new URLSearchParams(filtered).toString();

  return query ? `?${query}` : "";
}

/* =========================
   AUTH API
========================= */

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    }),

  register: (email: string, password: string) =>
    apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    }),

  getProfile: () => apiRequest<User>("/auth/profile"),
};

/* =========================
   USERS API
========================= */

export const usersApi = {
  getAll: (params?: ListFilters) =>
    apiRequestPaginated<User>(`/users${buildQuery(params)}`),

  getById: (id: number) => apiRequest<User>(`/users/${id}`),

  create: (
    userData: Partial<User> & {
      password?: string;
    },
  ) =>
    apiRequest<User>("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  update: (id: number, userData: Partial<User>) =>
    apiRequest<User>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(userData),
    }),

  delete: (id: number) =>
    apiRequest<void>(`/users/${id}`, {
      method: "DELETE",
    }),

  activate: (id: number) =>
    apiRequest<User>(`/users/${id}/activate`, {
      method: "PATCH",
    }),

  deactivate: (id: number) =>
    apiRequest<User>(`/users/${id}/deactivate`, {
      method: "PATCH",
    }),
};

/* =========================
   PRODUCTS API
========================= */

export const productsApi = {
  getAll: (params?: ListFilters) =>
    apiRequestPaginated<Product>(`/products${buildQuery(params)}`),

  getById: (id: number) => apiRequest<Product>(`/products/${id}`),

  create: (productData: {
    name: string;
    price: number;
    description?: string;
  }) =>
    apiRequest<Product>("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    }),

  update: (
    id: number,
    productData: Partial<{
      name: string;
      price: number;
      description: string;
    }>,
  ) =>
    apiRequest<Product>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(productData),
    }),

  delete: (id: number) =>
    apiRequest<void>(`/products/${id}`, {
      method: "DELETE",
    }),

  getStats: () => apiRequest<ProductStats>("/products/stats"),
};

/* =========================
   INVENTORY API
========================= */

export const inventoryApi = {
  getAll: (params?: ListFilters) =>
    apiRequestPaginated<InventoryItem>(`/inventory${buildQuery(params)}`),

  getById: (id: number) => apiRequest<InventoryItem>(`/inventory/${id}`),

  create: (inventoryData: { productId: number; quantity: number }) =>
    apiRequest<InventoryItem>("/inventory", {
      method: "POST",
      body: JSON.stringify(inventoryData),
    }),

  update: (
    id: number,
    inventoryData: Partial<{
      quantity: number;
    }>,
  ) =>
    apiRequest<InventoryItem>(`/inventory/${id}`, {
      method: "PATCH",
      body: JSON.stringify(inventoryData),
    }),

  delete: (id: number) =>
    apiRequest<void>(`/inventory/${id}`, {
      method: "DELETE",
    }),

  getStats: () => apiRequest<InventoryStats>("/inventory/stats"),

  getLowStock: (threshold?: number) =>
    apiRequest<InventoryItem[]>(
      `/inventory/low-stock${
        threshold !== undefined ? `?threshold=${threshold}` : ""
      }`,
    ),
};
