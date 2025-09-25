import Step2PageClient from './Step2PageClient';

interface Step2PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Step2Page({ params }: Step2PageProps) {
  const { id } = await params;
  
  return <Step2PageClient id={id} />;
}