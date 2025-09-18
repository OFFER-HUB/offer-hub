"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface WalletContextType {
  address: string | null;
  name: string | null;
  connected: boolean;
  connect: (address: string, name: string) => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);


interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
	const [address, setAddress] = useState<string | null>(null);
	const [name, setName] = useState<string | null>(null);
	const [connected, setConnected] = useState(false);

	const connect = (address: string, name: string) => {
		setAddress(address);
		setName(name);
		setConnected(true);
	};

	const disconnect = () => {
		setAddress(null);
		setName(null);
		setConnected(false);
	};

	return (
		<WalletContext.Provider
			value={{ address, name, connected, connect, disconnect }}
		>
			{children}
		</WalletContext.Provider>
	);

}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
}
