import { Plus } from 'lucide-react';
import React from 'react';

const StartDisputeButton = () => {
  return (
    <button className='p-2 rounded-[20px] gap-[10px] items-center justify-center flex bg-[#149A9B] w-fit text-white font-normal text-sm '>
      <Plus className='text-white size-4' />
      New dispute
    </button>
  );
};

export default StartDisputeButton;