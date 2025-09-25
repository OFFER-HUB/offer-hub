'use client'

import { ReactNode } from 'react'
import { AuthGuard } from './auth-guard'

interface ProtectedRouteProps {
  children: ReactNode
  roles?: string[]
}


export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  return <AuthGuard roles={roles}>{children}</AuthGuard>
}
