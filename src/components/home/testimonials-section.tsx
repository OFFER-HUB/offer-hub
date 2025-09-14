import Image from 'next/image';
import { testimonials } from '@/data/landing-data';
import StarRating from '@/components/ui/star-rating';

export default function TestimonialsSection() {
  return (
    <section className='py-16 bg-[#DEEFE7]/30'>
      <div className='container mx-auto px-4 max-w-7xl'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-[#002333] mb-4'>
            What Our Users Say
          </h2>
          <p className='text-[#002333]/70 max-w-2xl mx-auto'>
            Hear from clients and freelancers who have found success on our
            platform
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className='bg-white p-6 rounded-lg shadow-md'>
              <div className='flex items-center gap-1 mb-4'>
                <StarRating rating={5} />
              </div>
              <p className='text-[#002333]/80 mb-6 italic'>
                &quot;{testimonial.text}&quot;
              </p>
              <div className='flex items-center gap-3'>
                <div className='h-12 w-12 rounded-full overflow-hidden'>
                  <Image
                    src={testimonial.avatar || '/placeholder.svg'}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className='object-cover'
                  />
                </div>
                <div>
                  <h4 className='font-semibold text-[#002333]'>
                    {testimonial.name}
                  </h4>
                  <p className='text-sm text-[#002333]/70'>
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
