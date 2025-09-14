'use client';

import { useRouter } from 'next/navigation';
import { CreateProjectLayout } from '@/components/create-project/create-project-layout';
import { TimelineConfigurationForm } from '@/components/create-project/timeline-configuration-form';

export default function CreateProjectStep3() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/client/create-project/step-4');
  };

  const handleBack = () => {
    router.push('/client/create-project/step-2');
  };

  const handleHeaderBack = () => {
    router.push('/client/create-project/step-2');
  };

  return (
    <CreateProjectLayout onBack={handleHeaderBack}>
      <TimelineConfigurationForm onNext={handleNext} onBack={handleBack} />
    </CreateProjectLayout>
  );
} 