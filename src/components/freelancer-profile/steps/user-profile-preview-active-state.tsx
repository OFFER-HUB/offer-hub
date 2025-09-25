'use client'

import { useState } from 'react'
import { Edit, ChevronLeft } from 'lucide-react'
import { FaEthereum } from 'react-icons/fa'
import type { ProfileStepProps } from '@/app/types/freelancer-profile'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

// Sample user data based on the image
// const sampleUserData = {
//   name: "Olivia Rhye",
//   email: "olivia@outlookmail.com",
//   location: "Madrid (Spain) 8:53 PM local time",
//   title: "Blockchain Developer || Web 3 Product Expert",
//   bio: "I'm a developer experienced in building websites for small and medium-sized businesses. Whether you're trying to win work, list your services, or create a new online store, I can help.",
//   bulletPoints: [
//     "Knows HTML and CSS, PHP, jQuery, WordPress, and SEO",
//     "Full project management from start to finish",
//     "Regular communication is important to me, so let's stay in touch",
//   ],
//   hourlyRate: "0.267",
//   skills: [
//     "Solidity",
//     "Information Info-graphics",
//     "Brand Management",
//     "Branding",
//     "Product Design",
//     "Branding & Marketing",
//     "Brand Development",
//   ],
//   workExperience: [
//     {
//       id: 1,
//       title: "Software Engineer",
//       company: "Microsoft",
//       startDate: "2021-08",
//       endDate: "Present",
//       location: "USA, Washington",
//       description:
//         "This is your job experience description section. Lorem ipsum.",
//     },
//   ],
//   education: [
//     {
//       id: 1,
//       institution: "Northwestern University",
//       degree: "Bachelor of Science(BSC) || Computer Sci",
//       startDate: "2017-09",
//       endDate: "2021-05",
//       location: "USA, New Jersey",
//       description:
//         "This is your job experience description section. Lorem ipsum.",
//     },
//     {
//       id: 2,
//       institution: "Northwestern University",
//       degree: "Bachelor of Science(BSC) || Computer Sci",
//       startDate: "2017-09",
//       endDate: "2021-05",
//       location: "USA, New Jersey",
//       description:
//         "This is your job experience description section. Lorem ipsum.",
//     },
//   ],
//   languages: [
//     {
//       id: 1,
//       language: "English",
//       level: "Fluent",
//     },
//     {
//       id: 2,
//       language: "Spanish",
//       level: "Fluent",
//     },
//   ],
//   profilePicture: "/api/placeholder/50/50", // Using placeholder as per instructions
// };

// Helper function to format dates
const formatDate = (month?: string, year?: string) => {
  if (!month || !year) return ''
  return `${month} ${year}`
}


export default function UserProfilePreviewActiveState({ userData, prevStep, nextStep }: ProfileStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  // const userData = sampleUserData;

  const handleSubmitProfile = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      console.log('Profile submitted successfully!', userData)
      setIsSubmitting(false)
      nextStep() // Go to a final "success" screen
    }, 1500)
  }

  const nftBadges = [1, 2, 3, 4, 5]

  return (
    <div className='flex flex-col items-center justify-center w-full bg-gray-50 py-10'>
      <div className='max-w-5xl mx-auto pb-10 w-full px-4'>
        <h1 className='text-3xl font-semibold text-gray-800 py-6'>Preview Profile</h1>
        <div className='bg-white rounded-lg p-6 mb-8 shadow-md text-center'>
          <div className='flex flex-col items-center gap-4'>
            <p className='text-gray-700'>
              Looking good. Make any edits you want, then submit your profile. You can make more changes after it's
              live.
            </p>
            <Button
              onClick={handleSubmitProfile}
              disabled={isSubmitting}
              className='bg-[#149A9B] hover:bg-teal-700 text-white py-2 px-6 rounded-full w-full sm:w-auto'
            >
              {isSubmitting ? 'Submitting...' : 'Submit profile'}
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 space-y-6'>
            <div className='bg-white shadow rounded-lg p-6 flex justify-between items-start'>
              <div>
                <h3 className='text-xl font-semibold'>{userData.jobCategory}</h3>
                <p className='text-gray-700 mt-4'>{userData.bio}</p>
                <div className='flex items-center gap-4 mt-4'>
                  <div className='flex items-center shadow-md rounded-lg p-3 bg-gray-50'>
                    <span className='bg-gray-200 rounded-full p-2 mr-3'>
                      <FaEthereum />
                    </span>
                    <div>
                      <span className='font-semibold'>{userData.hourlyRate} ETH</span>
                      <p className='text-xs text-gray-500'>Hourly Rate</p>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant='ghost' size='icon'>
                <Edit size={16} />
              </Button>
            </div>
            <div className='bg-white shadow rounded-lg p-6'>
              <h3 className='text-lg font-semibold mb-4'>Work Experience</h3>
              <div className='space-y-4'>
                {userData.workExperience?.map((exp) => (
                  <div key={exp.id} className='border-b pb-4 last:border-b-0'>
                    <h4 className='font-medium'>
                      {exp.title} at {exp.company}
                    </h4>
                    <p className='text-sm text-gray-500'>
                      {formatDate(exp.startDateMonth, exp.startDateYear)} -{' '}
                      {exp.currentlyWorking ? 'Present' : formatDate(exp.endDateMonth, exp.endDateYear)}
                    </p>
                    <p className='text-gray-700 mt-2'>{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className='bg-white shadow rounded-lg p-6'>
              <h3 className='text-lg font-semibold mb-4'>Education</h3>
              <div className='space-y-4'>
                {userData.education?.map((edu) => (
                  <div key={edu.id} className='border-b pb-4 last:border-b-0'>
                    <h4 className='font-medium'>{edu.university}</h4>
                    <p className='text-sm'>
                      {edu.degree}, {edu.fieldOfStudy}
                    </p>
                    <p className='text-sm text-gray-500'>
                      {edu.startYear} - {edu.endYear}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            <div className='bg-white shadow rounded-lg p-6'>
              <div className='flex gap-4 items-center'>
                <div className='h-16 w-16 rounded-full bg-gray-200 overflow-hidden relative'>
                  {userData.profilePicture ? (
                    <Image
                      src={userData.profilePicture || '/placeholder.svg'}
                      alt='Profile'
                      layout='fill'
                      objectFit='cover'
                    />
                  ) : (
                    <div className='h-full w-full bg-gray-300' />
                  )}
                </div>
                <div>
                  <h2 className='text-lg font-semibold'>{userData.name || 'Your Name'}</h2>
                  <p className='text-gray-500 text-sm flex items-center'>
                    {userData.profileDetails?.city}, {userData.profileDetails?.country}
                  </p>
                </div>
              </div>
            </div>
            <div className='bg-white shadow rounded-lg p-6'>
              <h3 className='text-lg font-semibold mb-4'>Skills</h3>
              <div className='flex flex-wrap gap-2'>
                {userData.skills?.map((skill, index) => (
                  <span key={index} className='bg-gray-100 px-3 py-1 rounded-full text-sm border border-gray-200'>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className='bg-white shadow rounded-lg p-6'>
              <h3 className='text-lg font-semibold mb-4'>Languages</h3>
              <div className='space-y-2'>
                {userData.languages?.map((lang) => (
                  <div key={lang.id}>
                    <span className='font-medium'>{lang.name}: </span>
                    <span className='text-gray-500'>{lang.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className='mt-8 w-full border-t border-gray-200 pt-4 flex items-center justify-between'>
          <Button variant='ghost' className='flex items-center text-gray-600 px-4 py-2' onClick={prevStep}>
            <ChevronLeft size={16} className='mr-2' /> Back
          </Button>
          <Button
            onClick={handleSubmitProfile}
            disabled={isSubmitting}
            className='flex items-center bg-[#149A9B] hover:bg-teal-700 text-white px-6 py-2 rounded-full'
          >
            {isSubmitting ? 'Submitting...' : 'Submit your profile'}
          </Button>
        </div>
      </div>
    </div>
  )
}

