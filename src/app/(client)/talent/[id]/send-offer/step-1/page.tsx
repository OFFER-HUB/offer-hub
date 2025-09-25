import Step1PageClient from './Step1PageClient';

interface Step1PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Step1Page({ params }: Step1PageProps) {
  const { id } = await params;
  
  return <Step1PageClient id={id} />;
}