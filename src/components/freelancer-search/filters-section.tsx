'use client'

import type React from 'react'

import { useState } from 'react'
import { ChevronUp, ChevronDown, Check } from 'lucide-react'

interface FiltersSectionProps {
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  ratingFilters: {
    fiveStars: boolean
    fourStars: boolean
    threeStars: boolean
    twoStars: boolean
    oneStar: boolean
  }
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  setRatingFilters: (filters: any) => void
  hourlyRate: number
  setHourlyRate: (rate: number) => void
  selectedLocation: string
  setSelectedLocation: (location: string) => void
  resetAllFilters: () => void
}

export default function FiltersSection({
  selectedCategory,
  setSelectedCategory,
  ratingFilters,
  setRatingFilters,
  hourlyRate,
  setHourlyRate,
  selectedLocation,
  setSelectedLocation,
  resetAllFilters,
}: FiltersSectionProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: false,
    hourlyRate: false,
    rating: false,
    location: false,
  })

  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)

  const minRate = 20
  const maxRate = 80
  const currentRate = minRate + (hourlyRate / 100) * (maxRate - minRate)

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section as keyof typeof expandedSections],
    })
  }

  const selectCategory = (category: string) => {
    setSelectedCategory(selectedCategory === category ? '' : category)
  }

  const toggleRatingFilter = (rating: string) => {
    setRatingFilters({
      ...ratingFilters,
      [rating]: !ratingFilters[rating as keyof typeof ratingFilters],
    })
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHourlyRate(Number.parseInt(e.target.value))
  }

  const selectLocation = (location: string) => {
    setSelectedLocation(location)
    setLocationDropdownOpen(false)
  }

  return (
    <div className='bg-white rounded-lg shadow'>
      <div className='p-5 flex justify-between items-center'>
        <h2 className='text-xl font-medium text-gray-700'>Filters</h2>
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button className='text-teal-500 text-sm hover:underline' onClick={resetAllFilters}>
          Reset All
        </button>
      </div>

      {/* Category Section */}
      <div className='border-t border-gray-100'>
        <div className='p-5'>
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div
            className='flex justify-between items-center mb-4 cursor-pointer'
            onClick={() => toggleSection('category')}
          >
            <h3 className='text-lg font-medium text-gray-700'>Category</h3>
            {expandedSections.category ? (
              <ChevronUp className='h-5 w-5 text-gray-400' />
            ) : (
              <ChevronDown className='h-5 w-5 text-gray-400' />
            )}
          </div>
          {expandedSections.category && (
            <div className='space-y-3'>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className='flex items-center cursor-pointer'>
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                <div
                  className={`h-5 w-5 rounded mr-3 flex items-center justify-center ${
                    selectedCategory === 'design' ? 'bg-teal-500' : 'border border-teal-400'
                  }`}
                  onClick={() => selectCategory('design')}
                >
                  {selectedCategory === 'design' && <Check className='h-4 w-4 text-white' />}
                </div>
                <div className='flex items-center gap-2'>
                  <svg className='h-5 w-5 text-gray-600' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <title>Design Icon</title>
                    <path d='M12 19l7-7 3 3-7 7-3-3z' />
                    <path d='M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z' />
                    <path d='M2 2l7.586 7.586' />
                    <circle cx='11' cy='11' r='2' />
                  </svg>
                  <span className='text-gray-600'>Design</span>
                </div>
                <span className='text-gray-400 text-sm ml-auto'>(1245)</span>
              </label>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className='flex items-center cursor-pointer'>
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                <div
                  className={`h-5 w-5 rounded mr-3 flex items-center justify-center ${
                    selectedCategory === 'development' ? 'bg-teal-500' : 'border border-teal-400'
                  }`}
                  onClick={() => selectCategory('development')}
                >
                  {selectedCategory === 'development' && <Check className='h-4 w-4 text-white' />}
                </div>
                <div className='flex items-center gap-2'>
                  <svg className='h-5 w-5 text-gray-600' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <title>Development Icon</title>
                    <polyline points='16 18 22 12 16 6' />
                    <polyline points='8 6 2 12 8 18' />
                  </svg>
                  <span className='text-gray-600'>Development</span>
                </div>
                <span className='text-gray-400 text-sm ml-auto'>(873)</span>
              </label>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className='flex items-center cursor-pointer'>
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                <div
                  className={`h-5 w-5 rounded mr-3 flex items-center justify-center ${
                    selectedCategory === 'marketing' ? 'bg-teal-500' : 'border border-teal-400'
                  }`}
                  onClick={() => selectCategory('marketing')}
                >
                  {selectedCategory === 'marketing' && <Check className='h-4 w-4 text-white' />}
                </div>
                <div className='flex items-center gap-2'>
                  <svg className='h-5 w-5 text-gray-600' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <title>Marketing Icon</title>
                    <line x1='18' y1='20' x2='18' y2='10' />
                    <line x1='12' y1='20' x2='12' y2='4' />
                    <line x1='6' y1='20' x2='6' y2='14' />
                  </svg>
                  <span className='text-gray-600'>Marketing</span>
                </div>
                <span className='text-gray-400 text-sm ml-auto'>(642)</span>
              </label>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className='flex items-center cursor-pointer'>
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                <div
                  className={`h-5 w-5 rounded mr-3 flex items-center justify-center ${
                    selectedCategory === 'business' ? 'bg-teal-500' : 'border border-teal-400'
                  }`}
                  onClick={() => selectCategory('business')}
                >
                  {selectedCategory === 'business' && <Check className='h-4 w-4 text-white' />}
                </div>
                <div className='flex items-center gap-2'>
                  <svg className='h-5 w-5 text-gray-600' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <title>Business Icon</title>
                    <rect x='2' y='7' width='20' height='14' rx='2' ry='2' />
                    <path d='M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' />
                  </svg>
                  <span className='text-gray-600'>Business</span>
                </div>
                <span className='text-gray-400 text-sm ml-auto'>(419)</span>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className='border-t border-gray-100'>
        <div className='p-5'>
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div
            className='flex justify-between items-center mb-4 cursor-pointer'
            onClick={() => toggleSection('hourlyRate')}
          >
            <h3 className='text-lg font-medium text-gray-700'>Hourly Rate</h3>
            {expandedSections.hourlyRate ? (
              <ChevronUp className='h-5 w-5 text-gray-400' />
            ) : (
              <ChevronDown className='h-5 w-5 text-gray-400' />
            )}
          </div>
          {expandedSections.hourlyRate && (
            <div className='px-1 py-2'>
              <div className='relative h-2 rounded-full bg-gray-900 mb-4'>
                {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                <div
                  className='absolute inset-y-0 left-0 bg-teal-500 rounded-full'
                  style={{ width: `${hourlyRate}%` }}
                ></div>
                {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                <div
                  className='absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full border-2 border-white bg-teal-500 shadow'
                  style={{ left: `${hourlyRate}%` }}
                ></div>
                <input
                  type='range'
                  min='0'
                  max='100'
                  value={hourlyRate}
                  onChange={handleSliderChange}
                  className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                />
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-700 font-medium'>${minRate}</span>
                <span className='text-gray-700 font-medium'>${maxRate}</span>
              </div>
              <div className='text-center mt-2'>
                <span className='text-teal-600 font-medium'>Selected: ${Math.round(currentRate)}/hr</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='border-t border-gray-100'>
        <div className='p-5'>
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div
            className='flex justify-between items-center mb-4 cursor-pointer'
            onClick={() => toggleSection('rating')}
          >
            <h3 className='text-lg font-medium text-gray-700'>Rating</h3>
            {expandedSections.rating ? (
              <ChevronUp className='h-5 w-5 text-gray-400' />
            ) : (
              <ChevronDown className='h-5 w-5 text-gray-400' />
            )}
          </div>
          {expandedSections.rating && (
            <div className='space-y-3'>
              <label className='flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  className='form-checkbox h-5 w-5 text-teal-500 rounded border-gray-300 focus:ring-teal-500'
                  checked={ratingFilters.fiveStars}
                  onChange={() => toggleRatingFilter('fiveStars')}
                />
                <div className='flex items-center ml-3'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
<svg key={star} className='w-5 h-5 text-yellow-400' fill='currentColor' viewBox='0 0 20 20'>
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                  <span className='ml-2 text-gray-600'>& up</span>
                </div>
              </label>
              <label className='flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  className='form-checkbox h-5 w-5 text-teal-500 rounded border-gray-300 focus:ring-teal-500'
                  checked={ratingFilters.fourStars}
                  onChange={() => toggleRatingFilter('fourStars')}
                />
                <div className='flex items-center ml-3'>
                  {[1, 2, 3, 4].map((star) => (
                    // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
<svg key={star} className='w-5 h-5 text-yellow-400' fill='currentColor' viewBox='0 0 20 20'>
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                  {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                  <svg className='w-5 h-5 text-gray-300' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                  </svg>
                  <span className='ml-2 text-gray-600'>& up</span>
                </div>
              </label>
              <label className='flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  className='form-checkbox h-5 w-5 text-teal-500 rounded border-gray-300 focus:ring-teal-500'
                  checked={ratingFilters.threeStars}
                  onChange={() => toggleRatingFilter('threeStars')}
                />
                <div className='flex items-center ml-3'>
                  {[1, 2, 3].map((star) => (
                    // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
<svg key={star} className='w-5 h-5 text-yellow-400' fill='currentColor' viewBox='0 0 20 20'>
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                  {[1, 2].map((star) => (
                    // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
<svg
                      key={`empty-${star}`}
                      className='w-5 h-5 text-gray-300'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                  <span className='ml-2 text-gray-600'>& up</span>
                </div>
              </label>
              <label className='flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  className='form-checkbox h-5 w-5 text-teal-500 rounded border-gray-300 focus:ring-teal-500'
                  checked={ratingFilters.twoStars}
                  onChange={() => toggleRatingFilter('twoStars')}
                />
                <div className='flex items-center ml-3'>
                  {[1, 2].map((star) => (
                    // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
<svg key={star} className='w-5 h-5 text-yellow-400' fill='currentColor' viewBox='0 0 20 20'>
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                  {[1, 2, 3].map((star) => (
                    // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
<svg
                      key={`empty-${star}`}
                      className='w-5 h-5 text-gray-300'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                  <span className='ml-2 text-gray-600'>& up</span>
                </div>
              </label>
              <label className='flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  className='form-checkbox h-5 w-5 text-teal-500 rounded border-gray-300 focus:ring-teal-500'
                  checked={ratingFilters.oneStar}
                  onChange={() => toggleRatingFilter('oneStar')}
                />
                <div className='flex items-center ml-3'>
                  {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                  <svg className='w-5 h-5 text-yellow-400' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                  </svg>
                  {[1, 2, 3, 4].map((star) => (
                    // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
<svg
                      key={`empty-${star}`}
                      className='w-5 h-5 text-gray-300'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                  <span className='ml-2 text-gray-600'>& up</span>
                </div>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className='border-t border-gray-100'>
        <div className='p-5'>
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div
            className='flex justify-between items-center mb-4 cursor-pointer'
            onClick={() => toggleSection('location')}
          >
            <h3 className='text-lg font-medium text-gray-700'>Location</h3>
            {expandedSections.location ? (
              <ChevronUp className='h-5 w-5 text-gray-400' />
            ) : (
              <ChevronDown className='h-5 w-5 text-gray-400' />
            )}
          </div>
          {expandedSections.location && (
            <div className='relative'>
              {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
              <div
                className='border border-gray-200 rounded-md p-3 flex justify-between items-center cursor-pointer'
                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
              >
                <span className='text-gray-600'>{selectedLocation}</span>
                {locationDropdownOpen ? (
                  <ChevronUp className='h-4 w-4 text-gray-400' />
                ) : (
                  <ChevronDown className='h-4 w-4 text-gray-400' />
                )}
              </div>
              {locationDropdownOpen && (
                <div className='absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg'>
                  <div className='py-2'>
                    {['Any location', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Europe'].map(
                      (location) => (
                        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
<div
                          key={location}
                          className={`px-4 py-2 text-gray-600 cursor-pointer ${
                            location === selectedLocation ? 'bg-white' : 'hover:bg-gray-100'
                          }`}
                          onClick={() => selectLocation(location)}
                        >
                          <div className='flex items-center'>
                            {location === selectedLocation && <Check className='h-4 w-4 text-teal-500 mr-2' />}
                            {location}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

