import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotificationToastProps {
  type: "success" | "error"
  message: string
}

export function NotificationToast({ type, message }: NotificationToastProps) {
  return (
    <div
      className={cn(
        "fixed top-20 right-4 px-4 py-3 rounded-full border animate-in slide-in-from-top-2 fade-in duration-300 z-50 flex items-center gap-3",
        type === "success"
          ? "bg-green-500/20 border-green-500/30 text-green-700 dark:text-green-400"
          : "bg-red-500/20 border-red-500/30 text-red-700 dark:text-red-400",
      )}
    >
      {type === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
      {message}
    </div>
  )
}
