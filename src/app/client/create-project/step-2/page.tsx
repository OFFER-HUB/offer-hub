'use client';

import { useRouter } from 'next/navigation';
import { CreateProjectLayout } from '@/components/create-project/create-project-layout';
import { BudgetConfigurationForm } from '@/components/create-project/budget-configuration-form';

export default function CreateProjectStep2() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/client/create-project/step-3');
  };

  const handleBack = () => {
    router.push('/client/create-project/step-1');
  };

  const handleHeaderBack = () => {
    router.push('/client/create-project/step-1');
  };

  return (
    <CreateProjectLayout onBack={handleHeaderBack}>
      <BudgetConfigurationForm onNext={handleNext} onBack={handleBack} />
    </CreateProjectLayout>
  );
} 