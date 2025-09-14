'use client';
import React, { useState } from 'react';
import OnboardingHeader from '@/components/layout/OnboardingHeader';
import { TIMEOUTS } from '@/constants/magic-numbers';

interface ConnectWalletProps {
  onWalletConnected: (walletAddress: string) => void;
}

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ onWalletConnected }) => {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const walletOptions: WalletOption[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '/metamask.jpg',
      description: 'Connect with MetaMask',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200 hover:border-orange-300'
    },
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '/phantom.jpg',
      description: 'Connect with Phantom',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200 hover:border-purple-300'
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '/coinbase.jpg',
      description: 'Connect with Coinbase',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200 hover:border-blue-300'
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '/walletconnect.jpg',
      description: 'Connect with WalletConnect',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200 hover:border-green-300'
    },
    {
      id: 'glow',
      name: 'Glow',
      icon: '/glow.jpg',
      description: 'Connect with Glow',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200 hover:border-purple-300'
    },
    {
      id: 'bitkeep',
      name: 'BitKeep',
      icon: '/bitkeep.jpg',
      description: 'Connect with BitKeep',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200 hover:border-purple-300'
    },
    {
      id: 'trust',
      name: 'Trust Wallet',
      icon: '/trust.jpg',
      description: 'Connect with Trust Wallet',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200 hover:border-blue-300'
    },
    {
      id: 'solflare',
      name: 'Solflare',
      icon: '/solflare.jpg',
      description: 'Connect with Solflare',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200 hover:border-yellow-300'
    }
  ];

  const handleWalletConnect = async (walletId: string) => {
    setIsConnecting(walletId);
    
    try {
      await new Promise(resolve => setTimeout(resolve, TIMEOUTS.API_DELAY_MAX));
      
      const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      
      onWalletConnected(mockAddress);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setIsConnecting(null);
    }
  };

  return (
    <div className='min-h-screen bg-[#f6f6f6]'>
      <OnboardingHeader />

      <div className='flex items-center justify-center min-h-[calc(100vh-80px)] p-8'>
        <div 
          className='bg-white'
          style={{
            width: '600px',
            height: '700px',
            borderRadius: '12px',
            padding: '60px',
            display: 'flex',
            flexDirection: 'column',
            gap: '45px',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div className='text-center w-full'>
            <h1 
              className='mb-2'
              style={{
                fontWeight: 700,
                fontSize: '24px',
                lineHeight: '100%',
                letterSpacing: '0%',
                textAlign: 'center',
                color: '#002333'
              }}
            >
              Connect wallet
            </h1>
            <p 
              style={{
                fontWeight: 600,
                fontSize: '12.22px',
                lineHeight: '100%',
                letterSpacing: '0%',
                textAlign: 'center',
                color: '#149A9B'
              }}
            >
              Connect wallet to continue
            </p>
          </div>

          <div className='w-full flex flex-col items-center'>
            <div className='space-y-3 w-full flex flex-col items-center'>
              {walletOptions.map((wallet) => {
                const getBorderColor = (walletId: string) => {
                  switch (walletId) {
                    case 'metamask': return '#F5841F';
                    case 'phantom': return '#551EF4';
                    case 'coinbase': return '#0052FF';
                    case 'walletconnect': return '#3B99FC';
                    case 'glow': return '#AC22C1';
                    case 'bitkeep': return '#7524F9';
                    case 'trust': return '#3375BB';
                    case 'solflare': return '#FFB30F';
                    default: return '#E5E7EB';
                  }
                };

                return (
                  <button
                    key={wallet.id}
                    onClick={() => handleWalletConnect(wallet.id)}
                    disabled={isConnecting !== null}
                    className='transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative'
                    style={{
                      width: '100%',
                      maxWidth: '372px',
                      height: '56px',
                      borderRadius: '4px',
                      border: `1px solid ${getBorderColor(wallet.id)}`,
                      opacity: 1,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 16px',
                      backgroundColor: 'white'
                    }}
                  >
                    <div className='flex items-center space-x-3'>
                      <img 
                        src={wallet.icon} 
                        alt={wallet.name} 
                        style={{
                          width: '21.33333396911621px',
                          height: '20px',
                          opacity: 1
                        }}
                      />
                    </div>
                    
                    <div className='flex-1 flex justify-center'>
                      <div className='font-semibold text-gray-900'>
                        {wallet.name}
                      </div>
                    </div>
                    
                    {isConnecting === wallet.id && (
                      <div className='flex items-center'>
                        <svg className='animate-spin h-5 w-5 text-gray-500' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                          <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectWallet; 