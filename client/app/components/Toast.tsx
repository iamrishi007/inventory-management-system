"use client"

import { useEffect } from "react"

interface ToastProps {
  message: string
  type?: "error" | "success" | "warning"
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type = "error", onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor = {
    error: "bg-red-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
  }[type]

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-bounce-in">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md`}>
        <div className="flex-1">
          <p className="font-semibold">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors text-xl font-bold"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
