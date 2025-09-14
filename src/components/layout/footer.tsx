import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className='bg-[#002333] text-white pt-16 pb-8'>
      <div className='container mx-auto px-4 max-w-7xl'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12'>
          <div>
            <div className='flex items-center mb-6'>
              <Image
                src='/logo.png'
                alt='Offer Hub Logo'
                width={40}
                height={40}
                className='object-contain'
              />
              <span className='font-bold text-xl'>OFFER HUB</span>
            </div>
            <p className='opacity-80 mb-6'>
              Connecting talented freelancers with clients worldwide for
              successful project collaborations.
            </p>
            <div className='flex gap-4'>
              {/* Social media icons would go here */}
            </div>
          </div>

          <div>
            <h3 className='font-semibold text-lg mb-4'>For Clients</h3>
            <ul className='space-y-2 opacity-80'>
              <li>
                <Link href='/find-workers' className='hover:text-[#15949C]'>
                  Find Freelancers
                </Link>
              </li>
              <li>
                <Link href='/post-project' className='hover:text-[#15949C]'>
                  Post a Project
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:text-[#15949C]'>
                  Payment Protection
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:text-[#15949C]'>
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='font-semibold text-lg mb-4'>For Freelancers</h3>
            <ul className='space-y-2 opacity-80'>
              <li>
                <Link href='#' className='hover:text-[#15949C]'>
                  Find Work
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:text-[#15949C]'>
                  Create Profile
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:text-[#15949C]'>
                  Get Paid
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:text-[#15949C]'>
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='font-semibold text-lg mb-4'>Resources</h3>
            <ul className='space-y-2 opacity-80'>
              <li>
                <Link href='/help' className='hover:text-[#15949C]'>
                  Help & Support
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:text-[#15949C]'>
                  Blog
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:text-[#15949C]'>
                  Community
                </Link>
              </li>
              <li>
                <Link href='#' className='hover:text-[#15949C]'>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href='/faq' className='hover:text-[#15949C]'>
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className='border-t border-white/20 pt-8 text-center opacity-70 text-sm'>
          <p>© {new Date().getFullYear()} Offer Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
