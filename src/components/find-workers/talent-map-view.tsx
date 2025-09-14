'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, MapPin } from 'lucide-react'

// Sample freelancer data with coordinates
const freelancers = [
  {
    id: 'f1',
    name: 'Alex Johnson',
    title: 'Full Stack Developer',
    avatar: '',
    rating: 4.9,
    hourlyRate: 65,
    skills: ['React', 'Node.js', 'TypeScript'],
    location: 'San Francisco, USA',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    isTopRated: true,
  },
  {
    id: 'f2',
    name: 'Sarah Williams',
    title: 'UI/UX Designer',
    avatar: '',
    rating: 4.8,
    hourlyRate: 55,
    skills: ['Figma', 'Adobe XD', 'UI Design'],
    location: 'London, UK',
    coordinates: { lat: 51.5074, lng: -0.1278 },
    isTopRated: false,
  },
  {
    id: 'f3',
    name: 'Michael Chen',
    title: 'Mobile App Developer',
    avatar: '',
    rating: 4.7,
    hourlyRate: 60,
    skills: ['React Native', 'Swift', 'Kotlin'],
    location: 'Toronto, Canada',
    coordinates: { lat: 43.6532, lng: -79.3832 },
    isTopRated: false,
  },
  {
    id: 'f4',
    name: 'Emily Rodriguez',
    title: 'Content Writer & SEO Specialist',
    avatar: '',
    rating: 4.9,
    hourlyRate: 45,
    skills: ['Content Writing', 'SEO', 'Copywriting'],
    location: 'Madrid, Spain',
    coordinates: { lat: 40.4168, lng: -3.7038 },
    isTopRated: true,
  },
  {
    id: 'f5',
    name: 'David Kim',
    title: 'DevOps Engineer',
    avatar: '',
    rating: 4.6,
    hourlyRate: 70,
    skills: ['Docker', 'Kubernetes', 'AWS'],
    location: 'Seoul, South Korea',
    coordinates: { lat: 37.5665, lng: 126.978 },
    isTopRated: false,
  },
  {
    id: 'f6',
    name: 'Olivia Patel',
    title: 'Graphic Designer',
    avatar: '',
    rating: 4.8,
    hourlyRate: 50,
    skills: ['Photoshop', 'Illustrator', 'Branding'],
    location: 'Mumbai, India',
    coordinates: { lat: 19.076, lng: 72.8777 },
    isTopRated: true,
  },
]

interface TalentMapViewProps {
  selectedFreelancers: string[]
  toggleFreelancerSelection: (id: string) => void
  openFreelancerDetail: (freelancer: any) => void
}

export default function TalentMapView({
  selectedFreelancers,
  toggleFreelancerSelection,
  openFreelancerDetail,
}: TalentMapViewProps) {
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null)

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))
  }

  return (
    <div className='relative h-[600px] rounded-lg overflow-hidden border'>
      {/* This would be replaced with an actual map component in a real implementation */}
      <div className='absolute inset-0 bg-gray-100 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-[#002333]/70 mb-2'>World Map Visualization</p>
          <p className='text-sm text-[#002333]/50'>
            In a real implementation, this would be an interactive map showing freelancer locations
          </p>
        </div>

        {/* Simulated map markers */}
        {freelancers.map((freelancer) => {
          // These positions are just for demonstration
          const top = `${20 + Math.random() * 60}%`
          const left = `${20 + Math.random() * 60}%`

          return (
            <div key={freelancer.id} className='absolute' style={{ top, left }}>
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center cursor-pointer transition-all
                  ${selectedMarker === freelancer.id ? 'bg-[#15949C] scale-110' : 'bg-[#15949C]/70 hover:bg-[#15949C]'}
                  ${selectedFreelancers.includes(freelancer.id) ? 'ring-2 ring-white' : ''}
                `}
                onClick={() => setSelectedMarker(freelancer.id)}
              >
                <span className='text-white font-medium text-sm'>${freelancer.hourlyRate}</span>
              </div>

              {selectedMarker === freelancer.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='absolute z-10 w-64 -translate-x-1/2 translate-y-2'
                >
                  <Card className='shadow-lg'>
                    <CardContent className='p-4'>
                      <div className='flex items-start gap-3'>
                        <Avatar className='h-10 w-10'>
                          <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
                          <AvatarFallback className='bg-[#15949C]/20 text-[#15949C]'>
                            {freelancer.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>

                        <div className='flex-1'>
                          <div className='flex items-center justify-between'>
                            <h4 className='font-medium text-[#002333]'>{freelancer.name}</h4>
                            <span className='font-bold text-[#002333]'>${freelancer.hourlyRate}/hr</span>
                          </div>

                          <p className='text-xs text-[#002333]/70'>{freelancer.title}</p>

                          <div className='flex items-center mt-1'>
                            <div className='flex mr-1'>{renderStars(freelancer.rating)}</div>
                            <span className='text-xs text-[#002333]'>{freelancer.rating}</span>
                          </div>

                          <div className='flex items-center mt-1 text-xs text-[#002333]/70'>
                            <MapPin className='h-3 w-3 mr-1' />
                            {freelancer.location}
                          </div>

                          <div className='mt-2 flex flex-wrap gap-1'>
                            {freelancer.skills.map((skill) => (
                              <Badge key={skill} variant='outline' className='text-xs py-0'>
                                {skill}
                              </Badge>
                            ))}
                          </div>

                          <div className='mt-3 flex gap-2'>
                            <Button
                              size='sm'
                              className='flex-1 h-8 text-xs bg-[#15949C] hover:bg-[#15949C]/90'
                              onClick={() => openFreelancerDetail(freelancer)}
                            >
                              View Profile
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              className='h-8 text-xs'
                              onClick={() => toggleFreelancerSelection(freelancer.id)}
                            >
                              {selectedFreelancers.includes(freelancer.id) ? 'Selected' : 'Select'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

