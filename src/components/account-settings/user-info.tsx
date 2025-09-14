import { useState } from 'react'
import { VALIDATION_LIMITS } from '@/constants/magic-numbers'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import userImage from '../../../public/avatar_olivia.jpg'
import { User } from '@/types/user.types'

interface UserInfoProps {
    user: User | null
    isUserActive: boolean
    isLoading?: boolean
}

interface ConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
}

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, cancelText, confirmText }: ConfirmationModalProps) {
    if (!isOpen) return null

    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-end bg-black bg-opacity-50 sm:items-center sm:justify-center'
            role='dialog'
            aria-labelledby='confirmation-modal-title'
            aria-modal='true'
        >
            <div
                className='bg-white rounded-lg shadow-lg w-full sm:w-[400px] max-w-md p-4 sm:p-6'
                onClick={(e) => e.stopPropagation()}
            >
                <h3 id='confirmation-modal-title' className='text-lg font-semibold text-[#002333] mb-4'>
                    {title}
                </h3>
                <p className='text-sm text-gray-600 mb-6'>
                    {message}
                </p>
                <div>
                    <div className='flex justify-end gap-3'>
                        <Button
                            variant='outline'
                            className='border-gray-300 text-gray-700 hover:bg-gray-100'
                            onClick={() => onClose()}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            variant='destructive'
                            className='bg-red-600 text-white hover:bg-red-700'
                            onClick={() => onConfirm()}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function UserInfo({ user, isUserActive, isLoading }: UserInfoProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleDeactivateClick = () => {
        setIsModalOpen(true)
    }

    const handleConfirmDeactivate = () => {
        setIsModalOpen(false)
        console.log('Account deactivation confirmed')
        // TODO: Implement actual deactivation logic here
    }

    const handleCancelDeactivate = () => {
        setIsModalOpen(false)
    }

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, VALIDATION_LIMITS.MAX_AVATAR_INITIALS);
    }

    const formatWalletAddress = (address?: string) => {
        if (!address) return 'Not connected';
        return `${address.slice(0, VALIDATION_LIMITS.MAX_WALLET_ADDRESS_PREFIX)}...${address.slice(-VALIDATION_LIMITS.MAX_WALLET_ADDRESS_SUFFIX)}`;
    }

    if (isLoading) {
        return (
            <div className='flex flex-col sm:flex-row md:flex md:items-center justify-between gap-3 mb-8'>
                <div className='bg-white flex min-w-[190px] py-3 px-2 rounded-lg justify-around'>
                    <div className='relative animate-pulse'>
                        <div className='w-12 h-12 bg-gray-200 rounded-full'></div>
                        <div className='w-3 h-3 absolute z-10 bottom-0 right-1 bg-gray-300 rounded-full'></div>
                    </div>
                    <div className='animate-pulse'>
                        <div className='h-4 bg-gray-200 rounded w-24 mb-2'></div>
                        <div className='h-3 bg-gray-200 rounded w-20'></div>
                    </div>
                </div>
                <div className='h-10 bg-gray-200 rounded-full w-32 animate-pulse'></div>
            </div>
        )
    }

    return (
        <div className='flex flex-col sm:flex-row md:flex md:items-center justify-between gap-3 mb-8'>
            <div className='bg-white flex min-w-[190px] py-3 px-2 rounded-lg justify-around'>
                <div className='relative'>
                    <Avatar className='w-12 h-12'>
                        <AvatarImage src={userImage.src} />
                        <AvatarFallback className='bg-gray-200'>
                            {getInitials(user?.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div
                        className={`w-3 h-3 absolute z-10 bottom-0 right-1 ${isUserActive ? 'bg-green-500' : 'bg-slate-400'} rounded-full`}
                    ></div>
                </div>
                <div>
                    <div className='font-medium'>
                        {user?.name || user?.username || 'Unknown User'}
                    </div>
                    <div className='text-sm text-gray-500'>
                        {formatWalletAddress(user?.wallet_address)}
                    </div>
                </div>
            </div>
            <Button
                variant='outline'
                className='text-[#FF0000] py-3 bg-inherit rounded-full border-[#FF2000] hover:bg-red-100 hover:text-red-600'
                onClick={() => handleDeactivateClick()}
            >
                Deactivate Account
            </Button>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => handleCancelDeactivate()}
                onConfirm={() => handleConfirmDeactivate()}
                title='Deactivate Account'
                message='Are you sure you want to deactivate your account? This action cannot be undone.'
                confirmText='Deactivate'
                cancelText='Cancel' />
        </div>
    )
}