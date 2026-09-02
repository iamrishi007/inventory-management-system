import { AlertTriangleIcon } from "@/components/ui/icons"
import { Button } from "@/components/ui/Button"

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = "Something went wrong. Please try again.", onRetry }: ErrorStateProps) {
  return (
    <div className="card p-8 text-center border-red-100 bg-red-50/50 animate-fade-in">
      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-red-100 flex items-center justify-center text-red-500">
        <AlertTriangleIcon width={24} height={24} />
      </div>
      <p className="text-red-700 font-medium">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-4" size="sm">
          Try Again
        </Button>
      )}
    </div>
  )
}
