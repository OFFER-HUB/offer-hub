import Image from 'next/image';

export default function Header({showGreetings = true}: {showGreetings?: boolean}) {
  return (
    <div className='flex items-center justify-between bg-white border-b px-6 py-4'>
      {
        showGreetings && <h2 className='text-lg font-medium invisible lg:visible'>Good Morning John Doe</h2>
      }
      <div className='h-10 w-10 overflow-hidden rounded-full bg-gray-200'>
        <Image src='/profile.jpeg' alt='User avatar' width={40} height={40} />
      </div>
    </div>
  );
}
