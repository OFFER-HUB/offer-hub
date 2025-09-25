'use client'

import { ReactNode } from 'react'

interface PublicRouteProps {
  children: ReactNode
}


export const PublicRoute = ({ children }: PublicRouteProps) => {
  return <>{children}</>
}
