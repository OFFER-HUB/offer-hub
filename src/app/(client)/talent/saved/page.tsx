"use client";

import Header from '@/components/client-dashboard/Header'
import { ClientSidebar } from '@/components/client-dashboard/Sidebar'
import { Button } from '@/components/ui/button';
import { Heart, Filter } from 'lucide-react'
import React, { useState, useMemo, useEffect } from 'react'
import SearchBar from '@/components/talent/SearchBar';
import FilterComponent from '@/components/talent/TalentFilters';
import TalentCard from '@/components/talent/TalentCard';
import { talentProfileData as talentMockData } from '@/lib/mockData/talent-mock-data';
import { Filters } from '@/lib/mockData/filters-mock-data';

const SavedTalentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [savedTalentIds, setSavedTalentIds] = useState<number[]>([]);
  const [activeFilters, setActiveFilters] = useState<Filters>({
    categories: [],
    skills: [],
    locations: [],
    rating: null,
    priceRange: { min: 0, max: 1000 }
  });

  useEffect(() => {
    const savedTalents = JSON.parse(localStorage.getItem('savedTalents') || '[]');
    setSavedTalentIds(savedTalents);
  }, []);

  const savedTalents = useMemo(() => {
    return talentMockData.filter(talent => savedTalentIds.includes(talent.id));
  }, [savedTalentIds]);

  const filteredTalents = useMemo(() => {
    let filtered = savedTalents;

    if (searchTerm) {
      filtered = filtered.filter(talent => 
        talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        talent.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        talent.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        talent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        talent.skills.some(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (activeFilters.categories.length > 0) {
      filtered = filtered.filter(talent => 
        activeFilters.categories.includes(talent.category)
      );
    }

    if (activeFilters.skills.length > 0) {
      filtered = filtered.filter(talent => 
        talent.skills.some(skill => 
          activeFilters.skills.includes(skill.name)
        )
      );
    }

    if (activeFilters.locations.length > 0) {
      filtered = filtered.filter(talent => 
        activeFilters.locations.includes(talent.location)
      );
    }

    if (activeFilters.rating !== null) {
      filtered = filtered.filter(talent => 
        talent.rating >= (activeFilters.rating ?? 0)
      );
    }

    filtered = filtered.filter(talent => 
      talent.hourlyRate >= activeFilters.priceRange.min &&
      talent.hourlyRate <= activeFilters.priceRange.max
    );

    return filtered;
  }, [searchTerm, savedTalents, activeFilters]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterApply = (filters: Filters) => {
    setActiveFilters(filters);
  };

  const openFilter = () => {
    setIsFilterOpen(true);
  };

  const closeFilter = () => {
    setIsFilterOpen(false);
  };

  const handleTalentAction = (talentId: number) => {
    console.log(`Action clicked for talent ID: ${talentId}`);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const savedTalents = JSON.parse(localStorage.getItem('savedTalents') || '[]');
      setSavedTalentIds(savedTalents);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('savedTalentsChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('savedTalentsChanged', handleStorageChange);
    };
  }, []);

  return (
    <div className='min-h-screen bg-gray-100'>
      <Header />
      <div className='flex pt-16'>
        <ClientSidebar />
        <div className='flex-1'>
          <div className='bg-white px-6 py-2'>
            <div className='flex items-center justify-center'>
              <h1 className='text-base font-bold text-gray-900'>Talents</h1>
            </div>
          </div>

          <div className='px-6 py-6'>
            <div className='bg-white rounded-lg p-8 max-w-2xl mx-auto'>
              <div className='flex gap-4 mb-8'>
                <Button 
                  onClick={openFilter}
                  className='bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 px-4'
                >
                  <Filter className="w-5 h-5" />
                  Filter
                </Button>
                <div className='flex-1'>
                  <SearchBar 
                    onSearch={handleSearch}
                    placeholder="Search saved talents"
                  />
                </div>
              </div>

              <div className='mb-6'>
                <p className='text-sm text-gray-600'>
                  Showing {filteredTalents.length} of {savedTalents.length} saved talents
                </p>
              </div>

              <div className='space-y-6'>
                {filteredTalents.length > 0 ? (
                  filteredTalents.map((talent) => (
                    <TalentCard
                      key={talent.id}
                      id={talent.id}
                      name={talent.name}
                      title={talent.title}
                      location={talent.location}
                      category={talent.category}
                      rating={talent.rating}
                      hourlyRate={talent.hourlyRate}
                      avatar={talent.avatar}
                      skills={talent.skills}
                      description={talent.description}
                      actionText={talent.actionText}
                      onActionClick={handleTalentAction}
                    />
                  ))
                ) : savedTalents.length === 0 ? (
                  <div className='text-center py-12'>
                    <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className='text-gray-500 text-lg mb-2'>No saved talents yet</p>
                    <p className='text-gray-400 text-sm'>Start exploring talents and save your favorites to see them here</p>
                  </div>
                ) : (
                  <div className='text-center py-12'>
                    <p className='text-gray-500 text-lg mb-2'>No saved talents match your search</p>
                    <p className='text-gray-400 text-sm'>Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FilterComponent
        isOpen={isFilterOpen}
        onClose={closeFilter}
        onApply={handleFilterApply}
      />
    </div>
  )
}

export default SavedTalentsPage