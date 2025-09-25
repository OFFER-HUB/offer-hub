'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Star, MessageCircle, Send } from 'lucide-react'
import { useTalentData } from '@/hooks/talent/useTalentData'
import type { TalentProfile } from '@/lib/mockData/talent-mock-data'
import TalentLayout from '@/components/talent/talents/TalentLayout'
import TalentCard from '@/components/talent/TalentCard'
import PortfolioCarousel from '@/components/talent/talents/Portfolio'
import ReviewsCarousel from '@/components/talent/talents/Review'
import { useTalent } from '@/lib/contexts/TalentContext'
import { useNotification } from '@/lib/contexts/NotificatonContext'
import { useMessages } from '@/lib/contexts/MessageContext'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'

const TalentProfilePage = () => {
  const params = useParams();
  const router = useRouter();
  const { getTalentById, loading: talentLoading } = useTalentData();
  const { state: talentState, actions: talentActions } = useTalent();
  const {
    actions: { addNotification },
  } = useNotification();
  const { getConversation } = useMessages();
  const [talent, setTalent] = useState<TalentProfile | null>(null);
  const [portfolioIndex, setPortfolioIndex] = useState(0);
  const [reviewsIndex, setReviewsIndex] = useState(0);

  const loading = talentLoading || talentState.loading;

  useEffect(() => {
    if (!loading && params.id) {
      const talentData = getTalentById(Number(params.id));
      setTalent(talentData || null);

      if (talentData) {
        addNotification({
          type: 'info',
          title: 'Profile Loaded',
          message: `Viewing ${talentData.name}'s profile`,
        })
      }
    }
  }, [params.id, loading, getTalentById, addNotification]);

  const handleSendMessage = () => {
    if (talent) {
      router.push(`/talent/${talent.id}/messages`);
    }
  };

  const handleSendOffer = () => {
    if (talent) {
      router.push(`/talent/${talent.id}/send-offer`);
    }
  };

  const handleViewPortfolioItem = (itemId: string) => {
    if (talent) {
      router.push(`/talent/${talent.id}/portfolio/${itemId}`);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-100'>
        <div className='bg-white px-6 py-2'>
          <div className='flex items-center justify-between'>
            <div className='flex-1 text-center'>
              <h1 className='text-base font-bold text-gray-900'>Profile</h1>
            </div>
          </div>
        </div>
        <TalentLayout>
          <LoadingSkeleton />
        </TalentLayout>
      </div>
    );
  }

  if (!talent) {
    return (
      <div className='min-h-screen bg-gray-100 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>Talent not found</h1>
          <Button onClick={() => router.back()} className='bg-teal-600 hover:bg-teal-700'>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const nextPortfolio = () => {
    setPortfolioIndex((prev) => (prev + 1) % talent.portfolio.length);
  };

  const prevPortfolio = () => {
    setPortfolioIndex(
      (prev) => (prev - 1 + talent.portfolio.length) % talent.portfolio.length
    );
  };

  const nextReview = () => {
    setReviewsIndex((prev) => (prev + 1) % talent.reviews.length);
  };

  const prevReview = () => {
    setReviewsIndex(
      (prev) => (prev - 1 + talent.reviews.length) % talent.reviews.length
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ))
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='bg-white px-6 py-2'>
        <div className='flex items-center justify-between'>
          <div className='flex-1 text-center'>
            <h1 className='text-base font-bold text-gray-900'>Profile</h1>
          </div>
          <div className='w-16' /> {/* Spacer for centering */}
        </div>
      </div>

      <TalentLayout>
        <div className=''>
          <TalentCard
            id={talent.id}
            name={talent.name}
            title={talent.title}
            location={talent.location}
            category={talent.category}
            rating={talent.rating}
            hourlyRate={talent.hourlyRate}
            skills={talent.skills}
            avatar={talent.avatar}
            actionText={talent.actionText}
            description={talent.description}
            className='border border-gray-200'
            onActionClick={() => handleSendOffer()}
          />
          <PortfolioCarousel talentId={String(talent.id)} title='Portfolio' items={talent.portfolio} />
          <ReviewsCarousel itemsPerPage={3} reviews={talent.reviews} renderStars={() => renderStars(5)} />
        </div>
      </TalentLayout>
    </div>
  );
};

export default TalentProfilePage;
