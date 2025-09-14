import { Check, Mail } from 'lucide-react';
import Link from 'next/link';

export const CheckEmail = () => {
  return (
    <div className='bg-[#f6f6f6] w-full h-screen flex justify-center'>
      <div className='flex flex-col items-center justify-center text-center gap-5 rounded-lg bg-white w-full h-fit mx-10 max-w-3xl py-16 px-16 mt-20'>
        {/* Email Icon with Checkmark */}
        <div className='relative inline-block'>
          <div className='w-24 h-16 bg-cyan-400 rounded-lg flex items-center justify-center relative'>
            <Mail className='w-12 h-8 text-white' />
            {/* Envelope flap effect */}
            <div
              className='absolute top-0 left-0 w-full h-8 bg-cyan-300 rounded-t-lg transform origin-bottom'
              style={{
                clipPath: 'polygon(0 0, 50% 60%, 100% 0)',
              }}
            ></div>
          </div>
          {/* Checkmark badge */}
          <div className='absolute -top-2 -right-2 w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center'>
            <Check className='w-5 h-5 text-white stroke-[3]' />
          </div>
        </div>

        {/* Content */}
        <div className=''>
          <h1 className='text-2xl font-semibold text-gray-900'>
            Check your email
          </h1>
          <p className='text-gray-600 leading-relaxed'>
            We've sent an email with the next steps, check your inbox and follow
            along.
          </p>
        </div>

        <Link
          href='/onboarding/login'
          className='w-3/6 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-full font-medium mt-10'
        >
          Return to login
        </Link>
      </div>
    </div>
  );
};
