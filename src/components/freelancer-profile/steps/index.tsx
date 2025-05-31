"use client";

import { useFreelancerSteps } from '@/hooks/use-freelancer-steps';
import Header from '../header';
import UserChooseRole from './user-choose-role';
import UserSelectJobType from './user-select-job-type';
import UserAddWorkExperience from '@/components/freelancer-profile/steps/user-add-work-experience';
import UserAddWorkExperienceDefaultState from './user-add-work-experience-default-state';
import UserSetAccountProfileActiveState from '@/components/freelancer-profile/steps/user-set-account-profile-active-state';
import UserSetHourlyRateActiveState from './user-set-hourly-rate-active-state';
import UserAddLanguagesActiveState from './user-add-languages-active-state';
import UserAddBioActiveState from './user-add-bio-active-state';
import UserProfilePreviewActiveState from './user-profile-preview-active-state';

const steps = [
  { key: 'user-choose-role', component: <UserChooseRole /> },
  { key: 'user-select-job-type', component: <UserSelectJobType /> },
  { key: 'user-select-interested-category', component: null }, // to be implemented
  { key: 'user-add-work-experience', component: <UserAddWorkExperience /> },
  { key: 'user-add-work-experience-active-state', component: null }, // to be implemented
  { key: 'user-add-work-experience-active-state-not-in-focus', component: null }, // to be implemented
  { key: 'user-add-work-experience-default-state', component: <UserAddWorkExperienceDefaultState /> },
  { key: 'user-add-education-default-state', component: null }, // to be implemented
  { key: 'user-set-hourly-rate-active-state', component: <UserSetHourlyRateActiveState /> },
  { key: 'user-choose-languaje-active-state', component: <UserAddLanguagesActiveState /> },
  { key: 'user-write-bio', component: <UserAddBioActiveState /> },
  { key: 'user-enter-service-fee', component: null }, // to be implemented
  { key: 'user-set-account-profile-active-state', component: <UserSetAccountProfileActiveState /> },
  { key: 'user-profile-photo-active-and-focus-state', component: null }, // to be implemented
  { key: 'user-profile-preview-active-state', component: <UserProfilePreviewActiveState /> },
];

export default function StepsController() {
  const { currentStep, nextStep, prevStep } = useFreelancerSteps();
  const StepComponent = steps[currentStep]?.component;
  
  return (
    <section className='flex flex-col min-h-svh'>
      <Header />
      
      <div className='flex-1 flex'>
        {StepComponent ? (
          StepComponent
        ) : (
          <p>This step is not yet implemented.</p>
        )}
      </div>
      {/* <UserAddWorkExperienceDefaultState /> */}
      <div className='mt-8 flex justify-between'>
        <button onClick={prevStep} disabled={currentStep === 0}>
          Back
        </button>
        <button onClick={nextStep} disabled={currentStep === steps.length - 1}>
          Next
        </button>
      </div>
    </section>
  );
}