export interface WalletError {
  type: 'wallet_error'
  code?: string
  message: string
  details?: unknown
}