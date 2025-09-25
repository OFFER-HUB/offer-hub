'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code, Smartphone, PenTool, FileText, BarChart, Video, Database, Server, ChevronRight } from 'lucide-react'
import { VALIDATION_LIMITS } from '@/constants/magic-numbers'

export default function TalentCategories() {
  const categories = [
    {
      id: 'web-dev',
      name: 'Web Development',
      icon: <Code className='h-6 w-6 text-[#15949C]' />,
      count: 450,
      skills: ['React', 'JavaScript', 'Node.js', 'HTML/CSS', 'PHP'],
    },
    {
      id: 'mobile-dev',
      name: 'Mobile Development',
      icon: <Smartphone className='h-6 w-6 text-[#15949C]' />,
      count: 320,
      skills: ['React Native', 'Swift', 'Kotlin', 'Flutter', 'iOS'],
    },
    {
      id: 'design',
      name: 'Design',
      icon: <PenTool className='h-6 w-6 text-[#15949C]' />,
      count: 380,
      skills: ['UI/UX', 'Figma', 'Photoshop', 'Illustrator', 'Logo Design'],
    },
    {
      id: 'writing',
      name: 'Writing & Translation',
      icon: <FileText className='h-6 w-6 text-[#15949C]' />,
      count: 290,
      skills: ['Content Writing', 'Copywriting', 'Translation', 'Technical Writing'],
    },
    {
      id: 'marketing',
      name: 'Marketing',
      icon: <BarChart className='h-6 w-6 text-[#15949C]' />,
      count: 310,
      skills: ['Social Media', 'SEO', 'Email Marketing', 'Content Strategy'],
    },
    {
      id: 'video',
      name: 'Video & Animation',
      icon: <Video className='h-6 w-6 text-[#15949C]' />,
      count: 180,
      skills: ['Video Editing', 'Animation', 'Motion Graphics', '3D Modeling'],
    },
    {
      id: 'data',
      name: 'Data Science',
      icon: <Database className='h-6 w-6 text-[#15949C]' />,
      count: 210,
      skills: ['Python', 'Machine Learning', 'Data Analysis', 'SQL', 'Tableau'],
    },
    {
      id: 'devops',
      name: 'DevOps & Cloud',
      icon: <Server className='h-6 w-6 text-[#15949C]' />,
      count: 170,
      skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Azure'],
    },
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      {categories.map((category) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ y: -5 }}
        >
          <Card className='h-full cursor-pointer hover:shadow-md transition-all'>
            <CardContent className='p-6'>
              <div className='flex items-center mb-4'>
                <div className='h-12 w-12 rounded-full bg-[#DEEFE7] flex items-center justify-center mr-3'>
                  {category.icon}
                </div>
                <div>
                  <h3 className='font-bold text-[#002333]'>{category.name}</h3>
                  <p className='text-sm text-[#002333]/70'>{category.count} freelancers</p>
                </div>
              </div>

              <div className='flex flex-wrap gap-2 mb-4'>
                {category.skills.slice(0, VALIDATION_LIMITS.MAX_TECHNOLOGIES_DISPLAY).map((skill) => (
                  <Badge key={skill} variant='outline'>
                    {skill}
                  </Badge>
                ))}
                {category.skills.length > VALIDATION_LIMITS.MAX_TECHNOLOGIES_DISPLAY && <Badge variant='outline'>+{category.skills.length - VALIDATION_LIMITS.MAX_TECHNOLOGIES_DISPLAY} more</Badge>}
              </div>

              <div className='flex items-center text-[#15949C] text-sm font-medium'>
                Browse {category.name}
                <ChevronRight className='h-4 w-4 ml-1' />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

