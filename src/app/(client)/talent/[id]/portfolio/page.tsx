"use client"

import { useParams } from 'next/navigation';
import TalentLayout from "@/components/talent/TalentLayout";

export default function PortfolioPage() {
  const params = useParams();
  const id = params.id as string;


  return (
    <TalentLayout>
        <h1>{id}</h1>
    </TalentLayout>
  )
}