'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react'
import type { ProfileStepProps, WorkExperience } from '@/app/types/freelancer-profile'
import AddWorkExperienceForm from '@/components/freelancer-profile/add-work-experience-form'
import Footer from '@/components/freelancer-profile/footer'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

function UserAddWorkExperienceActiveState({ userData, updateUserData, nextStep, prevStep }: ProfileStepProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null)

  const handleSaveExperience = (experience: WorkExperience) => {
    const experiences = userData.workExperience || []
    if (editingExperience) {
      // Update existing
      const updatedExperiences = experiences.map((exp) => (exp.id === editingExperience.id ? experience : exp))
      updateUserData({ workExperience: updatedExperiences })
    } else {
      // Add new
      const newExperience = { ...experience, id: Date.now().toString() }
      updateUserData({ workExperience: [...experiences, newExperience] })
    }
    setEditingExperience(null)
    setIsModalOpen(false)
  }

  const handleEdit = (exp: WorkExperience) => {
    setEditingExperience(exp)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    const updatedExperiences = (userData.workExperience || []).filter((exp) => exp.id !== id)
    updateUserData({ workExperience: updatedExperiences })
  }

  return (
    <div className='flex flex-col gap-y-8 w-full pt-8 pb-28'>
      <div className='gap-4 mx-auto px-4 w-full max-w-4xl'>
        <p className='text-neutral-500 font-semibold'>5/11</p>
        <h1 className='text-3xl font-semibold text-[#19213D] mt-2'>Share your work experience</h1>
        <p className='text-lg text-[#19213D] mt-2'>
          Freelancers who add their relevant work experiences win client trust. But if you’re just starting out, you can
          still create a great profile.
        </p>
        <hr className='my-6' />

        <div className='space-y-4'>
          {(userData.workExperience || []).map((exp) => (
            <div key={exp.id} className='border border-gray-300 rounded-lg p-4 bg-white'>
              <div className='flex justify-between items-start'>
                <div>
                  <h3 className='font-semibold text-lg'>{exp.title}</h3>
                  <p className='text-sm'>
                    {exp.company} | {exp.startDateMonth} {exp.startDateYear} -{' '}
                    {exp.currentlyWorking ? 'Present' : `${exp.endDateMonth} ${exp.endDateYear}`}
                  </p>
                  <p className='text-sm text-gray-500'>{exp.location}</p>
                  <p className='text-sm text-gray-600 mt-2'>{exp.description}</p>
                </div>
                <div className='flex gap-2'>
                  <Button variant='ghost' size='icon' onClick={() => handleEdit(exp)}>
                    <Edit className='h-4 w-4' />
                  </Button>
                  <Button variant='ghost' size='icon' onClick={() => handleDelete(exp.id)}>
                    <Trash2 className='h-4 w-4 text-red-500' />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingExperience(null)
                setIsModalOpen(true)
              }}
              className='mt-4 bg-[#149A9B] text-white flex items-center gap-2 rounded-full'
            >
              <Plus size={18} /> Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>{editingExperience ? 'Edit' : 'Add'} Work Experience</DialogTitle>
            </DialogHeader>
            <AddWorkExperienceForm addExperience={handleSaveExperience} initialData={editingExperience} />
          </DialogContent>
        </Dialog>
      </div>

      <Footer className='px-4 flex justify-between'>
        <div>
          <Button onClick={prevStep} variant='ghost' className='gap-1 rounded-full'>
            <ArrowLeft size={18} /> Back
          </Button>
        </div>
        <div className='space-x-4'>
          <Button
            onClick={nextStep}
            variant='outline'
            className='border-[#149A9B] text-[#149A9B] hover:text-[#149A9B] bg-transparent rounded-full md:min-w-36'
          >
            Skip for now
          </Button>
          <Button
            onClick={nextStep}
            className='gap-1 bg-[#149A9B] text-white rounded-full md:min-w-36'
            disabled={(userData.workExperience || []).length === 0}
          >
            Next, Add Education
          </Button>
        </div>
      </Footer>
    </div>
  )
}

export default UserAddWorkExperienceActiveState
