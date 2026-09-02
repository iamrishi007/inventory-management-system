type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "primary"

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
  neutral: "badge-neutral",
  primary: "bg-primary-50 text-primary-700 border border-primary-100",
}

export function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}

export function getStockBadge(quantity: number, status: "in_stock" | "out_of_stock") {
  if (status === "out_of_stock" || quantity === 0) {
    return { variant: "danger" as const, label: "Out of Stock" }
  }
  if (quantity < 10) {
    return { variant: "warning" as const, label: "Low Stock" }
  }
  return { variant: "success" as const, label: "In Stock" }
}
