"use client";
import { useState } from "react";
import Link from "next/link";
import { useWallet } from "./useWallet.hook";
import {
  FREIGHTER_ID,
  LOBSTR_ID,
  ALBEDO_ID,
  XBULL_ID,
  RABET_ID,
} from "@creit.tech/stellar-wallets-kit";

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const WalletConnectPage: React.FC = () => {
  const { connectWallet, isConnecting, error, isConnected, walletAddress } =
    useWallet();
  const [connectingWalletId, setConnectingWalletId] = useState<string | null>(
    null
  );

  const walletOptions: WalletOption[] = [
    {
      id: FREIGHTER_ID,
      name: "Freighter",
      icon: "🚀",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200 hover:border-orange-300",
    },
    {
      id: ALBEDO_ID,
      name: "Albedo",
      icon: "⭐",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200 hover:border-blue-300",
    },
    {
      id: XBULL_ID,
      name: "xBull",
      icon: "🐂",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200 hover:border-red-300",
    },
    {
      id: RABET_ID,
      name: "Rabet",
      icon: "🐰",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200 hover:border-purple-300",
    },
    {
      id: LOBSTR_ID,
      name: "Lobstr Vault",
      icon: "🦞",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200 hover:border-teal-300",
    },
  ];

  const handleWalletConnect = async (walletId: string) => {
    setConnectingWalletId(walletId);

    const result = await connectWallet(walletId);

    if (result.success) {
      console.log(`Successfully connected to wallet: ${result.address}`);
    } else {
      console.error(`Failed to connect: ${result.error}`);
      setConnectingWalletId(null);
    }
  };

  if (isConnected && walletAddress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Wallet Connected!
            </h2>
            <p className="text-gray-600 mb-4">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-[#15949C] text-white px-6 py-3 rounded-full font-medium hover:bg-[#15949C]/90 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      {/* Back Button - Upper Left */}
      <Link
        href="/"
        className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span>Back</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Connect wallet
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Connect wallet to continue
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={() => setConnectingWalletId(null)}
                className="text-red-600 hover:text-red-800 text-sm underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Wallet Options */}
        <div className="space-y-3">
          {walletOptions.map((wallet, index) => {
            const isThisWalletConnecting =
              connectingWalletId === wallet.id && isConnecting;
            const isDisabled = isConnecting && connectingWalletId !== wallet.id;

            return (
              <button
                key={index}
                onClick={() => handleWalletConnect(wallet.id)}
                disabled={isDisabled}
                className={`
                  w-full px-4 py-4 sm:py-5 
                  bg-white border-2 rounded-full 
                  ${wallet.borderColor}
                  ${
                    isDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : "transition-all duration-200 ease-in-out hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                  group
                `}
              >
                <div className="flex items-center justify-center space-x-4">
                  {/* Icon */}
                  <div
                    className={`
                    w-10 h-10 sm:w-12 sm:h-12 
                    ${wallet.bgColor} 
                    rounded-xl flex items-center justify-center
                    text-lg sm:text-xl
                    ${
                      !isDisabled
                        ? "group-hover:scale-110 transition-transform duration-200"
                        : ""
                    }
                  `}
                  >
                    {isThisWalletConnecting ? (
                      <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                    ) : (
                      wallet.icon
                    )}
                  </div>

                  {/* Wallet Name */}
                  <span
                    className={`
                    flex-1 text-left font-semibold text-base sm:text-lg
                    ${wallet.color}
                    ${
                      !isDisabled
                        ? "group-hover:text-opacity-80 transition-colors duration-200"
                        : ""
                    }
                  `}
                  >
                    {wallet.name}
                    {isThisWalletConnecting && (
                      <span className="text-gray-500 text-sm block">
                        Connecting...
                      </span>
                    )}
                  </span>

                  {/* Arrow */}
                  <div
                    className={`
                    text-gray-400 
                    ${
                      !isDisabled
                        ? "group-hover:text-gray-600 transition-colors duration-200"
                        : ""
                    }
                  `}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {isConnecting && connectingWalletId && (
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Connecting to{" "}
              {walletOptions.find((w) => w.id === connectingWalletId)?.name}...
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Check your wallet extension for connection prompt
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            By connecting your wallet, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800 underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800 underline">
              Privacy Policy
            </a>
          </p>

          {/* Exit Button */}
          <div className="mt-6">
            <Link
              href="/"
              className="inline-block text-gray-600 hover:text-gray-800 text-sm border border-gray-300 rounded-full px-5 py-2 transition-colors hover:bg-gray-100"
            >
              Skip wallet connection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnectPage;
