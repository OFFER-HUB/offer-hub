import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { categories } from '@/data/landing-data';

export default function CategoriesSection() {
  return (
    <section className='py-16 bg-[#DEEFE7]/30'>
      <div className='container mx-auto px-4 max-w-7xl'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-[#002333] mb-4'>
            Popular Categories
          </h2>
          <p className='text-[#002333]/70 max-w-2xl mx-auto'>
            Browse through the most in-demand services and find the perfect
            match for your project needs
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {categories.map((category) => (
            <div
              key={category.name}
              className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col items-center text-center'
            >
              <div className='w-16 h-16 rounded-full bg-[#DEEFE7] flex items-center justify-center mb-4'>
                {category.icon}
              </div>
              <h3 className='text-xl font-semibold text-[#002333] mb-2'>
                {category.name}
              </h3>
              <p className='text-[#002333]/70 mb-4'>{category.description}</p>
              <Link
                href={category.link}
                className='text-[#15949C] font-medium flex items-center hover:underline mt-auto'
              >
                Explore
                <ChevronRight className='h-4 w-4 ml-1' />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
