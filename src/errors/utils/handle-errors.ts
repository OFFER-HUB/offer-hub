import type { AxiosError } from 'axios'
import type { WalletError } from '@/types/errors.entity'
import axios from 'axios'

interface MappedError {
  message: string
  code?: string
  originalError?: unknown
}

interface ApiResponseData {
  message?: string
  error?: string
  [key: string]: unknown
}

export function handleError(error: AxiosError | WalletError | Error | unknown): MappedError {
  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError
    const statusCode = axiosError.response?.status
    const responseData = axiosError.response?.data as ApiResponseData
    
    return {
      message: responseData?.message || responseData?.error || axiosError.message || 'Network error occurred',
      code: statusCode?.toString() || axiosError.code,
      originalError: axiosError,
    }
  }
  
  // Handle wallet errors
  if ((error as WalletError)?.type === 'wallet_error') {
    const walletError = error as WalletError
    return {
      message: walletError.message || 'Wallet operation failed',
      code: walletError.code,
      originalError: walletError,
    }
  }
  
  // Handle standard errors
  if (error instanceof Error) {
    return {
      message: error.message || 'An error occurred',
      originalError: error,
    }
  }
  
  // Handle unknown errors
  return {
    message: 'An unknown error occurred',
    originalError: error,
  }
}