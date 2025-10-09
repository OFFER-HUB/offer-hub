import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon to display (Lucide icon component) */
  icon?: LucideIcon
  /** Main heading/title */
  title?: string
  /** Description message */
  message: string
  /** Optional action button text */
  actionLabel?: string
  /** Action button click handler */
  onAction?: () => void
  /** Action button variant */
  actionVariant?: "default" | "outline" | "secondary" | "ghost"
  /** Secondary action button text */
  secondaryActionLabel?: string
  /** Secondary action button click handler */
  onSecondaryAction?: () => void
  /** Size variant */
  size?: "sm" | "md" | "lg"
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      icon: Icon,
      title,
      message,
      actionLabel,
      onAction,
      actionVariant = "default",
      secondaryActionLabel,
      onSecondaryAction,
      size = "md",
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: {
        container: "p-4",
        icon: "w-10 h-10",
        title: "text-base",
        message: "text-xs",
        spacing: "space-y-2"
      },
      md: {
        container: "p-6",
        icon: "w-12 h-12",
        title: "text-lg",
        message: "text-sm",
        spacing: "space-y-3"
      },
      lg: {
        container: "p-8 md:p-12",
        icon: "w-16 h-16",
        title: "text-xl md:text-2xl",
        message: "text-base",
        spacing: "space-y-4"
      }
    }

    const styles = sizeClasses[size]

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border border-neutral-400 bg-white dark:bg-card text-center",
          "transition-all duration-200",
          styles.container,
          className
        )}
        {...props}
      >
        <div className={cn("flex flex-col items-center", styles.spacing)}>
          {Icon && (
            <div className={cn(
              "rounded-full bg-neutral-300 dark:bg-neutral-800 p-3",
              "text-neutral-600 dark:text-neutral-400"
            )}>
              <Icon className={styles.icon} />
            </div>
          )}

          <div className={cn("space-y-1", !Icon && "mt-0")}>
            {title && (
              <h3 className={cn(
                "font-semibold text-neutral-800 dark:text-foreground",
                styles.title
              )}>
                {title}
              </h3>
            )}
            <p className={cn(
              "text-neutral-600 dark:text-muted-foreground max-w-sm mx-auto",
              styles.message
            )}>
              {message}
            </p>
          </div>

          {(actionLabel || secondaryActionLabel) && (
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {actionLabel && onAction && (
                <Button
                  onClick={onAction}
                  variant={actionVariant}
                  size={size === "sm" ? "sm" : "default"}
                >
                  {actionLabel}
                </Button>
              )}
              {secondaryActionLabel && onSecondaryAction && (
                <Button
                  onClick={onSecondaryAction}
                  variant="outline"
                  size={size === "sm" ? "sm" : "default"}
                >
                  {secondaryActionLabel}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
)

EmptyState.displayName = "EmptyState"

export { EmptyState }