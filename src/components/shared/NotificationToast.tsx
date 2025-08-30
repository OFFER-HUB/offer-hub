"use client"
import { useNotification } from "@/lib/contexts/NotificatonContext"
import { Button } from "@/components/ui/button"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"

export default function NotificationToast() {
  const { state, actions } = useNotification()

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const getBorderColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-l-green-500"
      case "error":
        return "border-l-red-500"
      case "warning":
        return "border-l-yellow-500"
      case "info":
        return "border-l-blue-500"
      default:
        return "border-l-gray-500"
    }
  }

  if (state.toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {state.toasts.map((toast) => (
        <div
          key={toast.id}
          className={`bg-white border-l-4 ${getBorderColor(toast.type)} rounded-lg shadow-lg p-4 max-w-sm animate-in slide-in-from-right duration-300`}
        >
          <div className="flex items-start space-x-3">
            {getIcon(toast.type)}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900">{toast.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{toast.message}</p>
              {toast.actionUrl && toast.actionLabel && (
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto mt-2 text-blue-600"
                  onClick={() => (window.location.href = toast.actionUrl!)}
                >
                  {toast.actionLabel}
                </Button>
              )}
            </div>
            <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={() => actions.removeToast(toast.id)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
