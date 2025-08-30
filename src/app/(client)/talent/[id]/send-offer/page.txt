import { redirect } from "next/navigation";

interface SendOfferPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SendOfferPage({ params }: SendOfferPageProps) {
  const { id } = await params;
  redirect(`/talent/${id}/send-offer/step-1`);
}