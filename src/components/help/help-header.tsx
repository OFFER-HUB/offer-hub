import Image from 'next/image';
import Link from 'next/link';

export default function HelpHeader() {
  return (
    <header className='bg-white shadow-sm'>
      <div className='max-w-7xl mx-auto flex items-center justify-between px-4 py-4'>
        <div className='flex items-center gap-2'>
          <Image src='/logo.svg' alt='Offer Hub Logo' width={32} height={32} />
          <span className='text-sm font-semibold text-gray-900 tracking-wide'>
            OFFER HUB
          </span>
        </div>
        <Link
          href='/'
          className='text-sm text-blue-700 hover:underline flex items-center gap-1'
        >
          <span className='text-lg'>←</span>
          Back to Home
        </Link>
      </div>

      <div className='bg-gradient-to-r from-teal-900 to-teal-600 text-white py-16 px-4 text-center'>
        <h1 className='text-3xl font-bold mb-2'>How Can We Help You?</h1>
        <p className='text-lg mb-6'>
          Find answers, resources, and support to make the most of Offer Hub
        </p>
        <div className='max-w-xl mx-auto flex items-center bg-white rounded-md overflow-hidden'>
          <input
            type='text'
            placeholder='Search for help articles...'
            className='flex-1 px-4 py-3 text-gray-700 placeholder-gray-500 outline-none'
          />
          <button className='bg-teal-700 text-white px-6 py-3 hover:bg-teal-800 transition-colors'>
            🔍 Search
          </button>
        </div>
      </div>
    </header>
  );
}
