'use client';

import { useState } from 'react';
import ProfileHeader from './ProfileHeader';
import SkillsSection from './SkillsSection';
import ExperienceSection from './ExperienceSection';
import ReviewsSection from './ReviewsSection';
import ProfileNavigation from './ProfileNavigation';
import PortfolioGallery from './PortfolioGallery';
import PortfolioItem from './PortfolioItem';
import { FreelancerProfile as FreelancerProfileType } from '@/lib/mockData/freelancer-profile-mock';
import { PortfolioProject, getPortfolioProjects } from '@/lib/mockData/portfolio-mock-data';

interface FreelancerProfileProps {
  freelancer: FreelancerProfileType;
}

export default function FreelancerProfile({ freelancer }: FreelancerProfileProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'portfolio'>(() => {
    // Check if we're on the portfolio route
    if (typeof window !== 'undefined') {
      return window.location.pathname.includes('/portfolio') ? 'portfolio' : 'profile';
    }
    return 'profile';
  });
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [portfolioProjects] = useState(() => getPortfolioProjects(freelancer.id));

  const handleProjectClick = (project: PortfolioProject) => {
    setSelectedProject(project);
  };

  const handleBackToGallery = () => {
    setSelectedProject(null);
  };

  return (
    <div className='p-6'>
      {/* Profile Header - Always visible */}
      <div className='mb-8'>
        <ProfileHeader freelancer={freelancer} />
      </div>

      {/* Navigation Tabs */}
      <div className='mb-8'>
        <ProfileNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </div>

      {/* Content */}
      <div className='space-y-8'>
        {activeTab === 'profile' ? (
          /* Profile Tab */
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2 space-y-6'>
              <SkillsSection skills={freelancer.skills} />
              <ExperienceSection experience={freelancer.experience} />
            </div>
            <div className='space-y-6'>
              <ReviewsSection reviews={freelancer.reviews} />
            </div>
          </div>
        ) : (
          /* Portfolio Tab */
          <div>
            {selectedProject ? (
              <PortfolioItem 
                project={selectedProject} 
                onBack={handleBackToGallery}
              />
            ) : (
              <PortfolioGallery 
                projects={portfolioProjects}
                onProjectClick={handleProjectClick}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
