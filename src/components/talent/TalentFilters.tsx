'use client';

import { Button } from '@/components/ui/button';
import { X, Star } from 'lucide-react';
import React, { useState } from 'react';

interface Filters {
  categories: string[];
  skills: string[];
  locations: string[];
  rating: number | null;
  priceRange: {
    min: number;
    max: number;
  };
}

interface FilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (filters: Filters) => void;
}

const Filter: React.FC<FilterProps> = ({ isOpen, onClose, onApply }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  // Static data for filters
  const categories = [
    'Design',
    'Development', 
    'Marketing',
    'Writing',
    'Consulting',
    'Photography'
  ];

  const skills = [
    'UI/UX',
    'Figma',
    'Adobe XD',
    'Sketch',
    'React',
    'Vue',
    'Angular',
    'Node.js',
    'Python',
    'SEO',
    'Content Writing',
    'Social Media'
  ];

  const locations = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Germany',
    'France',
    'Netherlands',
    'New Zealand',
    'Singapore',
    'Remote'
  ];

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const toggleLocation = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const selectRating = (rating: number) => {
    setSelectedRating(selectedRating === rating ? null : rating);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedSkills([]);
    setSelectedLocations([]);
    setSelectedRating(null);
    setPriceRange({ min: 0, max: 1000 });
  };

  const hasActiveFilters = selectedCategories.length > 0 || 
                          selectedSkills.length > 0 || 
                          selectedLocations.length > 0 || 
                          selectedRating !== null ||
                          priceRange.min > 0 || 
                          priceRange.max < 1000;

  const handleApply = () => {
    const filters = {
      categories: selectedCategories,
      skills: selectedSkills,
      locations: selectedLocations,
      rating: selectedRating,
      priceRange
    };
    onApply?.(filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'>
      <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <h2 className='text-xl font-semibold text-gray-900'>Filters</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 p-1'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Filter Content */}
        <div className='p-6 space-y-8'>
          {/* Categories */}
          <div>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>Categories</h3>
            <div className='flex flex-wrap gap-2'>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    selectedCategories.includes(category)
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-teal-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>Skills</h3>
            <div className='flex flex-wrap gap-2'>
              {skills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    selectedSkills.includes(skill)
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>Location</h3>
            <div className='flex flex-wrap gap-2'>
              {locations.map((location) => (
                <button
                  key={location}
                  onClick={() => toggleLocation(location)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    selectedLocations.includes(location)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                  }`}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>Minimum Rating</h3>
            <div className='flex gap-2'>
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => selectRating(rating)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition-colors ${
                    selectedRating === rating
                      ? 'bg-yellow-500 text-white border-yellow-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-yellow-300'
                  }`}
                >
                  <Star className={`w-4 h-4 ${selectedRating === rating ? 'fill-current' : ''}`} />
                  <span>{rating}+</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>Price Range ($/hour)</h3>
            <div className='space-y-4'>
              <div className='flex items-center gap-4'>
                <div className='flex-1'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Min</label>
                  <input
                    type='number'
                    value={priceRange.min}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent'
                    placeholder='0'
                  />
                </div>
                <div className='flex-1'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Max</label>
                  <input
                    type='number'
                    value={priceRange.max}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 1000 }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent'
                    placeholder='1000'
                  />
                </div>
              </div>
              <div className='text-sm text-gray-600'>
                ${priceRange.min} - ${priceRange.max} per hour
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50'>
          <div className='flex items-center gap-4'>
            {hasActiveFilters && (
              <Button
                variant='ghost'
                onClick={clearAllFilters}
                className='text-gray-600 hover:text-gray-800'
              >
                Clear All
              </Button>
            )}
            <span className='text-sm text-gray-600'>
              {selectedCategories.length + selectedSkills.length + selectedLocations.length + (selectedRating ? 1 : 0)} filters applied
            </span>
          </div>
          <div className='flex gap-3'>
            <Button
              variant='outline'
              onClick={onClose}
              className='px-6'
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              className='bg-teal-600 hover:bg-teal-700 text-white px-6'
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filter;