'use client';

import { useRouter } from 'next/navigation';
import { CreateProjectLayout } from '@/components/create-project/create-project-layout';
import { ProjectDetailsForm } from '@/components/create-project/project-details-form';

export default function CreateProjectStep1() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/client/create-project/step-2');
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <CreateProjectLayout>
      <ProjectDetailsForm onNext={handleNext} onBack={handleBack} />
    </CreateProjectLayout>
  );
} 