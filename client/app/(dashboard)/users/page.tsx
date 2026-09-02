"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { usersApi } from "@/lib/api";
import Navbar from "@/app/components/Navbar";
import RoleGuard from "@/app/components/RoleGuard";
import Toast from "@/app/components/Toast";

interface User {
  id: number;
  email: string;
  role: string;
  isActive: boolean;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface Filters {
  [key: string]: string | number | boolean | undefined;

  search: string;
  role: string;
  isActive: string;
  sortBy: string;
  sortOrder: "ASC" | "DESC";
  page: number;
  limit: number;
}

export default function UsersPage() {
  const { user: currentUser, hasPermission } = useAuth();
  const queryClient = useQueryClient();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [filters, setFilters] = useState<Filters>({
    search: "",
    role: "",
    isActive: "",
    sortBy: "createdAt",
    sortOrder: "DESC",
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", filters],
    queryFn: () => usersApi.getAll(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },

    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to delete user";

      setToastMessage(message);
      setShowToast(true);
    },
  });

  const allUsers: User[] = data?.data ?? [];
  const users = allUsers.filter((user) => user.id !== currentUser?.id);
  const meta = data?.meta;

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "admin":
        return "bg-red-100 text-red-800 border border-red-200";
      case "manager":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "staff":
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const canCreate = hasPermission("create", "users");
  const canUpdate = hasPermission("update", "users");
  const canDelete = hasPermission("delete", "users");

  return (
    <>
      <Navbar filters={[]} />

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                User Management
              </h1>

              <p className="text-gray-600">
                Manage system users and permissions
              </p>
            </div>

            <RoleGuard allowedRoles={["super_admin", "admin", "manager"]}>
              {canCreate && (
                <Link
                  href="/users/add"
                  className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-purple-700 hover:shadow-xl"
                >
                  + Add User
                </Link>
              )}
            </RoleGuard>
          </div>

          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-md">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <input
                type="text"
                placeholder="Search by email..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    search: e.target.value,
                    page: 1,
                  })
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-400"
              />

              <select
                value={filters.role}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    role: e.target.value,
                    page: 1,
                  })
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
                <option value="user">User</option>
              </select>

              <select
                value={filters.isActive}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    isActive: e.target.value,
                    page: 1,
                  })
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {isLoading && (
            <div className="rounded-lg border border-gray-200 bg-white py-12 text-center shadow-md">
              <p className="text-gray-600">Loading users...</p>
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-red-600">
                {error instanceof Error
                  ? error.message
                  : "Failed to load users"}
              </p>
            </div>
          )}

          {!isLoading && !isError && users.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-purple-100 bg-purple-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-700">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-700">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-700">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="transition-colors hover:bg-purple-50/50"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center">
                            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 font-semibold text-white shadow-md">
                              {user.email.charAt(0).toUpperCase()}
                            </div>

                            <div className="text-sm font-medium text-gray-900">
                              User #{user.id}
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {user.email}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getRoleColor(
                              user.role,
                            )}`}
                          >
                            {user.role.replace("_", " ")}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              user.isActive
                                ? "border border-green-200 bg-green-100 text-green-800"
                                : "border border-red-200 bg-red-100 text-red-800"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {canUpdate && (
                              <Link
                                href={`/users/${user.id}/edit`}
                                className="rounded-lg bg-purple-50 px-3 py-1 text-purple-600 transition-colors hover:bg-purple-100 hover:text-purple-800"
                              >
                                Edit
                              </Link>
                            )}

                            {canDelete && (
                              <button
                                type="button"
                                disabled={deleteMutation.isPending}
                                onClick={() => {
                                  const confirmed = window.confirm(
                                    "Are you sure you want to delete this user?",
                                  );

                                  if (confirmed) {
                                    deleteMutation.mutate(user.id);
                                  }
                                }}
                                className="rounded-lg bg-red-50 px-3 py-1 text-red-600 transition-colors hover:bg-red-100 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deleteMutation.isPending
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {meta && (
                <div className="flex items-center justify-between border-t border-purple-100 bg-purple-50 px-6 py-4">
                  <div className="text-sm text-gray-700">
                    Page {meta.page} of {meta.totalPages} — {meta.total} results
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!meta.hasPreviousPage}
                      onClick={() =>
                        setFilters({
                          ...filters,
                          page: filters.page - 1,
                        })
                      }
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      disabled={!meta.hasNextPage}
                      onClick={() =>
                        setFilters({
                          ...filters,
                          page: filters.page + 1,
                        })
                      }
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isLoading && !isError && users.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-md">
              <p className="text-gray-600">No users found</p>
            </div>
          )}
        </div>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type="error"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
