'use client'
import { useState } from 'react'
import type React from 'react'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react'
import Footer from '@/components/freelancer-profile/footer'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { ProfileStepProps, Education } from '@/app/types/freelancer-profile'

function UserAddEducationActiveState({ userData, updateUserData, nextStep, prevStep }: ProfileStepProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Omit<Education, 'id'>>({
    university: '',
    degree: '',
    fieldOfStudy: '',
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear(),
    location: '',
    description: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: name === 'startYear' || name === 'endYear' ? Number(value) : value }))
  }

  const openAddModal = () => {
    setEditingId(null)
    setFormData({
      university: '',
      degree: '',
      fieldOfStudy: '',
      startYear: new Date().getFullYear(),
      endYear: new Date().getFullYear(),
      location: '',
      description: '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (id: string) => {
    const itemToEdit = userData.education?.find((item) => item.id === id)
    if (itemToEdit) {
      setEditingId(id)
      setFormData(itemToEdit)
      setIsModalOpen(true)
    }
  }

  const saveEducation = () => {
    const currentEducation = userData.education || []
    if (editingId) {
      updateUserData({
        education: currentEducation.map((item) => (item.id === editingId ? { ...formData, id: editingId } : item)),
      })
    } else {
      const newId = Date.now().toString()
      updateUserData({ education: [...currentEducation, { ...formData, id: newId }] })
    }
    setIsModalOpen(false)
    setEditingId(null)
  }

  const deleteEducation = (id: string) => {
    updateUserData({ education: (userData.education || []).filter((item) => item.id !== id) })
  }

  return (
    <div className='flex flex-col gap-y-8 w-full pt-8 pb-28'>
      <div className='gap-4 mx-auto px-4 w-full max-w-4xl'>
        <p className='text-neutral-500 font-semibold'>6/11</p>
        <h1 className='text-3xl font-semibold text-[#19213D] mt-2'>
          Clients like to know what you know, add your education here.
        </h1>
        <p className='text-lg text-[#19213D] mt-2'>
          You don't have to have a degree. Adding any relevant education helps make your profile more visible.
        </p>
        <hr className='my-6' />
        <div className='mt-6'>
          <h2 className='text-xl mb-4 font-medium'>Your Education</h2>
          <div className='space-y-4'>
            {(userData.education || []).map((item) => (
              <div key={item.id} className='border border-[#6D758F] rounded-lg p-4 bg-white'>
                <div className='flex justify-between items-start'>
                  <div>
                    <h3 className='font-semibold'>{item.university}</h3>
                    <p className='text-sm'>
                      {item.degree} || {item.fieldOfStudy} || {item.startYear} - {item.endYear}
                    </p>
                    <p className='text-sm text-gray-500'>{item.location}</p>
                    <p className='text-sm text-gray-600 mt-2'>{item.description}</p>
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='text-xs flex items-center gap-1 rounded-full border-[#149A9B] text-[#149A9B] bg-transparent'
                      onClick={() => openEditModal(item.id)}
                    >
                      <Pencil size={14} /> Edit
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='text-xs flex items-center gap-1 rounded-full border-red-500 text-red-500 bg-transparent'
                      onClick={() => deleteEducation(item.id)}
                    >
                      <Trash2 size={14} /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={openAddModal} className='mt-4 bg-[#149A9B] text-white flex items-center gap-2 rounded-full'>
            <Plus size={18} /> Add Education
          </Button>
          <p
            className={cn(
              'text-xs text-gray-500 mt-2',
              (userData.education || []).length > 0 ? 'hidden' : 'block text-red-500 font-medium',
            )}
          >
            Add at least one item
          </p>
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Education' : 'Add Education'}</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-1 gap-3'>
              <div>
                <Label htmlFor='university'>University / Institution</Label>
                <Input
                  id='university'
                  name='university'
                  value={formData.university}
                  onChange={handleInputChange}
                  placeholder='e.g. Harvard University'
                />
              </div>
              <div>
                <Label htmlFor='degree'>Degree</Label>
                <Input
                  id='degree'
                  name='degree'
                  value={formData.degree}
                  onChange={handleInputChange}
                  placeholder='e.g. Bachelor of Science (BSc)'
                />
              </div>
              <div>
                <Label htmlFor='fieldOfStudy'>Field of Study</Label>
                <Input
                  id='fieldOfStudy'
                  name='fieldOfStudy'
                  value={formData.fieldOfStudy}
                  onChange={handleInputChange}
                  placeholder='e.g. Computer Science'
                />
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <Label htmlFor='startYear'>Start Year</Label>
                  <Input
                    id='startYear'
                    name='startYear'
                    type='number'
                    value={formData.startYear}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor='endYear'>End Year</Label>
                  <Input
                    id='endYear'
                    name='endYear'
                    type='number'
                    value={formData.endYear}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor='location'>Location</Label>
                <Input
                  id='location'
                  name='location'
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder='e.g. Boston, MA, USA'
                />
              </div>
              <div>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder='Briefly describe your education experience...'
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsModalOpen(false)} className='rounded-full'>
              Cancel
            </Button>
            <Button onClick={saveEducation} className='rounded-full bg-[#149A9B] text-white'>
              {editingId ? 'Save Changes' : 'Add Education'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer className='px-4 mt-auto flex justify-between'>
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
            Skip
          </Button>
          <Button
            onClick={nextStep}
            className='gap-1 bg-[#149A9B] text-white rounded-full md:min-w-36'
            disabled={(userData.education || []).length === 0}
          >
            Next, Add Languages
          </Button>
        </div>
      </Footer>
    </div>
  )
}

export default UserAddEducationActiveState
