import Step3PageClient from './Step3PageClient';

interface Step3PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Step3Page({ params }: Step3PageProps) {
  const { id } = await params;
  
  return <Step3PageClient id={id} />;
}