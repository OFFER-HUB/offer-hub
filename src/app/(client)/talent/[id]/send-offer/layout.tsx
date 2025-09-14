'use client';

import { OfferFormProvider } from '@/components/send-offer/OfferFormContext';

export default function SendOfferLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OfferFormProvider>
      {children}
    </OfferFormProvider>
  );
}