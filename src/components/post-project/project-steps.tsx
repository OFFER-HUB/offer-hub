'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface ProjectStepsProps {
  currentStep: number
  totalSteps: number
}

export default function ProjectSteps({ currentStep, totalSteps }: ProjectStepsProps) {
  const steps = [
    { id: 1, label: 'Basic Info' },
    { id: 2, label: 'Requirements' },
    { id: 3, label: 'Budget' },
    { id: 4, label: 'Attachments' },
    { id: 5, label: 'Review' },
  ]

  return (
    <div className='relative'>
      <div className='hidden sm:flex items-center justify-between'>
        {steps.map((step, index) => (
          <div key={step.id} className='relative flex flex-col items-center'>
            <div className='flex items-center justify-center'>
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  currentStep > step.id
                    ? 'bg-[#15949C] text-white'
                    : currentStep === step.id
                      ? 'bg-[#15949C]/20 text-[#15949C] border-2 border-[#15949C]'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {currentStep > step.id ? <Check className='h-5 w-5' /> : step.id}
              </div>
            </div>
            <div className='text-center mt-2'>
              <p className={`text-sm ${currentStep >= step.id ? 'text-[#002333] font-medium' : 'text-gray-400'}`}>
                {step.label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`absolute top-5 left-10 h-0.5 w-full ${
                  currentStep > step.id ? 'bg-[#15949C]' : 'bg-gray-200'
                }`}
                style={{ width: 'calc(100% - 2.5rem)' }}
              ></div>
            )}
          </div>
        ))}
      </div>

      <div className='sm:hidden'>
        <div className='flex items-center justify-between bg-gray-50 p-2 rounded-lg'>
          <p className='text-sm font-medium text-[#002333]'>
            Step {currentStep} of {totalSteps}: {steps.find((step) => step.id === currentStep)?.label}
          </p>
          <div className='text-xs font-medium text-[#15949C]'>
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </div>
        </div>
        <div className='mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden'>
          <motion.div
            className='h-full bg-[#15949C]'
            initial={{ width: `${((currentStep - 1) / totalSteps) * 100}%` }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          ></motion.div>
        </div>
      </div>
    </div>
  )
}

