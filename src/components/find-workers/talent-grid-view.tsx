'use client'

import { motion } from 'framer-motion'
import TalentCard from '@/components/find-workers/talent-card'
import { FreelancerDisplay } from '@/types/service.types'

interface TalentGridViewProps {
  services: FreelancerDisplay[]
  selectedFreelancers: string[]
  toggleFreelancerSelection: (id: string) => void
  openFreelancerDetail: (freelancer: FreelancerDisplay) => void
  isLoading?: boolean
}

export default function TalentGridView({
  services,
  selectedFreelancers,
  toggleFreelancerSelection,
  openFreelancerDetail,
  isLoading = false,
}: TalentGridViewProps) {
  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className='animate-pulse'>
            <div className='bg-gray-200 h-64 rounded-lg'></div>
          </div>
        ))}
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className='text-center py-12'>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>No services found</h3>
        <p className='text-gray-500'>Try adjusting your search criteria or filters.</p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {services.map((service) => (
        <motion.div
          key={service.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TalentCard
            freelancer={{
              id: service.id,
              name: service.name,
              title: service.title,
              avatar: '',
              rating: service.rating,
              reviewCount: service.reviewCount,
              hourlyRate: service.hourlyRate,
              totalEarned: 0, // Not available in service data
              skills: service.skills,
              location: service.location,
              availability: 'Full-time', // Default value
              experience: '3+ years', // Default value
              isOnline: true, // Default value
              isVerified: true, // Default value
              isTopRated: service.rating >= 4.5,
            }}
            isSelected={selectedFreelancers.includes(service.id)}
            onToggleSelect={() => toggleFreelancerSelection(service.id)}
            onViewProfile={() => openFreelancerDetail(service)}
          />
        </motion.div>
      ))}
    </div>
  )
}

