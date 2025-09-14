import Image from 'next/image';
import { FiExternalLink } from 'react-icons/fi';

const resources = [
  {
    title: 'Community Forum',
    description:
      'Connect with other freelancers and clients, share experiences, and get advice from the Offer Hub community.',
    href: '#',
    image: '/community-placeholder.png',
  },
  {
    title: 'Freelancer Blog',
    description:
      'Read articles, tips, and success stories to help you grow your freelance business or find the perfect talent.',
    href: '#',
    image: '/blog-placeholder.png',
    external: true,
  },
];

export default function CommunityResources() {
  return (
    <section className='max-w-6xl mx-auto px-4 py-16'>
      <h2 className='text-2xl font-bold text-center mb-2'>
        Community & Resources
      </h2>
      <p className='text-center text-gray-600 mb-10'>
        Join our{' '}
        <a href='#' className='text-teal-600 font-medium hover:underline'>
          community
        </a>{' '}
        and access additional resources to enhance your experience
      </p>

      <div className='grid sm:grid-cols-2 gap-6'>
        {resources.map((res, idx) => (
          <a
            key={idx}
            href={res.href}
            target={res.external ? '_blank' : '_self'}
            rel='noopener noreferrer'
            className='block bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow'
          >
            <div className='relative w-full h-40 bg-gray-100'>
              <Image
                src={res.image}
                alt={res.title}
                fill
                className='object-cover'
              />
            </div>
            <div className='p-4'>
              <h3 className='font-semibold text-gray-900 flex items-center gap-1'>
                {res.title}
                {res.external && <FiExternalLink className='text-sm' />}
              </h3>
              <p className='text-sm text-gray-600 mt-1'>{res.description}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
