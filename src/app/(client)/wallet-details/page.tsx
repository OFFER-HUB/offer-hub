'use client'

import DepositButton from '@/components/wallet/DepositButton'
import DepositModal from '@/components/wallet/DepositModal'
import StellarAssetsList, { AssetProps } from '@/components/wallet/StellarAssetsList'
import WalletBalance from '@/components/wallet/WalletBalance'
import React from 'react'
import { useState } from 'react'


const assets: AssetProps[] = [
  {
    id: 'eth123',
    assetName: 'Ethereum',
    assetImage: '/assetImage.png',
    assetAbrv: 'ETH',
    assetBalance: 1.02,
    assetInDollar: 404.12,
    percentageMovement: 24,
    movementType: 'up'
  },
  {
    id: 'avax123',
    assetName: 'Avax',
    assetImage: '/assetImage.png',
    assetAbrv: 'AVX',
    assetBalance: 10.02,
    assetInDollar: 44.12,
    percentageMovement: 24,
    movementType: 'down'
  },
  {
    id: 'matic123',
    assetName: 'Matic',
    assetImage: '/assetImage.png',
    assetAbrv: 'MAT',
    assetBalance: 1.02,
    assetInDollar: 4.12,
    percentageMovement: 24,
    movementType: 'neutral'
  },
  {
    id: 'stellar123',
    assetName: 'Stellar',
    assetImage: '/assetImage.png',
    assetAbrv: 'XLM',
    assetBalance: 100.02,
    assetInDollar: 4004.12,
    percentageMovement: 50,
    movementType: 'up'
  },
  {
    id: 'usdc123',
    assetName: 'USDC',
    assetImage: '/assetImage.png',
    assetAbrv: 'USDC',
    assetBalance: 102,
    assetInDollar: 102.12,
    percentageMovement: 0.99,
    movementType: 'neutral'
  },
]
function Wallet() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  return (
    <main className='bg-[#F6F6F6] h-screen select-none'>
      <span className='w-full h-[4rem] bg-white text-[#002333] text-base font-bold flex items-center justify-center'>Wallet</span>
      <div className='w-full h-full flex justify-center items-center'>
        <div className='w-[44.625rem] h-[43.5rem] rounded-[0.75rem] bg-white py-[3.75rem] px-[2rem] flex flex-col items-center'>
          <WalletBalance walletBalance={404.18} percentageMovement={12.44} movementType='up' />
          <DepositButton onDeposit={() => setIsDepositModalOpen(true)} />
            <StellarAssetsList assets={assets}  />
        </div>
      </div>

      <DepositModal
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
        />
    </main>
  )
}

export default Wallet