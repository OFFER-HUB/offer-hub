'use client'

import { useState, useEffect, Suspense } from 'react'
import SearchBar from '@/components/freelancer-search/search-bar'
import FiltersSection from '@/components/freelancer-search/filters-section'
import FreelancerCard from '@/components/freelancer-search/freelancer-card'
import SortingOptions from '@/components/freelancer-search/sorting-options'
import Pagination from '@/components/find-workers/pagination'
import { Header } from '@/components/freelancer-search/header'
import { useServicesApi } from '@/hooks/api-connections/use-services-api'
import { ServiceFilters, FreelancerDisplay } from '@/types/service.types'
import { useSearchParams } from 'next/navigation'

export interface Freelancer {
  id: number
  name: string
  title: string
  rating: number
  reviewCount: number
  location: string
  hourlyRate: number
  description: string
  skills: string[]
  projectsCompleted: number
  responseTime: string
  category: string
}

function FreelancerSearchContent() {
  // Get URL parameters for initial state
  const searchParams = useSearchParams()
  const initialSearchQuery = searchParams.get('q') || ''
  const initialCategory = searchParams.get('category') || ''
  const initialMinPrice = searchParams.get('min') ? parseFloat(searchParams.get('min')!) : undefined
  const initialMaxPrice = searchParams.get('max') ? parseFloat(searchParams.get('max')!) : undefined
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [ratingFilters, setRatingFilters] = useState({
    fiveStars: false,
    fourStars: false,
    threeStars: false,
    twoStars: false,
    oneStar: false,
  })
  const [hourlyRate, setHourlyRate] = useState(50)
  const [selectedLocation, setSelectedLocation] = useState('Any location')
  const [sortBy, setSortBy] = useState('Recommended')
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [currentFilters, setCurrentFilters] = useState<ServiceFilters>({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 10,
    keyword: initialSearchQuery || undefined,
    category: initialCategory || undefined,
    min_price: initialMinPrice,
    max_price: initialMaxPrice,
  })

  // Use the services API hook
  const { services, isLoading, error, pagination, searchServices, clearError } = useServicesApi()

  // Handle search and filter changes
  useEffect(() => {
    const filters: ServiceFilters = {
      page: 1,
      limit: 10
    }

    if (selectedCategory) {
      filters.category = selectedCategory
    }

    if (hourlyRate !== 50) {
      const maxRateValue = 20 + (hourlyRate / 100) * (80 - 20)
      filters.max_price = maxRateValue
    }

    if (searchQuery.trim()) {
      filters.keyword = searchQuery.trim()
    }

    setCurrentFilters(filters)
    searchServices(filters)
  }, [selectedCategory, hourlyRate, searchQuery])

  // Handle pagination
  const handlePageChange = (page: number) => {
    const newFilters = { ...currentFilters, page }
    setCurrentFilters(newFilters)
    searchServices(newFilters)
  }

  const matchingCount = services.length

  const sortFreelancers = (freelancers: FreelancerDisplay[], sortOption: string) => {
    const sorted = [...freelancers]
    
    switch (sortOption) {
      case 'Most Recent':
        return sorted.sort((a, b) => b.id.localeCompare(a.id))
      case 'Highest Rated':
        return sorted.sort((a, b) => {
            if (b.rating === a.rating) {
            return b.reviewCount - a.reviewCount
          }
          return b.rating - a.rating
        })
      case 'Lowest Rate':
        return sorted.sort((a, b) => a.hourlyRate - b.hourlyRate)
      case 'Highest Rate':
        return sorted.sort((a, b) => b.hourlyRate - a.hourlyRate)
      default:
        return sorted.sort((a, b) => {
          const scoreA = a.rating * Math.log10(a.reviewCount + 1)
          const scoreB = b.rating * Math.log10(b.reviewCount + 1)
          return scoreB - scoreA
        })
    }
  }

  const resetAllFilters = () => {
    setSelectedCategory('')
    setRatingFilters({
      fiveStars: false,
      fourStars: false,
      threeStars: false,
      twoStars: false,
      oneStar: false,
    })
    setHourlyRate(50)
    setSelectedLocation('Any location')
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Apply additional filters to services
  const filteredServices = services.filter((service) => {
    // Location filter
    if (selectedLocation !== 'Any location') {
      const normalizedLocation = service.location.toLowerCase();
      const normalizedSelection = selectedLocation.toLowerCase()
        .replace('united kingdom', 'uk')
        .replace('united states', 'usa');
        
      if (!normalizedLocation.includes(normalizedSelection) && 
          !(normalizedSelection === 'usa' && normalizedLocation.includes('us')) &&
          !(normalizedSelection === 'europe' && 
            ['germany', 'spain', 'france', 'italy', 'russia', 'uk'].some(country => 
              normalizedLocation.includes(country)
            ))
         ) {
        return false;
      }
    }

    // Rating filter
    const anyRatingFilterSelected = Object.values(ratingFilters).some((value) => value)
    if (anyRatingFilterSelected) {
      if (ratingFilters.fiveStars && service.rating === 5) return true
      if (ratingFilters.fourStars && service.rating === 4) return true
      if (ratingFilters.threeStars && service.rating === 3) return true
      if (ratingFilters.twoStars && service.rating === 2) return true
      if (ratingFilters.oneStar && service.rating === 1) return true
      return false
    }

    return true
  })

  const sortedAndFiltered = sortFreelancers(filteredServices, sortBy)

  return (
    <div className='min-h-screen flex flex-col'>
      <Header />

      <div className='bg-gradient-to-r from-slate-900 to-teal-700 py-12 px-6'>
        <div className='max-w-7xl mx-auto flex flex-col items-center'>
          <div className='w-full max-w-4xl'>
            <h1 className='text-3xl md:text-4xl font-bold text-white mb-6 text-left'>Find Talented Freelancers</h1>
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </div>

      <main className='flex-1 bg-gray-50 px-6 py-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex flex-col md:flex-row gap-8'>
            <div className='w-full md:w-64 shrink-0'>
              <FiltersSection
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                ratingFilters={ratingFilters}
                setRatingFilters={setRatingFilters}
                hourlyRate={hourlyRate}
                setHourlyRate={setHourlyRate}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                resetAllFilters={resetAllFilters}
              />
            </div>

            <div className='flex-1'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-lg font-medium'>
                  {isLoading ? 'Loading...' : `${pagination?.total_services || matchingCount} freelancers available`}
                </h2>
                <SortingOptions
                  sortOption={sortBy}
                  setSortOption={setSortBy}
                />
              </div>

              {isLoading ? (
                <div className='space-y-6'>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className='animate-pulse'>
                      <div className='bg-white rounded-lg p-6'>
                        <div className='flex items-center space-x-4'>
                          <div className='w-12 h-12 bg-gray-200 rounded-full'></div>
                          <div className='flex-1'>
                            <div className='h-4 bg-gray-200 rounded w-1/4 mb-2'></div>
                            <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                          </div>
                        </div>
                        <div className='mt-4 space-y-2'>
                          <div className='h-3 bg-gray-200 rounded'></div>
                          <div className='h-3 bg-gray-200 rounded w-3/4'></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className='text-center py-12'>
                  <h3 className='text-lg font-medium text-red-600 mb-2'>Error loading services</h3>
                  <p className='text-gray-500'>{error}</p>
                  <button 
                    onClick={() => searchServices({ page: 1, limit: 10 })}
                    className='mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
                  >
                    Try Again
                  </button>
                </div>
              ) : sortedAndFiltered.length === 0 ? (
                <div className='text-center py-12'>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>No services found</h3>
                  <p className='text-gray-500'>Try adjusting your search criteria or filters.</p>
                </div>
              ) : (
                <div className='space-y-6'>
                  {sortedAndFiltered.map((service) => (
                    <FreelancerCard 
                      key={service.id} 
                      freelancer={{
                        id: parseInt(service.id),
                        name: service.name,
                        title: service.title,
                        rating: service.rating,
                        reviewCount: service.reviewCount,
                        location: service.location,
                        hourlyRate: service.hourlyRate,
                        description: service.description,
                        skills: service.skills,
                        projectsCompleted: service.projectsCompleted,
                        responseTime: service.responseTime,
                        category: service.category,
                      }} 
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <Pagination
                  currentPage={pagination.current_page}
                  totalPages={pagination.total_pages}
                  totalItems={pagination.total_services}
                  itemsPerPage={pagination.per_page}
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FreelancerSearchContent />
    </Suspense>
  )
}

