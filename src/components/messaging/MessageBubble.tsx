import { cn } from "@/lib/utils"

interface MessageBubbleProps {
  message: string
  timestamp: string
  isOutgoing?: boolean
  className?: string
}

export function MessageBubble({ message, timestamp, isOutgoing = false, className }: MessageBubbleProps) {
  return (
    <div className={cn("flex flex-col mb-4", isOutgoing ? "items-end" : "items-start", className)}>
      <div
        className={cn(
          "max-w-xs px-4 py-3 rounded-2xl",
          isOutgoing ? "bg-blue-500 text-white rounded-br-md" : "bg-gray-200 text-gray-900 rounded-bl-md",
        )}
      >
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
      <span className="text-xs text-gray-500 mt-1 px-2">{timestamp}</span>
    </div>
  )
}
