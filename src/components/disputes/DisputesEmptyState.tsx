import { Plus } from 'lucide-react';
import React from 'react';

const DisputesEmptyState = () => {
  return (
    <div className='p-4 border-t'>
                <div className='border-2 rounded-[8px] border-[#DEEFE7] p-3 gap-5 flex flex-col items-center justify-center h-[174px] '>
                  <h1 className='text-2xl font-medium text-black'>
                    You have no open dispute
                  </h1>
                  <button className='p-2 rounded-[20px] gap-[10px] items-center justify-center flex bg-[#149A9B] w-fit text-white font-normal text-sm '>
                    Open a new dispute
                    <Plus className='text-white size-4' />
                  </button>
                </div>
              </div>
  );
};

export default DisputesEmptyState;
