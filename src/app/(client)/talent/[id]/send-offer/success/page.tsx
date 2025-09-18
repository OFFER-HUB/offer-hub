"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTalentData } from "@/hooks/talent/useTalentData";
import Image from "next/image";
import TalentLayout from "@/components/talent/talents/TalentLayout";

export default function OfferSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const talentId = params.id as string;
  const { getTalentById } = useTalentData();

  const [offerData, setOfferData] = useState<any>(null);
  const talent = getTalentById(Number(talentId));

  useEffect(() => {
    // Retrieve complete offer data
    const storedData = sessionStorage.getItem("completeOfferData");
    if (storedData) {
      setOfferData(JSON.parse(storedData));
    }

    // Clean up session storage
    return () => {
      sessionStorage.removeItem("offerFormData");
      sessionStorage.removeItem("completeOfferData");
    };
  }, []);

  const handleMessage = () => {
    router.push(`/talent/${talentId}/messages`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <h1 className="text-base font-bold text-gray-900">Talents</h1>
          </div>
        </div>
      </div>
      <TalentLayout>
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="text-center">
            {/* Success Message */}
            <div className="mb-8">
              <h1 className="text-sm font-bold text-gray-900 mb-2">
                You have sent offer to
              </h1>
              <p className="text-xl text-gray-500">
                {talent?.name || "John D"}
              </p>
            </div>

            {/* Success Icon */}
            <div className="mb-12 flex justify-center">
              <Image
                src="/success-tick.png"
                alt="Success message"
                width={150}
                height={200}
              />
            </div>

            {/* Message Button */}
            <Button
              onClick={handleMessage}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-full font-medium"
            >
              Message
            </Button>
          </div>
        </div>
      </TalentLayout>
    </div>
  );
}
