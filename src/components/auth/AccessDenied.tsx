'use client'

import { useRouter } from 'next/navigation'



export const AccessDenied = () => {
    const router = useRouter()


    return (
        <div className='flex flex-col items-center justify-center h-screen text-center px-4'>
            <h1 className='text-3xl font-bold text-red-600'>Access Denied</h1>
            <p className='mt-3 text-gray-600'>
                You don’t have permission to view this page.
            </p>
            <button
                className='mt-5 px-4 py-2 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 transition'
                onClick={() => router.back()}
            >
                Go Back
            </button>
        </div>
    )
};
