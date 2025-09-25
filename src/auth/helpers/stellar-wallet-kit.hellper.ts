import { Transaction, Networks } from 'stellar-sdk'
import { toast } from 'sonner'

interface SignTransactionParams {
  unsignedTransaction: string
  address: string
  network?: string
}

interface SignTransactionResult {
  signedXdr?: string
  error?: string
}

export async function signTransaction({
  unsignedTransaction,
  address,
  network = 'testnet',
}: SignTransactionParams): Promise<string> {
  try {
    // Determine the network passphrase
    const networkPassphrase = network === 'mainnet' 
      ? Networks.PUBLIC 
      : Networks.TESTNET

    // Parse the unsigned transaction
    const transaction = new Transaction(unsignedTransaction, networkPassphrase)
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('Transaction signing is only available in browser environment')
    }

    // Get the wallet type from localStorage
    const walletType = localStorage.getItem('walletType')
    
    let signedXdr: string

    if (walletType === 'freighter') {
      // Sign with Freighter
      if (!(window as any).freighter) {
        throw new Error('Freighter wallet not found')
      }

      const freighter = (window as any).freighter
      
      // Sign the transaction
      const signedTransaction = await freighter.signTransaction(unsignedTransaction, {
        network: network === 'mainnet' ? 'PUBLIC' : 'TESTNET',
        accountToSign: address,
      })
      
      signedXdr = signedTransaction
    } else if (walletType === 'albedo') {
      // Sign with Albedo
      if (!(window as any).albedo) {
        throw new Error('Albedo wallet not found')
      }

      const albedo = (window as any).albedo
      
      const result = await albedo.tx({
        xdr: unsignedTransaction,
        network: network === 'mainnet' ? 'public' : 'testnet',
        submit: false, // We don't want Albedo to submit, just sign
      })
      
      signedXdr = result.signed_envelope_xdr
    } else {
      throw new Error(`Unsupported wallet type: ${walletType}`)
    }

    if (!signedXdr) {
      throw new Error('Failed to sign transaction')
    }

    // Verify the signed transaction
    try {
      const signedTransaction = new Transaction(signedXdr, networkPassphrase)
      console.log('Transaction signed successfully:', signedTransaction.hash().toString('hex'))
    } catch (verifyError) {
      console.warn('Could not verify signed transaction:', verifyError)
    }

    return signedXdr
  } catch (error) {
    console.error('Error signing transaction:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown signing error'
    
    // Show user-friendly error messages
    if (errorMessage.includes('User declined')) {
      toast.error('Transaction cancelled', {
        description: 'You cancelled the transaction signing',
      })
    } else if (errorMessage.includes('not found')) {
      toast.error('Wallet not available', {
        description: errorMessage,
      })
    } else {
      toast.error('Failed to sign transaction', {
        description: errorMessage,
      })
    }
    
    throw error
  }
}

// Helper function to check if a wallet is available
export function isWalletAvailable(walletType: string): boolean {
  if (typeof window === 'undefined') return false
  
  switch (walletType) {
    case 'freighter':
      return Boolean((window as any).freighter)
    case 'albedo':
      return Boolean((window as any).albedo)
    default:
      return false
  }
}

// Helper function to get available wallets
export function getAvailableWallets(): string[] {
  if (typeof window === 'undefined') return []
  
  const wallets: string[] = []
  
  if ((window as any).freighter) {
    wallets.push('freighter')
  }
  
  if ((window as any).albedo) {
    wallets.push('albedo')
  }
  
  return wallets
}
