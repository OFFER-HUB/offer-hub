'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'sonner'

interface WalletContextType {
  walletAddress: string | null
  setWalletAddress: React.Dispatch<React.SetStateAction<string | null>>
  isConnected: boolean
  isConnecting: boolean
  walletType: string | null
  connect: (walletType?: string) => Promise<void>
  disconnect: () => void
  getPublicKey: () => string | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState<boolean>(false)
  const [walletType, setWalletType] = useState<string | null>(null)

  const isConnected = Boolean(walletAddress)

  // Initialize wallet connection from local storage if available
  useEffect(() => {
    const savedAddress = localStorage.getItem('walletAddress')
    const savedWalletType = localStorage.getItem('walletType')
    
    if (savedAddress && savedWalletType) {
      setWalletAddress(savedAddress)
      setWalletType(savedWalletType)
    }
  }, [])

  const connect = async (preferredWalletType: string = 'freighter') => {
    setIsConnecting(true)
    
    try {
      let address: string | null = null

      if (preferredWalletType === 'freighter') {
        // Freighter wallet connection
        if (typeof window !== 'undefined' && (window as any).freighter) {
          const freighter = (window as any).freighter
          
          // Check if Freighter is available
          const isAllowed = await freighter.isAllowed()
          if (!isAllowed) {
            await freighter.setAllowed()
          }

          // Get the public key
          const publicKey = await freighter.getPublicKey()
          address = publicKey
        } else {
          throw new Error('Freighter wallet not found. Please install Freighter extension.')
        }
      } else {
        throw new Error(`Unsupported wallet type: ${preferredWalletType}`)
      }

      if (!address) {
        throw new Error('Failed to get wallet address')
      }

      setWalletAddress(address)
      setWalletType(preferredWalletType)
      
      // Save to localStorage
      localStorage.setItem('walletAddress', address)
      localStorage.setItem('walletType', preferredWalletType)
      
      toast.success('Wallet connected successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet'
      console.error('Wallet connection error:', error)
      toast.error('Failed to connect wallet', {
        description: errorMessage,
      })
      throw error
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setWalletAddress(null)
    setWalletType(null)
    
    // Clear localStorage
    localStorage.removeItem('walletAddress')
    localStorage.removeItem('walletType')
    
    toast.success('Wallet disconnected')
  }

  const getPublicKey = () => {
    return walletAddress
  }

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        setWalletAddress,
        isConnected,
        isConnecting,
        walletType,
        connect,
        disconnect,
        getPublicKey,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWalletContext() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider')
  }
  return context
}