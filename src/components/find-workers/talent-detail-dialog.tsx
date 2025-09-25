'use client'

import { useState } from 'react'
import Image from 'next/image'
import { VALIDATION_LIMITS } from '@/constants/magic-numbers'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Star, Heart, MessageSquare, Check, MapPin, Clock, Briefcase, Globe, Award, X } from 'lucide-react'
import { useReviewsApi } from '@/hooks/api-connections/use-reviews-api'

interface TalentDetailDialogProps {
  freelancer: any
  onClose: () => void
  isSelected: boolean
  onToggleSelect: () => void
}

export default function TalentDetailDialog({
  freelancer,
  onClose,
  isSelected,
  onToggleSelect,
}: TalentDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('overview')

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

  // Fetch real reviews data
  const { useUserReviews, computeAverage } = useReviewsApi();
  const { data: reviews = [], isLoading: reviewsLoading, error: reviewsError } = useUserReviews(freelancer.id || '');
  
  const averageRating = computeAverage(reviews);

  // Sample portfolio data
  const portfolio = [
    {
      id: 1,
      title: 'E-commerce Platform',
      description:
        'Built a full-stack e-commerce solution with React, Node.js, and MongoDB. Implemented payment processing, inventory management, and user authentication.',
      image: '/placeholder.svg?height=200&width=300',
      skills: ['React', 'Node.js', 'MongoDB', 'Stripe API'],
    },
    {
      id: 2,
      title: 'Social Media Dashboard',
      description:
        'Developed an analytics dashboard for social media management with real-time data visualization and reporting features.',
      image: '/placeholder.svg?height=200&width=300',
      skills: ['TypeScript', 'D3.js', 'Firebase', 'Material UI'],
    },
    {
      id: 3,
      title: 'Mobile Fitness App',
      description:
        'Created a cross-platform fitness tracking application with workout plans, progress tracking, and social features.',
      image: '/placeholder.svg?height=200&width=300',
      skills: ['React Native', 'Redux', 'Firebase', 'Health API'],
    },
  ]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] p-0'>
        <div className='flex flex-col h-full'>
          {/* Header */}
          <div className='relative h-40 bg-gradient-to-r from-[#002333] to-[#15949C]'>
            <Button
              variant='ghost'
              size='icon'
              className='absolute top-4 right-4 h-8 w-8 bg-white/20 hover:bg-white/30 text-white'
              onClick={onClose}
            >
              <X className='h-4 w-4' />
            </Button>

            <div className='absolute -bottom-16 left-6'>
              <Avatar className='h-32 w-32 border-4 border-white'>
                <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
                <AvatarFallback className='bg-[#15949C]/20 text-[#15949C] text-3xl'>
                  {freelancer.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className='pt-20 px-6 pb-6'>
            <div className='flex flex-col md:flex-row md:items-start justify-between gap-4'>
              <div>
                <div className='flex items-center gap-2'>
                  <h2 className='text-2xl font-bold text-[#002333]'>{freelancer.name}</h2>
                  {freelancer.isVerified && <Badge className='bg-blue-100 text-blue-800'>Verified</Badge>}
                  {freelancer.isTopRated && <Badge className='bg-yellow-100 text-yellow-800'>Top Rated</Badge>}
                </div>

                <p className='text-[#002333]/70 mt-1'>{freelancer.title}</p>

                <div className='flex items-center mt-2'>
                  <div className='flex mr-2'>{renderStars(freelancer.rating)}</div>
                  <span className='text-[#002333] font-medium'>{averageRating > 0 ? averageRating : freelancer.rating}</span>
                  <span className='text-[#002333]/70 ml-1'>({reviews.length > 0 ? reviews.length : freelancer.reviewCount} reviews)</span>
                </div>

                <div className='flex flex-wrap gap-4 mt-2 text-sm text-[#002333]/70'>
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
              </div>

              <div className='flex flex-col items-end'>
                <div className='text-[#002333] font-bold text-2xl'>${freelancer.hourlyRate}/hr</div>
                <div className='text-[#002333]/70 text-sm'>
                  {freelancer.totalEarned ? `$${freelancer.totalEarned.toLocaleString()}+ earned` : 'New freelancer'}
                </div>

                <div className='flex gap-2 mt-4'>
                  <Button
                    variant={isSelected ? 'default' : 'outline'}
                    className={isSelected ? 'bg-[#15949C] hover:bg-[#15949C]/90' : 'border-[#15949C] text-[#15949C]'}
                    onClick={onToggleSelect}
                  >
                    {isSelected ? (
                      <>
                        <Check className='h-4 w-4 mr-2' />
                        Selected
                      </>
                    ) : (
                      <>
                        <Heart className='h-4 w-4 mr-2' />
                        Select
                      </>
                    )}
                  </Button>
                  <Button className='bg-[#15949C] hover:bg-[#15949C]/90'>
                    <MessageSquare className='h-4 w-4 mr-2' />
                    Contact
                  </Button>
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className='mt-6'>
              <TabsList className='grid grid-cols-4 w-full'>
                <TabsTrigger value='overview'>Overview</TabsTrigger>
                <TabsTrigger value='portfolio'>Portfolio</TabsTrigger>
                <TabsTrigger value='reviews'>Reviews</TabsTrigger>
                <TabsTrigger value='skills'>Skills & Experience</TabsTrigger>
              </TabsList>

              <ScrollArea className='h-[calc(90vh-300px)] mt-6'>
                <TabsContent value='overview' className='space-y-6'>
                  <div>
                    <h3 className='font-medium text-lg text-[#002333] mb-3'>About</h3>
                    <p className='text-[#002333]/80'>
                      {freelancer.description ||
                        `${freelancer.name} is a highly skilled ${freelancer.title} with ${freelancer.experience} of experience. Specializing in ${freelancer.skills.slice(0, VALIDATION_LIMITS.MAX_TECHNOLOGIES_DISPLAY).join(', ')}, and more, they have successfully completed numerous projects and maintained an excellent rating of ${freelancer.rating}.`}
                    </p>
                  </div>

                  <Separator />

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <h3 className='font-medium text-lg text-[#002333] mb-3'>Performance</h3>
                      <div className='space-y-4'>
                        <div>
                          <div className='flex justify-between mb-1'>
                            <p className='text-sm text-[#002333]/70'>Job Completion</p>
                            <p className='text-sm font-medium text-[#002333]'>98%</p>
                          </div>
                          <Progress value={98} className='h-2' />
                        </div>
                        <div>
                          <div className='flex justify-between mb-1'>
                            <p className='text-sm text-[#002333]/70'>On-Time Delivery</p>
                            <p className='text-sm font-medium text-[#002333]'>100%</p>
                          </div>
                          <Progress value={100} className='h-2' />
                        </div>
                        <div>
                          <div className='flex justify-between mb-1'>
                            <p className='text-sm text-[#002333]/70'>On-Budget</p>
                            <p className='text-sm font-medium text-[#002333]'>95%</p>
                          </div>
                          <Progress value={95} className='h-2' />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className='font-medium text-lg text-[#002333] mb-3'>Languages & Education</h3>
                      <div className='space-y-4'>
                        <div>
                          <p className='text-sm text-[#002333]/70 mb-1'>Languages</p>
                          <div className='space-y-2'>
                            <div className='flex items-center'>
                              <Globe className='h-4 w-4 mr-2 text-[#15949C]' />
                              <span className='text-[#002333]'>English (Native)</span>
                            </div>
                            <div className='flex items-center'>
                              <Globe className='h-4 w-4 mr-2 text-[#15949C]' />
                              <span className='text-[#002333]'>Spanish (Conversational)</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className='text-sm text-[#002333]/70 mb-1'>Education</p>
                          <div className='flex items-start'>
                            <Award className='h-4 w-4 mr-2 text-[#15949C] mt-1' />
                            <div>
                              <p className='text-[#002333]'>BS Computer Science</p>
                              <p className='text-sm text-[#002333]/70'>Stanford University, 2018</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className='font-medium text-lg text-[#002333] mb-3'>Skills</h3>
                    <div className='flex flex-wrap gap-2'>
                      {freelancer.skills.map((skill: string) => (
                        <Badge key={skill} className='bg-[#DEEFE7] text-[#002333]'>
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className='font-medium text-lg text-[#002333] mb-3'>Portfolio Highlights</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {portfolio.slice(0, VALIDATION_LIMITS.MAX_PORTFOLIO_ITEMS_DISPLAY).map((item) => (
                        <div key={item.id} className='border rounded-lg overflow-hidden'>
                          <div className='h-40 bg-gray-100 flex items-center justify-center'>
                            <Image
                              src={item.image || '/placeholder.svg'}
                              alt={item.title}
                              width={400}
                              height={160}
                              className='w-full h-full object-cover'
                            />
                          </div>
                          <div className='p-4'>
                            <h4 className='font-medium text-[#002333]'>{item.title}</h4>
                            <p className='text-sm text-[#002333]/70 line-clamp-2 mt-1'>{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant='link'
                      className='mt-2 text-[#15949C] p-0'
                      onClick={() => setActiveTab('portfolio')}
                    >
                      View all portfolio items
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value='portfolio' className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {portfolio.map((item) => (
                      <div key={item.id} className='border rounded-lg overflow-hidden'>
                        <div className='h-48 bg-gray-100 flex items-center justify-center'>
                          <Image
                            src={item.image || '/placeholder.svg'}
                            alt={item.title}
                            width={500}
                            height={192}
                            className='w-full h-full object-cover'
                          />
                        </div>
                        <div className='p-4'>
                          <h4 className='font-medium text-[#002333]'>{item.title}</h4>
                          <p className='text-sm text-[#002333]/70 mt-2'>{item.description}</p>
                          <div className='flex flex-wrap gap-2 mt-3'>
                            {item.skills.map((skill) => (
                              <Badge key={skill} variant='outline'>
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value='reviews' className='space-y-6'>
                  <div className='flex items-center justify-between'>
                    <h3 className='font-medium text-lg text-[#002333]'>Client Reviews</h3>
                    <div className='flex items-center'>
                      <div className='flex mr-2'>{renderStars(freelancer.rating)}</div>
                      <span className='text-[#002333] font-medium'>{averageRating > 0 ? averageRating : freelancer.rating}</span>
                      <span className='text-[#002333]/70 ml-1'>({reviews.length > 0 ? reviews.length : freelancer.reviewCount} reviews)</span>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    {reviewsLoading ? (
                      <div className='space-y-4'>
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className='border rounded-lg p-4 animate-pulse'>
                            <div className='flex justify-between'>
                              <div>
                                <div className='h-4 bg-gray-300 rounded w-24 mb-2'></div>
                                <div className='h-3 bg-gray-300 rounded w-32'></div>
                              </div>
                              <div className='flex items-center'>
                                <div className='h-4 bg-gray-300 rounded w-16 mr-2'></div>
                                <div className='h-3 bg-gray-300 rounded w-20'></div>
                              </div>
                            </div>
                            <div className='h-12 bg-gray-300 rounded w-full mt-2'></div>
                          </div>
                        ))}
                      </div>
                    ) : reviewsError ? (
                      <div className='text-center py-8'>
                        <p className='text-red-600 mb-2'>Failed to load reviews</p>
                        <p className='text-gray-500 text-sm'>{reviewsError}</p>
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className='text-center py-8'>
                        <p className='text-gray-500'>No reviews yet</p>
                        <p className='text-gray-400 text-sm'>Be the first to leave a review!</p>
                      </div>
                    ) : (
                      reviews.map((review) => {
                        const reviewDate = new Date(review.created_at);
                        const now = new Date();
                        const diffInMs = now.getTime() - reviewDate.getTime();
                        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
                        const timeAgo = diffInDays === 0 ? 'Today' : 
                          diffInDays === 1 ? '1 day ago' :
                          diffInDays < 30 ? `${diffInDays} days ago` :
                          diffInDays < 365 ? `${Math.floor(diffInDays / 30)} months ago` :
                          `${Math.floor(diffInDays / 365)} years ago`;
                        
                        return (
                          <div key={review.id} className='border rounded-lg p-4'>
                            <div className='flex justify-between'>
                              <div>
                                <p className='font-medium text-[#002333]'>Client Review</p>
                                <p className='text-sm text-[#002333]/70'>Contract: {review.contract_id.slice(-8)}</p>
                              </div>
                              <div className='flex items-center'>
                                <div className='flex mr-1'>{renderStars(review.rating)}</div>
                                <span className='text-[#002333]/70 text-sm'>{timeAgo}</span>
                              </div>
                            </div>
                            {review.comment && (
                              <p className='mt-2 text-[#002333]/80'>{review.comment}</p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </TabsContent>

                <TabsContent value='skills' className='space-y-6'>
                  <div>
                    <h3 className='font-medium text-lg text-[#002333] mb-3'>Skills</h3>
                    <div className='grid grid-cols-2 gap-4'>
                      {freelancer.skills.map((skill: string) => (
                        <div key={skill} className='flex items-center p-3 bg-gray-50 rounded-lg'>
                          <Check className='h-4 w-4 mr-2 text-green-500' />
                          <span className='text-[#002333]'>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className='font-medium text-lg text-[#002333] mb-3'>Experience</h3>
                    <div className='space-y-4'>
                      <div className='flex'>
                        <div className='h-10 w-10 rounded-full bg-[#DEEFE7] flex items-center justify-center mr-3 shrink-0 mt-1'>
                          <Briefcase className='h-5 w-5 text-[#15949C]' />
                        </div>
                        <div>
                          <p className='font-medium text-[#002333]'>Senior Developer</p>
                          <p className='text-[#002333]/70'>TechCorp Inc.</p>
                          <p className='text-sm text-[#002333]/70'>2020 - Present</p>
                          <p className='text-sm text-[#002333]/80 mt-2'>
                            Led development of multiple web and mobile applications, managing a team of 5 developers.
                          </p>
                        </div>
                      </div>

                      <div className='flex'>
                        <div className='h-10 w-10 rounded-full bg-[#DEEFE7] flex items-center justify-center mr-3 shrink-0 mt-1'>
                          <Briefcase className='h-5 w-5 text-[#15949C]' />
                        </div>
                        <div>
                          <p className='font-medium text-[#002333]'>Full Stack Developer</p>
                          <p className='text-[#002333]/70'>StartUp Solutions</p>
                          <p className='text-sm text-[#002333]/70'>2018 - 2020</p>
                          <p className='text-sm text-[#002333]/80 mt-2'>
                            Developed and maintained web applications using React, Node.js, and MongoDB.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className='font-medium text-lg text-[#002333] mb-3'>Certifications</h3>
                    <div className='space-y-3'>
                      <div className='flex items-start'>
                        <Award className='h-4 w-4 mr-2 text-[#15949C] mt-1' />
                        <div>
                          <p className='text-[#002333]'>AWS Certified Solutions Architect</p>
                          <p className='text-sm text-[#002333]/70'>Amazon Web Services, 2021</p>
                        </div>
                      </div>
                      <div className='flex items-start'>
                        <Award className='h-4 w-4 mr-2 text-[#15949C] mt-1' />
                        <div>
                          <p className='text-[#002333]'>Professional Scrum Master I</p>
                          <p className='text-sm text-[#002333]/70'>Scrum.org, 2020</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

