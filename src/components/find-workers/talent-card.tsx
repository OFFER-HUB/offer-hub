'use client'

import { useState } from 'react'
import { VALIDATION_LIMITS } from '@/constants/magic-numbers'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, Heart, MessageSquare, Check, MapPin, Clock, Briefcase } from 'lucide-react'

interface TalentCardProps {
  freelancer: any
  isSelected: boolean
  onToggleSelect: () => void
  onViewProfile: () => void
  layout?: 'grid' | 'list'
}

export default function TalentCard({
  freelancer,
  isSelected,
  onToggleSelect,
  onViewProfile,
  layout = 'grid',
}: TalentCardProps) {
  const [isHovered, setIsHovered] = useState(false)

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

  if (layout === 'list') {
    return (
      <Card
        className={`overflow-hidden transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-[#15949C]' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className='p-0'>
          <div className='flex flex-col md:flex-row'>
            <div className='relative md:w-48 h-48 bg-[#DEEFE7]/30 flex items-center justify-center'>
              <Avatar className='h-24 w-24'>
                <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
                <AvatarFallback className='bg-[#15949C]/20 text-[#15949C] text-xl'>
                  {freelancer.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              {freelancer.isOnline && (
                <div className='absolute top-4 right-4 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white'></div>
              )}
              <Button
                variant='ghost'
                size='icon'
                className={`absolute top-4 left-4 h-8 w-8 rounded-full ${isSelected ? 'bg-[#15949C] text-white' : 'bg-white/80 text-[#002333]'}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleSelect()
                }}
              >
                {isSelected ? <Check className='h-4 w-4' /> : <Heart className='h-4 w-4' />}
              </Button>
            </div>

            <div className='flex-1 p-6'>
              <div className='flex flex-col md:flex-row md:items-start justify-between gap-4'>
                <div>
                  <div className='flex items-center gap-2'>
                    <h3 className='font-bold text-lg text-[#002333]'>{freelancer.name}</h3>
                    {freelancer.isVerified && <Badge className='bg-blue-100 text-blue-800'>Verified</Badge>}
                    {freelancer.isTopRated && <Badge className='bg-yellow-100 text-yellow-800'>Top Rated</Badge>}
                  </div>

                  <p className='text-[#002333]/70 mt-1'>{freelancer.title}</p>

                  <div className='flex items-center mt-2'>
                    <div className='flex mr-2'>{renderStars(freelancer.rating)}</div>
                    <span className='text-[#002333] font-medium'>{freelancer.rating.toFixed(1)}</span>
                    <span className='text-[#002333]/70 ml-1'>({freelancer.reviewCount})</span>
                  </div>
                </div>

                <div className='text-right'>
                  <div className='text-[#002333] font-bold'>${freelancer.hourlyRate}/hr</div>
                  <div className='text-[#002333]/70 text-sm'>
                    {freelancer.totalEarned ? `$${freelancer.totalEarned}+ earned` : 'New freelancer'}
                  </div>
                </div>
              </div>

              <div className='mt-4 flex flex-wrap gap-2'>
                {freelancer.skills.slice(0, VALIDATION_LIMITS.MAX_SKILLS_DISPLAY_CARD).map((skill: string) => (
                  <Badge key={skill} variant='outline'>
                    {skill}
                  </Badge>
                ))}
                {freelancer.skills.length > VALIDATION_LIMITS.MAX_SKILLS_DISPLAY_CARD && <Badge variant='outline'>+{freelancer.skills.length - VALIDATION_LIMITS.MAX_SKILLS_DISPLAY_CARD} more</Badge>}
              </div>

              <div className='mt-4 flex flex-wrap gap-4 text-sm text-[#002333]/70'>
                <div className='flex items-center'>
                  <MapPin className='h-4 w-4 mr-1' />
                  {freelancer.location}
                </div>
                <div className='flex items-center'>
                  <Clock className='h-4 w-4 mr-1' />
                  {freelancer.availability}
                </div>
                <div className='flex items-center'>
                  <Briefcase className='h-4 w-4 mr-1' />
                  {freelancer.experience}
                </div>
              </div>

              <div className='mt-4 flex flex-col xs:flex-row gap-2'>
                <Button className='bg-[#15949C] hover:bg-[#15949C]/90' onClick={onViewProfile}>
                  View Profile
                </Button>
                <Button variant='outline' className='border-[#15949C] text-[#15949C]'>
                  <MessageSquare className='h-4 w-4 mr-2' />
                  Contact
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`overflow-hidden transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-[#15949C]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className='p-0'>
        <div className='relative h-48 bg-[#DEEFE7]/30 flex items-center justify-center'>
          <Avatar className='h-24 w-24'>
            <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
            <AvatarFallback className='bg-[#15949C]/20 text-[#15949C] text-xl'>
              {freelancer.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          {freelancer.isOnline && (
            <div className='absolute top-4 right-4 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white'></div>
          )}
          <Button
            variant='ghost'
            size='icon'
            className={`absolute top-4 left-4 h-8 w-8 rounded-full ${isSelected ? 'bg-[#15949C] text-white' : 'bg-white/80 text-[#002333]'}`}
            onClick={(e) => {
              e.stopPropagation()
              onToggleSelect()
            }}
          >
            {isSelected ? <Check className='h-4 w-4' /> : <Heart className='h-4 w-4' />}
          </Button>
        </div>

        <div className='p-6'>
          <div className='flex items-start justify-between'>
            <div>
              <h3 className='font-bold text-lg text-[#002333]'>{freelancer.name}</h3>
              <p className='text-[#002333]/70 mt-1'>{freelancer.title}</p>
            </div>
            <div className='text-[#002333] font-bold'>${freelancer.hourlyRate}/hr</div>
          </div>

          <div className='flex items-center mt-2'>
            <div className='flex mr-2'>{renderStars(freelancer.rating)}</div>
            <span className='text-[#002333] font-medium'>{freelancer.rating.toFixed(1)}</span>
            <span className='text-[#002333]/70 ml-1'>({freelancer.reviewCount})</span>
          </div>

          <div className='mt-4 flex flex-wrap gap-1'>
            {freelancer.skills.slice(0, VALIDATION_LIMITS.MAX_SKILLS_DISPLAY_DETAIL).map((skill: string) => (
              <Badge key={skill} variant='outline'>
                {skill}
              </Badge>
            ))}
            {freelancer.skills.length > VALIDATION_LIMITS.MAX_SKILLS_DISPLAY_DETAIL && <Badge variant='outline'>+{freelancer.skills.length - VALIDATION_LIMITS.MAX_SKILLS_DISPLAY_DETAIL} more</Badge>}
          </div>

          <div className='mt-4 flex items-center text-sm text-[#002333]/70'>
            <MapPin className='h-4 w-4 mr-1' />
            {freelancer.location}
          </div>

          <div className='mt-4 flex gap-2'>
            <Button className='flex-1 bg-[#15949C] hover:bg-[#15949C]/90' onClick={onViewProfile}>
              View Profile
            </Button>
            <Button variant='outline' size='icon' className='border-[#15949C] text-[#15949C]'>
              <MessageSquare className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

