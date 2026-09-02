"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/app/context/AuthContext";
import { inventoryApi, productsApi } from "@/lib/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import Navbar from "@/app/components/Navbar";
import RoleGuard from "@/app/components/RoleGuard";

interface InventoryStats {
  totalItems: number;
  inStockItems: number;
  outOfStockItems: number;
  totalQuantity: number;
  averageQuantity: string;
}

const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b"];

export default function StatsPage() {
  const { user, hasPermission } = useAuth();

  const { data: inventoryStats, isLoading: inventoryLoading } = useQuery({
    queryKey: ["inventory-stats"],
    queryFn: () => inventoryApi.getStats(),
    enabled: !!user,
  });

  const { data: productsStats } = useQuery({
    queryKey: ["products-stats"],
    queryFn: () => productsApi.getStats(),
    enabled:
      !!user &&
      (user.role === "super_admin" ||
        user.role === "admin" ||
        user.role === "manager"),
  });

  const { data: lowStock = [] } = useQuery({
    queryKey: ["low-stock"],
    queryFn: () => inventoryApi.getLowStock(),
    enabled:
      !!user &&
      (user.role === "super_admin" ||
        user.role === "admin" ||
        user.role === "manager"),
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const canViewStats =
    user.role === "super_admin" ||
    user.role === "admin" ||
    user.role === "manager";

  if (!canViewStats) {
    return (
      <>
        <Navbar filters={[]} />
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800 font-semibold">Access Denied</p>
              <p className="text-yellow-600 mt-2">
                You don't have permission to view statistics.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const pieData = inventoryStats
    ? [
        {
          name: "In Stock",
          value: inventoryStats.inStockItems || 0,
          color: COLORS[0],
        },
        {
          name: "Out of Stock",
          value: inventoryStats.outOfStockItems || 0,
          color: COLORS[1],
        },
      ].filter((item) => item.value > 0)
    : [];

  return (
    <>
      <Navbar filters={[]} />
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analytics & Statistics
            </h1>
            <p className="text-gray-600">
              Comprehensive insights into your inventory performance
            </p>
          </div>

          {/* Stats Cards */}
          {inventoryStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {inventoryStats.totalItems || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">In Stock</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {inventoryStats.inStockItems || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">✓</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Out of Stock</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {inventoryStats.outOfStockItems || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Low Stock Alert</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">
                      {lowStock.length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📉</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pie Chart */}
          {pieData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Inventory Status Distribution
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Low Stock Table */}
          {lowStock.length > 0 && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-purple-50">
                <h2 className="text-xl font-bold text-gray-900">
                  Low Stock Items
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-50 border-b border-purple-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                        Quantity
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lowStock.map(
                      (item: {
                        id: number;
                        productId: number;
                        product?: { name: string };
                        quantity: number;
                      }) => (
                        <tr
                          key={item.id}
                          className="hover:bg-purple-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.product?.name || `Product #${item.productId}`}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                              Low Stock
                            </span>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {lowStock.length === 0 && inventoryStats && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
              <p className="text-gray-600 text-lg">🎉 No low stock items!</p>
              <p className="text-gray-500 mt-2">
                All inventory levels are healthy.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
