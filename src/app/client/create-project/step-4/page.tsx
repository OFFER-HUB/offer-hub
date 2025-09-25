'use client';

import { useRouter } from 'next/navigation';
import { CreateProjectLayout } from '@/components/create-project/create-project-layout';
import { SuccessConfirmation } from '@/components/create-project/success-confirmation';

export default function CreateProjectStep4() {
  const router = useRouter();

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleHeaderBack = () => {
    router.push('/client/create-project/step-3');
  };

  return (
    <CreateProjectLayout onBack={handleHeaderBack}>
      <SuccessConfirmation onGoToDashboard={handleGoToDashboard} />
    </CreateProjectLayout>
  );
} 