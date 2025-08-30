"use client";

import { useEffect, useState } from "react";
import FreelancerProfile from "@/components/talent/FreelancerProfile";
import { getFreelancerProfile } from "@/lib/mockData/freelancer-profile-mock";
import { FreelancerProfile as FreelancerProfileType } from "@/lib/mockData/freelancer-profile-mock";
import TalentLayout from "@/components/talent/TalentLayout";

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  
  return <ProfilePageClient id={id} />;
}

interface ProfilePageClientProps {
  id: string;
}

function ProfilePageClient({ id }: ProfilePageClientProps) {
  const [freelancer, setFreelancer] = useState<FreelancerProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFreelancer = () => {
      try {
        const profile = getFreelancerProfile(id);
        if (profile) {
          setFreelancer(profile);
        } else {
          setError("Freelancer not found");
        }
      } catch (err) {
        setError("Failed to load freelancer profile");
      } finally {
        setLoading(false);
      }
    };

    loadFreelancer();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading freelancer profile...</p>
        </div>
      </div>
    );
  }

  if (error || !freelancer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error || "The freelancer profile you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <TalentLayout>
      <FreelancerProfile freelancer={freelancer} />
    </TalentLayout>
  );
}
