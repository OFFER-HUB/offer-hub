'use client'

import { useFreelancerSteps } from '@/hooks/use-freelancer-steps'
import UserSelectInterestedCategory from './user-select-interested-category'

const steps = [
  { key: 'user-choose-role', component: null }, // to be implemented
  { key: 'user-select-job-type', component: null }, // to be implemented
  { key: 'user-select-interested-category', component: UserSelectInterestedCategory },
  { key: 'user-add-work-experience', component: null },  // to be implemented
  { key: 'user-add-work-experience-active-state', component: null },  // to be implemented
  { key: 'user-add-work-experience-active-state-not-in-focus', component: null },  // to be implemented
  { key: 'user-add-work-experience-default-state', component: null },  // to be implemented
  { key: 'user-add-education-default-state', component: null },  // to be implemented
  { key: 'user-choose-languaje-active-state', component: null },  // to be implemented
  { key: 'user-write-bio', component: null },  // to be implemented
  { key: 'user-enter-service-fee', component: null },  // to be implemented
  { key: 'user-setting-up-account-profile-active-state', component: null },  // to be implemented
  { key: 'user-profile-photo-active-and-focus-state', component: null },  // to be implemented
  { key: 'user-profile-set-uo-preview', component: null },  // to be implemented
]

export default function StepsController() {
  const { currentStep, nextStep, prevStep } = useFreelancerSteps()
  const StepComponent = steps[currentStep]?.component

  return (
    <>
      {StepComponent ? <StepComponent prevStep={prevStep} nextStep={nextStep} /> : <p>This step is not yet implemented.</p>}

      <div className="mt-8 flex justify-between">
        <button onClick={prevStep} disabled={currentStep === 0}>
          Back
        </button>
        <button onClick={nextStep} disabled={currentStep === steps.length - 1}>
          Next
        </button>
      </div>
    </>
  )
}
