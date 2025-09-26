import { useWalletContext } from "./WalletContext";
import { useState } from "react";

type WalletKitModule = {
	StellarWalletsKit: any;
	WalletNetwork: { TESTNET: string };
	FREIGHTER_ID: string;
	LOBSTR_ID: string;
	allowAllModules: () => any;
};

let cachedKit: InstanceType<any> | null = null;
let kitModule: WalletKitModule | null = null;

async function getKitInstance() {
	if (cachedKit && kitModule) return { kit: cachedKit, mod: kitModule };

	// Dynamically import the browser-dependent wallet kit at runtime (client-side only)
	const mod = await import("@creit.tech/stellar-wallets-kit");
	const kit = new mod.StellarWalletsKit({
		network: mod.WalletNetwork.TESTNET,
		selectedWalletId: mod.FREIGHTER_ID,
		modules: mod.allowAllModules(),
	});

	cachedKit = kit;
	kitModule = mod;
	return { kit, mod };
}

export const useWallet = () => {
	const walletState = useWalletContext();
	const [isConnecting, setIsConnecting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const connectWallet = async (walletId: string) => {
		try {
			setIsConnecting(true);
			setError(null);

			const { kit, mod } = await getKitInstance();

			kit.setWallet(walletId);

			const { address } = await kit.getAddress();

			const walletName =
				walletId === mod.FREIGHTER_ID
					? "Freighter"
					: walletId === mod.LOBSTR_ID
						? "LOBSTR"
						: "Unknown Wallet";

			walletState.connect(address, walletName);

			return { success: true, address };
		} catch (error: unknown) {
			const errorMessage =
				(error as Error)?.message || "Error connecting wallet";
			setError(errorMessage);
			console.error("Error connecting wallet:", error);
			return { success: false, error: errorMessage };
		} finally {
			setIsConnecting(false);
		}
	};

	const disconnectWallet = async () => {
		try {
			setError(null);
			const { kit } = await getKitInstance();
			await kit.disconnect();
			walletState.disconnect();
			return { success: true };
		} catch (error: unknown) {
			const errorMessage =
				(error as Error)?.message || "Error disconnecting wallet";
			setError(errorMessage);
			console.error("Error disconnecting wallet:", error);
			return { success: false, error: errorMessage };
		}
	};

	const signTransaction = async (xdr: string) => {
		try {
			setError(null);
			if (!walletState.address) {
				throw new Error("No wallet connected");
			}

			const { kit, mod } = await getKitInstance();

			const { signedTxXdr } = await kit.signTransaction(xdr, {
				address: walletState.address,
				networkPassphrase: mod.WalletNetwork.TESTNET,
			});

			return { success: true, signedTxXdr };
		} catch (error: unknown) {
			const errorMessage =
				(error as Error)?.message || "Error signing transaction";
			setError(errorMessage);
			console.error("Error signing transaction:", error);
			return { success: false, error: errorMessage };
		}
	};

	return {
		connectWallet,
		disconnectWallet,
		signTransaction,
		isConnecting,
		error,
		isConnected: walletState.connected,
		walletAddress: walletState.address,
		walletName: walletState.name,
	};
};