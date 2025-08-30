"use client"

import TalentLayout from "@/components/talent/TalentLayout";

interface PortfolioPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { id } = await params;


  return (
    <TalentLayout>
        <h1>{id}</h1>
    </TalentLayout>
  )
}