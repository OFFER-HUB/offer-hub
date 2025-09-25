import { MapPin, Clock, Briefcase, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Freelancer } from '@/app/freelancer-search/page'

interface FreelancerCardProps {
  freelancer: Freelancer
}

export default function FreelancerCard({ freelancer }: FreelancerCardProps) {
  const {
    name,
    title,
    rating,
    reviewCount,
    location,
    hourlyRate,
    description,
    skills,
    projectsCompleted,
    responseTime,
  } = freelancer

  return (
    <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-6'>
      <div className='flex flex-col md:flex-row'>
        {/* Left Column - Profile Info */}
        <div className='md:w-[200px] flex flex-col items-center text-center pb-6 md:pb-0'>
          <div className='relative h-24 w-24 mb-4'>
            <div className='relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-20 border-white'>
              <div className='h-full w-full flex items-center justify-center bg-gray-200'>
                <span className='text-gray-500 text-xl font-semibold'>{name.charAt(0)}</span>
              </div>
            </div>
            <div className='absolute bottom-0 right-0 h-6 w-6 bg-[#42A5A2] rounded-full transform translate-x-[-10px] translate-y-[-5px] border-2 border-white z-10' />
          </div>
          <h3 className='text-2xl font-semibold text-gray-800 mb-2'>{name}</h3>
          <p className='text-gray-500 mb-3'>{title}</p>

          <div className='flex items-center justify-center mb-3'>
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <title>Rating star {star}</title>
                <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
              </svg>
            ))}
            <span className='ml-2 text-gray-500'>({reviewCount})</span>
          </div>

          <div className='flex items-center justify-center text-gray-500 mb-3'>
            <MapPin className='h-5 w-5 mr-1' />
            <span>{location}</span>
          </div>

          <p className='text-xl font-semibold text-gray-800'>${hourlyRate}/hr</p>
        </div>

        {/* Right Column - Description, Skills, Stats */}
        <div className='flex-1 md:pl-8'>
          <p className='text-gray-500 mb-6 leading-relaxed'>{description}</p>

          <div className='flex flex-wrap gap-2 mb-8'>
            {skills.map((skill) => (
              <Badge 
                key={skill} 
                className='bg-teal-100 text-black hover:bg-teal-200 border-none rounded-full px-3 py-1 text-sm font-normal'
              >
                {skill}
              </Badge>
            ))}
          </div>

          <div className='border-t border-gray-200 pt-6'>
            <div className='flex flex-row justify-between items-center mt-6'>
              <div className='flex items-center gap-14'>
                <div className='flex items-center text-gray-600'>
                  <Briefcase className='h-5 w-5 mr-2 text-teal-500 flex-shrink-0' />
                  <span className='text-sm'>{projectsCompleted} Projects completed</span>
                </div>
                <div className='flex items-center text-gray-600'>
                  <Clock className='h-5 w-5 mr-2 text-teal-500 flex-shrink-0' />
                  <span className='text-sm'>Response time: {responseTime}</span>
                </div>
              </div>

              <div className='flex gap-4'>
                <Button className='bg-teal-500 hover:bg-teal-600 text-white font-medium h-10 px-6'>
                  Hire Me
                </Button>
                <Button
                  variant='outline'
                  className='border-gray-300 text-gray-700 hover:bg-gray-50 font-medium h-10'
                >
                  <MessageSquare className='h-5 w-5 mr-2' />
                  Contact
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

