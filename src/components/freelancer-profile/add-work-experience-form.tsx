'use client'

import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { WorkExperience } from '@/app/types/freelancer-profile'
import { useEffect } from 'react'

type Props = {
  addExperience: (experience: WorkExperience) => void
  initialData?: WorkExperience | null
}

const formSchema = z
  .object({
    title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
    company: z.string().min(2, { message: 'Company name must be at least 2 characters.' }),
    location: z.string().min(2, { message: 'Location must be at least 2 characters.' }),
    country: z.string({ required_error: 'Please select a country.' }),
    currentlyWorking: z.boolean().default(false),
    startDateMonth: z.string().nonempty({ message: 'Start month is required.' }),
    startDateYear: z.string().nonempty({ message: 'Start year is required.' }),
    endDateMonth: z.string().optional(),
    endDateYear: z.string().optional(),
    description: z
      .string()
      .min(10, { message: 'Description must be at least 10 characters.' })
      .max(500, { message: 'Description must not be longer than 500 characters.' }),
  })
  .refine((data) => data.currentlyWorking || (data.endDateMonth && data.endDateYear), {
    message: 'End date is required if not currently working',
    path: ['endDateMonth'],
  })

const AddWorkExperienceForm = ({ addExperience, initialData }: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      company: '',
      location: '',
      country: '',
      currentlyWorking: false,
      startDateMonth: '',
      startDateYear: '',
      endDateMonth: '',
      endDateYear: '',
      description: '',
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData, form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    addExperience({ ...values, id: initialData?.id || '' })
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 p-4' id='add-work-experience-form'>
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title*</FormLabel>
              <FormControl>
                <Input placeholder='Software Engineer' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='company'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company*</FormLabel>
              <FormControl>
                <Input placeholder='Example: Microsoft' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='location'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location*</FormLabel>
              <FormControl>
                <Input placeholder='Example: London' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='country'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select your country' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='us'>United States</SelectItem>
                  <SelectItem value='ca'>Canada</SelectItem>
                  <SelectItem value='uk'>United Kingdom</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='currentlyWorking'
          render={({ field }) => (
            <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel>I am currently working in this role.</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <div className='grid grid-cols-2 gap-4 items-end'>
          <FormField
            control={form.control}
            name='startDateMonth'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Month' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[
                      'January',
                      'February',
                      'March',
                      'April',
                      'May',
                      'June',
                      'July',
                      'August',
                      'September',
                      'October',
                      'November',
                      'December',
                    ].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='startDateYear'
            render={({ field }) => (
              <FormItem>
                <FormLabel>&nbsp;</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Year' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                      <SelectItem key={y} value={`${y}`}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {!form.watch('currentlyWorking') && (
            <>
              <FormField
                control={form.control}
                name='endDateMonth'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Month' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[
                          'January',
                          'February',
                          'March',
                          'April',
                          'May',
                          'June',
                          'July',
                          'August',
                          'September',
                          'October',
                          'November',
                          'December',
                        ].map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='endDateYear'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>&nbsp;</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Year' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                          <SelectItem key={y} value={`${y}`}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder='Enter a description...' className='resize-none' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' className='w-full bg-[#149A9B] text-white rounded-full'>
          Save
        </Button>
      </form>
    </Form>
  )
}

export default AddWorkExperienceForm
