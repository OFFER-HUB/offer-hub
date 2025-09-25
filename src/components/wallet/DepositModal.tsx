'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import QRCodeDisplay from './QRCodeDisplay'
import { TIMEOUTS } from '@/constants/magic-numbers'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
}

interface NetworkOption {
  id: string
  name: string
  displayName: string
}

interface CoinOption {
  id: string
  name: string
  symbol: string
  networks: NetworkOption[]
}

const coinOptions: CoinOption[] = [
  {
    id: 'usdt',
    name: 'Tether',
    symbol: 'USDT',
    networks: [
      { id: 'bep20', name: 'bep20', displayName: 'BEP 20' },
      { id: 'erc20', name: 'erc20', displayName: 'ERC 20' },
      { id: 'trc20', name: 'trc20', displayName: 'TRC 20' }
    ]
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    networks: [
      { id: 'erc20', name: 'erc20', displayName: 'ERC 20' },
      { id: 'bep20', name: 'bep20', displayName: 'BEP 20' }
    ]
  }
]

// Mock wallet addresses for different networks
const walletAddresses: Record<string, string> = {
  'usdt-bep20': '0xec784217852bb71f30523bcce4c10adc7e1cec4',
  'usdt-erc20': '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4',
  'usdt-trc20': 'TQn9Y2khEsLJW1ChVWFMSMeRDow5CNYJ7g',
  'usdc-erc20': '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4',
  'usdc-bep20': '0xec784217852bb71f30523bcce4c10adc7e1cec4'
}

function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [selectedCoin, setSelectedCoin] = useState<string>('usdt')
  const [selectedNetwork, setSelectedNetwork] = useState<string>('bep20')
  const [copied, setCopied] = useState(false)
  const [deposited, setDeposited] = useState(false)

  const currentCoin = coinOptions.find(coin => coin.id === selectedCoin)
  const availableNetworks = currentCoin?.networks || []
  const walletAddress = walletAddresses[`${selectedCoin}-${selectedNetwork}`] || ''

  const handleCoinChange = (coinId: string) => {
    setSelectedCoin(coinId)
    const newCoin = coinOptions.find(coin => coin.id === coinId)
    if (newCoin && newCoin.networks.length > 0) {
      setSelectedNetwork(newCoin.networks[0].id)
    }
  }

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      toast.success('Address copied to clipboard!')
      setTimeout(() => setCopied(false), TIMEOUTS.COPY_FEEDBACK_DURATION)
    } catch (err) {
      toast.error('Failed to copy address')
    }
  }

  const handleDeposited = () => {
    setDeposited(true)
    toast.success('Deposit confirmed!')
    setTimeout(() => {
      setDeposited(false)
      onClose()
    }, 1500)
  }

  const getNetworkDisplayName = (networkId: string) => {
    const network = availableNetworks.find(net => net.id === networkId)
    return network?.displayName || networkId.toUpperCase()
  }

  const getNetworkWarning = () => {
    const networkName = getNetworkDisplayName(selectedNetwork)
    const coinSymbol = currentCoin?.symbol || selectedCoin.toUpperCase()
    
    switch (selectedNetwork) {
      case 'bep20':
        return `Send only ${coinSymbol} to this address. Ensure the network is Binance Smart Chain (BEP20).`
      case 'erc20':
        return `Send only ${coinSymbol} to this address. Ensure the network is Ethereum (ERC20).`
      case 'trc20':
        return `Send only ${coinSymbol} to this address. Ensure the network is TRON (TRC20).`
      default:
        return `Send only ${coinSymbol} to this address. Ensure the network is ${networkName}.`
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[30.625rem]'>
        <DialogHeader>
          <DialogTitle className='text-lg font-medium text-gray-700'>
            Select coin
          </DialogTitle>
        </DialogHeader>
        
        <div className='space-y-6'>
          {/* Coin Selection */}
          <div className='space-y-2'>
            <Select value={selectedCoin} onValueChange={handleCoinChange}>
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {coinOptions.map((coin) => (
                  <SelectItem key={coin.id} value={coin.id}>
                    {coin.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Network Selection */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700'>
              Network
            </label>
            <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableNetworks.map((network) => (
                  <SelectItem key={network.id} value={network.id}>
                    {network.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* QR Code */}
          {walletAddress && (
            <QRCodeDisplay 
              value={walletAddress} 
              size={160} 
              coinId={selectedCoin}
              showLogo={true}
            />
          )}

          {/* Wallet Address */}
          {walletAddress && (
            <div className='bg-[#F0F3FF] rounded-lg p-4 space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm text-gray-600 break-all font-mono'>
                    {walletAddress}
                  </p>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleCopyAddress}
                  className='ml-2 text-[#516AE4] hover:text-purple-700 hover:bg-transparent'
                >
                  {copied ? (
                    <>
                      <Check className='h-4 w-4 mr-1' />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className='h-4 w-4 mr-1' />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Warning Text */}
          <div className='text-center'>
            <p className='text-base text-gray-600 font-bold'>
              {getNetworkWarning().split(' is ')[0]} is <span className='text-[#516AE4]'>{getNetworkWarning().split(' is ')[1]}</span>
            </p>
          </div>

          {/* Deposited Button */}
          <Button
            onClick={handleDeposited}
            disabled={deposited}
            className='w-full bg-[#19213D] hover:bg-[#101527] text-white rounded-[2rem] h-[2.75rem] flex items-center justify-center'
          >
            {deposited ? 'Confirmed!' : 'Deposited'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DepositModal
