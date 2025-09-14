'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, Heart, MessageSquare, Check, Award } from 'lucide-react'

// Sample featured freelancers
const featuredFreelancers = [
  {
    id: 'f1',
    name: 'Alex Johnson',
    title: 'Full Stack Developer',
    avatar: '',
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 65,
    skills: ['React', 'Node.js', 'TypeScript'],
    location: 'San Francisco, USA',
    featured: 'Top Rated Plus',
    isVerified: true,
  },
  {
    id: 'f6',
    name: 'Olivia Patel',
    title: 'Graphic Designer',
    avatar: '',
    rating: 4.8,
    reviewCount: 89,
    hourlyRate: 50,
    skills: ['Photoshop', 'Illustrator', 'Branding'],
    location: 'Mumbai, India',
    featured: 'Rising Talent',
    isVerified: true,
  },
  {
    id: 'f4',
    name: 'Emily Rodriguez',
    title: 'Content Writer & SEO Specialist',
    avatar: '',
    rating: 4.9,
    reviewCount: 112,
    hourlyRate: 45,
    skills: ['Content Writing', 'SEO', 'Copywriting'],
    location: 'Madrid, Spain',
    featured: 'Top Rated',
    isVerified: true,
  },
  {
    id: 'f7',
    name: 'James Wilson',
    title: 'Data Scientist',
    avatar: '',
    rating: 4.7,
    reviewCount: 72,
    hourlyRate: 75,
    skills: ['Python', 'Machine Learning', 'Data Analysis'],
    location: 'Berlin, Germany',
    featured: 'Expert Vetted',
    isVerified: true,
  },
]

interface TalentFeaturedProps {
  selectedFreelancers: string[]
  toggleFreelancerSelection: (id: string) => void
  openFreelancerDetail: (freelancer: any) => void
}

export default function TalentFeatured({
  selectedFreelancers,
  toggleFreelancerSelection,
  openFreelancerDetail,
}: TalentFeaturedProps) {
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      {featuredFreelancers.map((freelancer) => (
        <motion.div
          key={freelancer.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className='overflow-hidden'>
            <CardContent className='p-0'>
              <div className='relative h-24 bg-gradient-to-r from-[#002333] to-[#15949C] flex items-center justify-center'>
                <div className='absolute top-4 right-4'>
                  <Badge className='bg-yellow-400/90 text-[#002333] font-medium'>
                    <Award className='h-3 w-3 mr-1' />
                    {freelancer.featured}
                  </Badge>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className={`absolute top-4 left-4 h-8 w-8 rounded-full ${
                    selectedFreelancers.includes(freelancer.id)
                      ? 'bg-[#15949C] text-white'
                      : 'bg-white/80 text-[#002333]'
                  }`}
                  onClick={() => toggleFreelancerSelection(freelancer.id)}
                >
                  {selectedFreelancers.includes(freelancer.id) ? (
                    <Check className='h-4 w-4' />
                  ) : (
                    <Heart className='h-4 w-4' />
                  )}
                </Button>
                <div className='absolute -bottom-12'>
                  <Avatar className='h-24 w-24 border-4 border-white'>
                    <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
                    <AvatarFallback className='bg-[#15949C]/20 text-[#15949C] text-xl'>
                      {freelancer.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className='pt-16 p-6 text-center'>
                <h3 className='font-bold text-lg text-[#002333]'>{freelancer.name}</h3>
                <p className='text-[#002333]/70 mt-1'>{freelancer.title}</p>

                <div className='flex justify-center mt-2'>
                  <div className='flex mr-2'>{renderStars(freelancer.rating)}</div>
                  <span className='text-[#002333] font-medium'>{freelancer.rating}</span>
                  <span className='text-[#002333]/70 ml-1'>({freelancer.reviewCount})</span>
                </div>

                <p className='font-bold text-[#002333] mt-3'>${freelancer.hourlyRate}/hr</p>

                <div className='flex flex-wrap justify-center gap-2 mt-4'>
                  {freelancer.skills.map((skill) => (
                    <Badge key={skill} variant='outline'>
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className='mt-6 flex gap-2'>
                  <Button
                    className='flex-1 bg-[#15949C] hover:bg-[#15949C]/90'
                    onClick={() => openFreelancerDetail(freelancer)}
                  >
                    View Profile
                  </Button>
                  <Button variant='outline' size='icon' className='border-[#15949C] text-[#15949C]'>
                    <MessageSquare className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

