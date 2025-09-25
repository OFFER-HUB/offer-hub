import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface WalletSettingsProps {
    walletAddress: string
    setWalletAddress: (address: string) => void
    walletPlaceholder: string
    updateWallet: () => void
}

export function WalletSettings({ walletAddress, setWalletAddress, walletPlaceholder, updateWallet }: WalletSettingsProps) {
    function TabTitleComponent({ label }: { label: string }) {
        return <h3 className='text-[20px] text-[#002333] font-normal mb-4'>{label}</h3>
    }

    return (
        <div>
            <TabTitleComponent label='Wallet & Payment Settings' />
            <div className='space-y-4'>
                <div>
                    <Input
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder={walletPlaceholder}
                        className='bg-gray-50 border-gray-200 text-neutral-600'
                    />
                </div>
                <Button
                    className='bg-teal-600 hover:bg-teal-700 text-white px-8 rounded-full'
                    onClick={updateWallet}
                >
                    Update Wallet
                </Button>
            </div>
        </div>
    )
}

