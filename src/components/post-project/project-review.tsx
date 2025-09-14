'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileText, DollarSign, Clock, Tag, Users, Briefcase, Eye, AlertCircle, Edit } from 'lucide-react'

interface ProjectReviewProps {
  projectData: any
}

export default function ProjectReview({ projectData }: ProjectReviewProps) {
  const getCategoryName = (id: string) => {
    const categories: Record<string, string> = {
      'web-dev': 'Web Development',
      'mobile-dev': 'Mobile Development',
      design: 'Design',
      writing: 'Writing & Translation',
      marketing: 'Marketing',
      video: 'Video & Animation',
      admin: 'Admin Support',
      other: 'Other',
    }
    return categories[id] || id
  }

  const getSubcategoryName = (categoryId: string, subcategoryId: string) => {
    const subcategories: Record<string, Record<string, string>> = {
      'web-dev': {
        frontend: 'Frontend Development',
        backend: 'Backend Development',
        fullstack: 'Full Stack Development',
        cms: 'CMS Development',
        ecommerce: 'E-commerce Development',
      },
      'mobile-dev': {
        ios: 'iOS Development',
        android: 'Android Development',
        'cross-platform': 'Cross-Platform Development',
        flutter: 'Flutter',
        'react-native': 'React Native',
      },
      design: {
        'ui-ux': 'UI/UX Design',
        graphic: 'Graphic Design',
        logo: 'Logo Design',
        illustration: 'Illustration',
        'product-design': 'Product Design',
      },
    }
    return subcategories[categoryId]?.[subcategoryId] || subcategoryId
  }

  const getExperienceLevelName = (id: string) => {
    const levels: Record<string, string> = {
      entry: 'Entry Level',
      intermediate: 'Intermediate',
      expert: 'Expert',
    }
    return levels[id] || id
  }

  const getDurationName = (id: string) => {
    const durations: Record<string, string> = {
      'less-than-1-week': 'Less than 1 week',
      '1-2-weeks': '1-2 weeks',
      '2-4-weeks': '2-4 weeks',
      '1-3-months': '1-3 months',
      '3-6-months': '3-6 months',
      'more-than-6-months': 'More than 6 months',
    }
    return durations[id] || id
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div variants={container} initial='hidden' animate='show' className='space-y-6'>
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle>Review Your Project</CardTitle>
            <CardDescription>Review all the details of your project before posting</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='space-y-4'>
              <div className='flex justify-between items-start'>
                <h3 className='text-xl font-bold text-[#002333]'>{projectData.title || 'Untitled Project'}</h3>
                <Button variant='ghost' size='sm' className='text-[#15949C]'>
                  <Edit className='h-4 w-4 mr-2' />
                  Edit
                </Button>
              </div>

              <div className='flex flex-wrap gap-2'>
                {projectData.category && (
                  <Badge className='bg-[#DEEFE7] text-[#002333]'>{getCategoryName(projectData.category)}</Badge>
                )}
                {projectData.subcategory && (
                  <Badge className='bg-[#DEEFE7] text-[#002333]'>
                    {getSubcategoryName(projectData.category, projectData.subcategory)}
                  </Badge>
                )}
                <Badge className='bg-blue-100 text-blue-800'>
                  {projectData.projectType === 'one-time' ? 'One-time Project' : 'Ongoing Project'}
                </Badge>
                <Badge className='bg-purple-100 text-purple-800'>
                  {projectData.visibility === 'public' ? 'Public' : 'Private'}
                </Badge>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <p className='text-[#002333]/80 whitespace-pre-line'>
                  {projectData.description || 'No description provided.'}
                </p>
              </div>
            </div>

            <Separator />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h4 className='font-medium text-[#002333] mb-3 flex items-center'>
                  <Tag className='h-4 w-4 mr-2 text-[#15949C]' />
                  Skills Required
                </h4>
                <div className='flex flex-wrap gap-2'>
                  {projectData.skills.length > 0 ? (
                    projectData.skills.map((skill: string) => (
                      <Badge key={skill} variant='outline'>
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className='text-sm text-[#002333]/70'>No skills specified</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className='font-medium text-[#002333] mb-3 flex items-center'>
                  <Users className='h-4 w-4 mr-2 text-[#15949C]' />
                  Experience Level
                </h4>
                <p className='text-[#002333]/80'>
                  {projectData.experienceLevel ? getExperienceLevelName(projectData.experienceLevel) : 'Not specified'}
                </p>
              </div>
            </div>

            <Separator />

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div>
                <h4 className='font-medium text-[#002333] mb-3 flex items-center'>
                  <DollarSign className='h-4 w-4 mr-2 text-[#15949C]' />
                  Budget
                </h4>
                <div className='space-y-1'>
                  <p className='text-lg font-bold text-[#002333]'>${projectData.budgetAmount?.toFixed(2) || '0.00'}</p>
                  <p className='text-sm text-[#002333]/70'>
                    {projectData.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className='font-medium text-[#002333] mb-3 flex items-center'>
                  <Clock className='h-4 w-4 mr-2 text-[#15949C]' />
                  Duration
                </h4>
                <p className='text-[#002333]/80'>
                  {projectData.duration ? getDurationName(projectData.duration) : 'Not specified'}
                </p>
              </div>

              <div>
                <h4 className='font-medium text-[#002333] mb-3 flex items-center'>
                  <Briefcase className='h-4 w-4 mr-2 text-[#15949C]' />
                  Project Type
                </h4>
                <p className='text-[#002333]/80'>
                  {projectData.projectType === 'one-time' ? 'One-time Project' : 'Ongoing Project'}
                </p>
              </div>
            </div>

            {projectData.milestones.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className='font-medium text-[#002333] mb-3'>Project Milestones</h4>
                  <div className='space-y-3'>
                    {projectData.milestones.map((milestone: any) => (
                      <div key={milestone.id} className='flex justify-between p-3 bg-gray-50 rounded-lg'>
                        <p className='font-medium text-[#002333]'>{milestone.title}</p>
                        <p className='font-medium text-[#002333]'>${milestone.amount.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {projectData.attachments.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className='font-medium text-[#002333] mb-3 flex items-center'>
                    <FileText className='h-4 w-4 mr-2 text-[#15949C]' />
                    Attachments
                  </h4>
                  <div className='space-y-2'>
                    {projectData.attachments.map((file: any) => (
                      <div key={file.id} className='flex items-center p-2 bg-gray-50 rounded-lg'>
                        <FileText className='h-4 w-4 mr-2 text-gray-500' />
                        <p className='text-sm text-[#002333]'>{file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className='bg-[#DEEFE7]/30 p-4 rounded-lg'>
              <h4 className='font-medium text-[#002333] mb-2 flex items-center'>
                <Eye className='h-4 w-4 mr-2 text-[#15949C]' />
                Project Visibility
              </h4>
              <p className='text-sm text-[#002333]/80'>
                {projectData.visibility === 'public'
                  ? 'Your project will be visible to all freelancers who can send proposals.'
                  : 'Your project will only be visible to freelancers you specifically invite.'}
              </p>
            </div>

            <Alert className='bg-[#DEEFE7]/30 border-[#15949C]'>
              <AlertCircle className='h-4 w-4 text-[#15949C]' />
              <AlertDescription className='text-[#002333]/70'>
                Once posted, your project will be live and freelancers can start submitting proposals. You can edit your
                project details after posting if needed.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

