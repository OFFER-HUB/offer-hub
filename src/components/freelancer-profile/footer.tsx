import React from 'react';

type Props = {
  className?: string;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;
function Footer({ className, children, ...props }: Props) {
  return (
    <footer className='border-t border-[#B4B9C9] bg-white'>
      <div
        {...props}
        className={`max-w-6xl mx-auto pt-8 pb-3.5 flex justify-between ${className}`}
      >
        {children}
      </div>
    </footer>
  );
}

export default Footer;
