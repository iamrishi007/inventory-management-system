import { ReactNode } from "react"

interface StatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  trend?: string
  iconBg?: string
  iconColor?: string
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  iconBg = "bg-primary-50",
  iconColor = "text-primary-600",
}: StatCardProps) {
  return (
    <div className="stat-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{value}</p>
          {trend && <p className="text-xs text-slate-400 mt-1">{trend}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center ${iconColor} shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
