'use client'

import { checkTokenValidity, logAccessAttempt } from '@/utils/route-protection'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export const useAuthGuard = (roles?: string[]) => {
    // mocked wallet connection
    const address = '0x..........'
    const isConnected = !!address

    const router = useRouter()
    const pathname = usePathname()

    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [hasAccess, setHasAccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                // if wallet is not connected
                const hasWallet = isConnected && !!address


                // Token validation
                const token = localStorage.getItem('authToken')
                const valid = await checkTokenValidity(token)


                if (!hasWallet && !valid) {
                    setIsAuthenticated(false)
                    // If neither is valid, user is taken to the onboarding page
                    router.push(`/onboarding?redirect=${pathname}`)
                }
                else {
                    setIsAuthenticated(true)
                }

                // Role-based access control
                // 1. Get the current user's roles from localStorage
                // 2. If the route requires specific roles (e.g., ["admin", "user"]):
                //    - Check if the user's roles array includes at least one of the required roles.
                //    - If yes,  grant access, log "granted".
                //    - If no, deny access, log "denied", and stop further authentication checks.
                // 3. If no roles are specified for the route, allow all authenticated users
                //     and log "granted".

                const userRoles = JSON.parse(localStorage.getItem('roles') || '[]')
                if (roles && roles.length > 0) {
                    const allowed = roles.some(r => userRoles.includes(r))
                    setHasAccess(allowed)
                    logAccessAttempt(pathname, allowed ? 'granted' : 'denied')

                    if (!allowed) {
                        setHasAccess(false)
                        return
                    }
                } else {
                    setHasAccess(true)
                    logAccessAttempt(pathname, 'granted')
                }

                //  User passed all checks
                setIsAuthenticated(true)
            } catch (err) {
                console.error(err)
                setError('Authentication failed. Please reconnect your wallet.')
            } finally {
                setIsLoading(false)
            }
        }

        verifyAuth()
    }, [address, isConnected, pathname, roles, router])

    return { isAuthenticated, isLoading, hasAccess, error }
}
