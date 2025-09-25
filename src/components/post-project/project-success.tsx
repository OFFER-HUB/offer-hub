'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Users, ArrowRight, Eye, Edit, Copy } from 'lucide-react'
import Link from 'next/link'

interface ProjectSuccessProps {
  projectData: any
}

export default function ProjectSuccess({ projectData }: ProjectSuccessProps) {
  // Generate a random project ID for demo purposes
  const projectId = `PRJ-${Math.floor(10000 + Math.random() * 90000)}`

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
      <motion.div variants={item} className='text-center mb-8'>
        <div className='inline-flex items-center justify-center h-24 w-24 rounded-full bg-[#DEEFE7] mb-6'>
          <CheckCircle className='h-12 w-12 text-[#15949C]' />
        </div>
        <h2 className='text-2xl font-bold text-[#002333] mb-2'>Project Posted Successfully!</h2>
        <p className='text-[#002333]/70 max-w-md mx-auto'>
          Your project has been posted and is now visible to freelancers. You'll start receiving proposals soon.
        </p>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Your project is now live with the following details</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex justify-between items-center'>
              <div>
                <p className='text-sm text-[#002333]/70'>Project ID</p>
                <p className='font-medium text-[#002333]'>{projectId}</p>
              </div>
              <Button variant='ghost' size='sm' className='h-8 text-[#15949C]'>
                <Copy className='h-4 w-4 mr-2' />
                Copy
              </Button>
            </div>

            <div>
              <p className='text-sm text-[#002333]/70'>Title</p>
              <p className='font-medium text-[#002333]'>{projectData.title || 'Untitled Project'}</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <p className='text-sm text-[#002333]/70'>Budget</p>
                <p className='font-medium text-[#002333]'>
                  ${projectData.budgetAmount?.toFixed(2) || '0.00'}
                  {projectData.budgetType === 'fixed' ? ' (Fixed)' : ' (Hourly)'}
                </p>
              </div>
              <div>
                <p className='text-sm text-[#002333]/70'>Duration</p>
                <p className='font-medium text-[#002333]'>{projectData.duration || 'Not specified'}</p>
              </div>
              <div>
                <p className='text-sm text-[#002333]/70'>Visibility</p>
                <p className='font-medium text-[#002333] capitalize'>{projectData.visibility}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className='flex flex-col sm:flex-row gap-4 border-t pt-6'>
            <Button className='w-full sm:w-auto bg-[#15949C] hover:bg-[#15949C]/90'>
              <Eye className='h-4 w-4 mr-2' />
              View Project
            </Button>
            <Button variant='outline' className='w-full sm:w-auto'>
              <Edit className='h-4 w-4 mr-2' />
              Edit Project
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.div variants={item} className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex'>
              <div className='h-8 w-8 rounded-full bg-[#DEEFE7] flex items-center justify-center mr-3 shrink-0'>
                <span className='font-medium text-[#15949C]'>1</span>
              </div>
              <div>
                <p className='font-medium text-[#002333]'>Review Proposals</p>
                <p className='text-sm text-[#002333]/70'>
                  Freelancers will start sending proposals. Review them and respond to the ones you like.
                </p>
              </div>
            </div>

            <div className='flex'>
              <div className='h-8 w-8 rounded-full bg-[#DEEFE7] flex items-center justify-center mr-3 shrink-0'>
                <span className='font-medium text-[#15949C]'>2</span>
              </div>
              <div>
                <p className='font-medium text-[#002333]'>Interview Candidates</p>
                <p className='text-sm text-[#002333]/70'>
                  Chat with potential freelancers to discuss your project in more detail.
                </p>
              </div>
            </div>

            <div className='flex'>
              <div className='h-8 w-8 rounded-full bg-[#DEEFE7] flex items-center justify-center mr-3 shrink-0'>
                <span className='font-medium text-[#15949C]'>3</span>
              </div>
              <div>
                <p className='font-medium text-[#002333]'>Hire & Start Working</p>
                <p className='text-sm text-[#002333]/70'>
                  Select the best freelancer and begin working on your project.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Need More Help?</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex'>
              <div className='h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 shrink-0'>
                <Users className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='font-medium text-[#002333]'>Invite Freelancers</p>
                <p className='text-sm text-[#002333]/70'>Proactively invite skilled freelancers to your project.</p>
                <Button variant='link' className='h-8 px-0 text-blue-600'>
                  Find Freelancers
                  <ArrowRight className='h-4 w-4 ml-1' />
                </Button>
              </div>
            </div>

            <div className='flex'>
              <div className='h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3 shrink-0'>
                <svg className='h-5 w-5 text-purple-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
                  />
                </svg>
              </div>
              <div>
                <p className='font-medium text-[#002333]'>Get Support</p>
                <p className='text-sm text-[#002333]/70'>Our support team is here to help with any questions.</p>
                <Button variant='link' className='h-8 px-0 text-purple-600'>
                  Contact Support
                  <ArrowRight className='h-4 w-4 ml-1' />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className='flex justify-center mt-8'>
        <Link href='/' passHref>
          <Button variant='outline' className='mr-4'>
            Go to Dashboard
          </Button>
        </Link>
        <Button className='bg-[#15949C] hover:bg-[#15949C]/90'>Post Another Project</Button>
      </motion.div>
    </motion.div>
  )
}

