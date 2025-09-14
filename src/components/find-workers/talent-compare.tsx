'use client'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { X, Star, Check, Clock, MapPin, MessageSquare } from 'lucide-react'

// Sample freelancer data
const freelancersData = {
  f1: {
    id: 'f1',
    name: 'Alex Johnson',
    title: 'Full Stack Developer',
    avatar: '',
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 65,
    totalEarned: 25000,
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
    location: 'San Francisco, USA',
    availability: 'Full-time',
    experience: '5 years',
    languages: ['English (Native)', 'Spanish (Conversational)'],
    education: 'BS Computer Science, Stanford University',
    completionRate: 98,
    onTimeRate: 100,
    onBudgetRate: 95,
    responseTime: '< 1 hour',
    lastActive: '2 hours ago',
    isVerified: true,
    isTopRated: true,
    portfolio: [
      { title: 'E-commerce Platform', description: 'Built a full-stack e-commerce solution' },
      { title: 'Social Media Dashboard', description: 'Developed analytics dashboard for social media' },
    ],
  },
  f2: {
    id: 'f2',
    name: 'Sarah Williams',
    title: 'UI/UX Designer',
    avatar: '',
    rating: 4.8,
    reviewCount: 93,
    hourlyRate: 55,
    totalEarned: 18000,
    skills: ['Figma', 'Adobe XD', 'UI Design', 'Wireframing', 'Prototyping'],
    location: 'London, UK',
    availability: 'Part-time',
    experience: '4 years',
    languages: ['English (Native)', 'French (Fluent)'],
    education: 'MA Design, Royal College of Art',
    completionRate: 96,
    onTimeRate: 98,
    onBudgetRate: 100,
    responseTime: '< 2 hours',
    lastActive: '1 day ago',
    isVerified: true,
    isTopRated: false,
    portfolio: [
      { title: 'Mobile Banking App', description: 'Redesigned UI for a banking application' },
      { title: 'Travel Booking Platform', description: 'Created user experience for travel platform' },
    ],
  },
  f3: {
    id: 'f3',
    name: 'Michael Chen',
    title: 'Mobile App Developer',
    avatar: '',
    rating: 4.7,
    reviewCount: 78,
    hourlyRate: 60,
    totalEarned: 22000,
    skills: ['React Native', 'Swift', 'Kotlin', 'Firebase', 'App Store'],
    location: 'Toronto, Canada',
    availability: 'Full-time',
    experience: '3 years',
    languages: ['English (Fluent)', 'Chinese (Native)'],
    education: 'MS Computer Engineering, University of Toronto',
    completionRate: 94,
    onTimeRate: 92,
    onBudgetRate: 97,
    responseTime: '< 3 hours',
    lastActive: '3 hours ago',
    isVerified: true,
    isTopRated: false,
    portfolio: [
      { title: 'Fitness Tracking App', description: 'Developed cross-platform mobile fitness app' },
      { title: 'Food Delivery Service', description: 'Built native iOS and Android applications' },
    ],
  },
  f4: {
    id: 'f4',
    name: 'Emily Rodriguez',
    title: 'Content Writer & SEO Specialist',
    avatar: '',
    rating: 4.9,
    reviewCount: 112,
    hourlyRate: 45,
    totalEarned: 15000,
    skills: ['Content Writing', 'SEO', 'Copywriting', 'Blog Posts', 'Technical Writing'],
    location: 'Madrid, Spain',
    availability: 'Part-time',
    experience: '6 years',
    languages: ['English (Fluent)', 'Spanish (Native)'],
    education: 'BA English Literature, Universidad Complutense de Madrid',
    completionRate: 100,
    onTimeRate: 97,
    onBudgetRate: 99,
    responseTime: '< 1 hour',
    lastActive: '5 hours ago',
    isVerified: true,
    isTopRated: true,
    portfolio: [
      { title: 'Tech Blog Series', description: 'Wrote a series of technical blog posts' },
      { title: 'E-commerce Product Descriptions', description: 'Created SEO-optimized product content' },
    ],
  },
  f5: {
    id: 'f5',
    name: 'David Kim',
    title: 'DevOps Engineer',
    avatar: '',
    rating: 4.6,
    reviewCount: 64,
    hourlyRate: 70,
    totalEarned: 28000,
    skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform'],
    location: 'Seoul, South Korea',
    availability: 'Full-time',
    experience: '4 years',
    languages: ['English (Fluent)', 'Korean (Native)'],
    education: 'BS Computer Science, Seoul National University',
    completionRate: 92,
    onTimeRate: 95,
    onBudgetRate: 90,
    responseTime: '< 4 hours',
    lastActive: '1 day ago',
    isVerified: false,
    isTopRated: false,
    portfolio: [
      { title: 'Cloud Migration', description: 'Migrated on-premise infrastructure to AWS' },
      { title: 'CI/CD Pipeline', description: 'Implemented automated deployment pipeline' },
    ],
  },
  f6: {
    id: 'f6',
    name: 'Olivia Patel',
    title: 'Graphic Designer',
    avatar: '',
    rating: 4.8,
    reviewCount: 89,
    hourlyRate: 50,
    totalEarned: 16000,
    skills: ['Photoshop', 'Illustrator', 'Branding', 'Logo Design', 'Print Design'],
    location: 'Mumbai, India',
    availability: 'Full-time',
    experience: '5 years',
    languages: ['English (Fluent)', 'Hindi (Native)'],
    education: 'BFA Graphic Design, National Institute of Design',
    completionRate: 97,
    onTimeRate: 96,
    onBudgetRate: 98,
    responseTime: '< 2 hours',
    lastActive: '6 hours ago',
    isVerified: true,
    isTopRated: true,
    portfolio: [
      { title: 'Brand Identity', description: 'Created complete brand identity for startup' },
      { title: 'Marketing Materials', description: 'Designed print and digital marketing assets' },
    ],
  },
}

interface TalentCompareProps {
  selectedFreelancers: string[]
  onClose: () => void
  clearSelection: () => void
}

export default function TalentCompare({ selectedFreelancers, onClose, clearSelection }: TalentCompareProps) {
  const freelancers = selectedFreelancers.map((id) => freelancersData[id as keyof typeof freelancersData])

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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto p-0'>
        <div className='sticky top-0 bg-white z-10 p-6 border-b'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-bold text-[#002333]'>Compare Freelancers</h2>
            <div className='flex gap-2'>
              <Button variant='outline' size='sm' onClick={clearSelection} className='text-red-500 border-red-500'>
                Clear All
              </Button>
              <Button variant='ghost' size='icon' onClick={onClose}>
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>

        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* Basic Info */}
            <div className='md:col-span-3'>
              <h3 className='font-medium text-[#002333] mb-4'>Basic Information</h3>
              <div className='grid grid-cols-3 gap-6'>
                {freelancers.map((freelancer) => (
                  <div key={freelancer.id} className='text-center'>
                    <Avatar className='h-20 w-20 mx-auto mb-3'>
                      <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
                      <AvatarFallback className='bg-[#15949C]/20 text-[#15949C] text-xl'>
                        {freelancer.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <h4 className='font-bold text-lg text-[#002333]'>{freelancer.name}</h4>
                    <p className='text-[#002333]/70 mb-2'>{freelancer.title}</p>
                    <div className='flex justify-center mb-2'>
                      {renderStars(freelancer.rating)}
                      <span className='ml-1 text-[#002333]'>{freelancer.rating}</span>
                    </div>
                    <div className='flex justify-center gap-2'>
                      {freelancer.isVerified && <Badge className='bg-blue-100 text-blue-800'>Verified</Badge>}
                      {freelancer.isTopRated && <Badge className='bg-yellow-100 text-yellow-800'>Top Rated</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rates & Experience */}
            <div className='md:col-span-3'>
              <h3 className='font-medium text-[#002333] mb-4'>Rates & Experience</h3>
              <div className='grid grid-cols-3 gap-6'>
                {freelancers.map((freelancer) => (
                  <div key={`${freelancer.id}-rates`} className='space-y-4'>
                    <div>
                      <p className='text-sm text-[#002333]/70'>Hourly Rate</p>
                      <p className='font-bold text-xl text-[#002333]'>${freelancer.hourlyRate}/hr</p>
                    </div>
                    <div>
                      <p className='text-sm text-[#002333]/70'>Total Earned</p>
                      <p className='font-medium text-[#002333]'>${freelancer.totalEarned.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className='text-sm text-[#002333]/70'>Experience</p>
                      <p className='font-medium text-[#002333]'>{freelancer.experience}</p>
                    </div>
                    <div>
                      <p className='text-sm text-[#002333]/70'>Availability</p>
                      <div className='flex items-center'>
                        <Clock className='h-4 w-4 mr-1 text-[#15949C]' />
                        <p className='font-medium text-[#002333]'>{freelancer.availability}</p>
                      </div>
                    </div>
                    <div>
                      <p className='text-sm text-[#002333]/70'>Location</p>
                      <div className='flex items-center'>
                        <MapPin className='h-4 w-4 mr-1 text-[#15949C]' />
                        <p className='font-medium text-[#002333]'>{freelancer.location}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className='md:col-span-3' />

            {/* Skills */}
            <div className='md:col-span-3'>
              <h3 className='font-medium text-[#002333] mb-4'>Skills</h3>
              <div className='grid grid-cols-3 gap-6'>
                {freelancers.map((freelancer) => (
                  <div key={`${freelancer.id}-skills`} className='space-y-2'>
                    {freelancer.skills.map((skill) => (
                      <div key={skill} className='flex items-center'>
                        <Check className='h-4 w-4 mr-2 text-green-500' />
                        <span className='text-[#002333]'>{skill}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <Separator className='md:col-span-3' />

            {/* Performance Metrics */}
            <div className='md:col-span-3'>
              <h3 className='font-medium text-[#002333] mb-4'>Performance Metrics</h3>
              <div className='grid grid-cols-3 gap-6'>
                {freelancers.map((freelancer) => (
                  <div key={`${freelancer.id}-metrics`} className='space-y-4'>
                    <div>
                      <div className='flex justify-between mb-1'>
                        <p className='text-sm text-[#002333]/70'>Job Completion</p>
                        <p className='text-sm font-medium text-[#002333]'>{freelancer.completionRate}%</p>
                      </div>
                      <Progress value={freelancer.completionRate} className='h-2' />
                    </div>
                    <div>
                      <div className='flex justify-between mb-1'>
                        <p className='text-sm text-[#002333]/70'>On-Time Delivery</p>
                        <p className='text-sm font-medium text-[#002333]'>{freelancer.onTimeRate}%</p>
                      </div>
                      <Progress value={freelancer.onTimeRate} className='h-2' />
                    </div>
                    <div>
                      <div className='flex justify-between mb-1'>
                        <p className='text-sm text-[#002333]/70'>On-Budget</p>
                        <p className='text-sm font-medium text-[#002333]'>{freelancer.onBudgetRate}%</p>
                      </div>
                      <Progress value={freelancer.onBudgetRate} className='h-2' />
                    </div>
                    <div>
                      <p className='text-sm text-[#002333]/70'>Response Time</p>
                      <p className='font-medium text-[#002333]'>{freelancer.responseTime}</p>
                    </div>
                    <div>
                      <p className='text-sm text-[#002333]/70'>Last Active</p>
                      <p className='font-medium text-[#002333]'>{freelancer.lastActive}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className='md:col-span-3' />

            {/* Education & Languages */}
            <div className='md:col-span-3'>
              <h3 className='font-medium text-[#002333] mb-4'>Education & Languages</h3>
              <div className='grid grid-cols-3 gap-6'>
                {freelancers.map((freelancer) => (
                  <div key={`${freelancer.id}-education`} className='space-y-4'>
                    <div>
                      <p className='text-sm text-[#002333]/70'>Education</p>
                      <p className='font-medium text-[#002333]'>{freelancer.education}</p>
                    </div>
                    <div>
                      <p className='text-sm text-[#002333]/70'>Languages</p>
                      <div className='space-y-1'>
                        {freelancer.languages.map((language) => (
                          <p key={language} className='text-[#002333]'>
                            {language}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className='md:col-span-3' />

            {/* Portfolio */}
            <div className='md:col-span-3'>
              <h3 className='font-medium text-[#002333] mb-4'>Portfolio Highlights</h3>
              <div className='grid grid-cols-3 gap-6'>
                {freelancers.map((freelancer) => (
                  <div key={`${freelancer.id}-portfolio`} className='space-y-3'>
                    {freelancer.portfolio.map((item, index) => (
                      <div key={index} className='p-3 bg-gray-50 rounded-lg'>
                        <p className='font-medium text-[#002333]'>{item.title}</p>
                        <p className='text-sm text-[#002333]/70'>{item.description}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className='sticky bottom-0 bg-white z-10 p-6 border-t'>
          <div className='flex justify-between'>
            <Button variant='outline' onClick={onClose}>
              Close
            </Button>
            <div className='flex gap-2'>
              <Button className='bg-[#15949C] hover:bg-[#15949C]/90'>
                <MessageSquare className='h-4 w-4 mr-2' />
                Message Selected
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

