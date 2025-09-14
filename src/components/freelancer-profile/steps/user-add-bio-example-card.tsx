import React from 'react';

const ExampleBioCard = () => {
  return (
    <div className='mt-8'>
      <div className='border border-gray-200 rounded-lg p-6 bg-white'>
        <div className='flex items-center mb-4'>
          <div className='w-12 h-12 rounded-full bg-gray-200 mr-4 relative'>
            <div className='absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white'></div>
          </div>
          <div>
            <h3 className='font-medium'>Juan G.</h3>
            <p className='text-xs text-gray-500'>Intermediate web developer</p>
            <div className='flex items-center text-xs mt-1'>
              <span className='flex items-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-3 w-3 text-yellow-400'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' />
                </svg>
                5.0
              </span>
              <span className='mx-2'>|</span>
              <span>$75.00/hr</span>
              <span className='mx-2'>|</span>
              <span>14 jobs</span>
            </div>
          </div>
        </div>
        <p className='text-sm text-gray-600'>
          I'm a developer experienced in building websites for small and medium-sized businesses, whether you're trying
          to win work, list your services, or create a new online store, I can help.
        </p>
      </div>
    </div>
  )
}

export default ExampleBioCard
