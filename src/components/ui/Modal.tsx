"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "./dialog";

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to call when modal should be closed */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal description */
  description?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Additional CSS classes for the modal content */
  className?: string;
  /** Size variant of the modal */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Whether clicking outside should close the modal */
  closeOnOverlayClick?: boolean;
  /** Whether pressing Escape should close the modal */
  closeOnEscape?: boolean;
  /** Custom footer content */
  footer?: React.ReactNode;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-4xl",
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
}) => {
  // Handle dialog state changes (close for any allowed reason)
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn("relative w-full", sizeClasses[size], className)}
        showCloseButton={showCloseButton}
        // Prevent closing via Escape when disabled
        onEscapeKeyDown={(e) => {
          if (!closeOnEscape) {
            e.preventDefault();
          }
        }}
        // Control closing via overlay click
        onPointerDownOutside={(e) => {
          if (!closeOnOverlayClick) {
            e.preventDefault();
          }
        }}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div className="flex-1">
              {title && (
                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </DialogTitle>
              )}
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">{children}</div>

        {footer && <div className="border-t pt-4 mt-4">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
