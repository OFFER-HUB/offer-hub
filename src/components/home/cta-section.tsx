import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CTASection() {
  return (
    <section className='py-16 bg-gradient-to-r from-[#002333] to-[#15949C] text-white'>
      <div className='container mx-auto px-4 max-w-7xl text-center'>
        <h2 className='text-3xl md:text-4xl font-bold mb-6'>
          Ready to get started?
        </h2>
        <p className='text-lg opacity-90 max-w-2xl mx-auto mb-8'>
          Join thousands of clients and freelancers already using Offer Hub to
          connect, collaborate, and create amazing projects
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link href='/post-project'>
            <Button
              size='lg'
              className='bg-white text-[#002333] hover:bg-white/90'
            >
              Find Talent
            </Button>
          </Link>
          <Button
            size='lg'
            className='bg-white text-[#002333] hover:bg-white/90'
          >
            Become a Freelancer
          </Button>
        </div>
      </div>
    </section>
  );
}
