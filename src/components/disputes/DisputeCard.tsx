import Image from 'next/image';
import React from 'react';

type DisputeCardProps = {
  title: string;
  name: string;
  date: string;
  avatarUrl: string;
};

const DisputeCard = ({ title, name, date, avatarUrl }: DisputeCardProps) => {
  return (
    <div className='flex flex-col gap-[9px] pb-3 border-b border-[#E1E4ED]'>
      <h1 className='font-bold text-base text-[#002333]'>{title}</h1>
      <div className='flex gap-[9px] items-center'>
        <div className='bg-gray-300 size-8 rounded-full overflow-hidden'>
          <Image
            src={avatarUrl}
            width={32}
            height={32}
            className='object-cover w-full h-full'
            alt='avatar'
          />
        </div>
        <div className='flex flex-col'>
          <h5 className='font-medium text-sm text-[#002333]'>{name}</h5>
          <p className='font-normal text-xs text-[#6D758F]'>Date opened: {date}</p>
        </div>
      </div>
    </div>
  );
};

export default DisputeCard;