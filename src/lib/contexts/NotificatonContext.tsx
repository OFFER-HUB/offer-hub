"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

// Types
interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  actionLabel?: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  toasts: Notification[]
}

type NotificationAction =
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "MARK_AS_READ"; payload: string }
  | { type: "MARK_ALL_AS_READ" }
  | { type: "REMOVE_NOTIFICATION"; payload: string }
  | { type: "ADD_TOAST"; payload: Notification }
  | { type: "REMOVE_TOAST"; payload: string }
  | { type: "CLEAR_TOASTS" }

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  toasts: [],
}

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case "ADD_NOTIFICATION":
      const newNotifications = [action.payload, ...state.notifications]
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter((n) => !n.read).length,
      }
    case "MARK_AS_READ":
      const updatedNotifications = state.notifications.map((n) => (n.id === action.payload ? { ...n, read: true } : n))
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter((n) => !n.read).length,
      }
    case "MARK_ALL_AS_READ":
      const allReadNotifications = state.notifications.map((n) => ({ ...n, read: true }))
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0,
      }
    case "REMOVE_NOTIFICATION":
      const filteredNotifications = state.notifications.filter((n) => n.id !== action.payload)
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter((n) => !n.read).length,
      }
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      }
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      }
    case "CLEAR_TOASTS":
      return {
        ...state,
        toasts: [],
      }
    default:
      return state
  }
}

const NotificationContext = createContext<{
  state: NotificationState
  dispatch: React.Dispatch<NotificationAction>
  actions: {
    addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
    showToast: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    removeNotification: (id: string) => void
    removeToast: (id: string) => void
  }
} | null>(null)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState)

  useEffect(() => {
    const timers = state.toasts.map((toast) => {
      return setTimeout(() => {
        dispatch({ type: "REMOVE_TOAST", payload: toast.id })
      }, 5000)
    })

    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [state.toasts])

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      read: false,
    }
    dispatch({ type: "ADD_NOTIFICATION", payload: newNotification })
  }

  const showToast = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newToast: Notification = {
      ...notification,
      id: `toast-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      read: false,
    }
    dispatch({ type: "ADD_TOAST", payload: newToast })
    // Also add to notifications list
    addNotification(notification)
  }

  const markAsRead = (id: string) => {
    dispatch({ type: "MARK_AS_READ", payload: id })
  }

  const markAllAsRead = () => {
    dispatch({ type: "MARK_ALL_AS_READ" })
  }

  const removeNotification = (id: string) => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: id })
  }

  const removeToast = (id: string) => {
    dispatch({ type: "REMOVE_TOAST", payload: id })
  }

  const actions = {
    addNotification,
    showToast,
    markAsRead,
    markAllAsRead,
    removeNotification,
    removeToast,
  }

  return <NotificationContext.Provider value={{ state, dispatch, actions }}>{children}</NotificationContext.Provider>
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}

export type { Notification }
