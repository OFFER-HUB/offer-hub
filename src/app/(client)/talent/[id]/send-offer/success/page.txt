import SuccessPageClient from "./SuccessPageClient";

interface SuccessPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SuccessPage({ params }: SuccessPageProps) {
  const { id } = await params;
  
  return <SuccessPageClient id={id} />;
}