'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, Menu, User, Filter, Grid, List, Map, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import TalentFilters from '@/components/find-workers/talent-filters'
import TalentGridView from '@/components/find-workers/talent-grid-view'
import TalentListView from '@/components/find-workers/talent-list-view'
import TalentMapView from '@/components/find-workers/talent-map-view'
import TalentCompare from '@/components/find-workers/talent-compare'
import TalentMarketInsights from '@/components/find-workers/talent-market-insights'
import TalentCategories from '@/components/find-workers/talent-categories'
import TalentFeatured from '@/components/find-workers/talent-featured'
import TalentDetailDialog from '@/components/find-workers/talent-detail-dialog'
import Pagination from '@/components/find-workers/pagination'
import Link from 'next/link'
import { useServicesApi } from '@/hooks/api-connections/use-services-api'
import { ServiceFilters, FreelancerDisplay } from '@/types/service.types'
import { useSearchParams } from 'next/navigation'

// Simple Header component defined inline
function SimpleHeader() {
  return (
    <header className='border-b border-gray-200 bg-white'>
      <div className='container mx-auto px-4 max-w-7xl'>
        <div className='flex h-16 items-center justify-between'>
          <div className='flex items-center'>
            <Link href='/' className='flex items-center'>
              <span className='text-xl font-bold text-[#15949C]'>Offer Hub</span>
            </Link>
            <nav className='ml-10 hidden space-x-8 md:flex'>
              <Link href='/find-workers' className='text-[#15949C] font-medium'>
                Find Talent
              </Link>
              <Link href='/post-project' className='text-[#002333] hover:text-[#15949C]'>
                Post a Project
              </Link>
              <Link href='/my-chats' className='text-[#002333] hover:text-[#15949C]'>
                Messages
              </Link>
              <Link href='/payments' className='text-[#002333] hover:text-[#15949C]'>
                Payments
              </Link>
            </nav>
          </div>
          <div className='flex items-center space-x-4'>
            <Button variant='ghost' size='icon' className='text-[#002333]'>
              <Search className='h-5 w-5' />
            </Button>
            <Button variant='ghost' size='icon' className='text-[#002333]'>
              <Bell className='h-5 w-5' />
            </Button>
            <Button variant='ghost' size='icon' className='text-[#002333]'>
              <User className='h-5 w-5' />
            </Button>
            <Button variant='ghost' size='icon' className='md:hidden text-[#002333]'>
              <Menu className='h-5 w-5' />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

// Simple Footer component defined inline
function SimpleFooter() {
  return (
    <footer className='bg-[#002333] text-white py-8'>
      <div className='container mx-auto px-4 max-w-7xl'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          <div>
            <h3 className='text-lg font-bold mb-4'>Offer Hub</h3>
            <p className='text-sm text-gray-300'>Connect with top freelancers and clients for your next project.</p>
          </div>
          <div>
            <h4 className='font-medium mb-4'>For Freelancers</h4>
            <ul className='space-y-2 text-sm text-gray-300'>
              <li>
                <a href='#' className='hover:text-white'>
                  Find Work
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white'>
                  Create Profile
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white'>
                  Success Stories
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className='font-medium mb-4'>For Clients</h4>
            <ul className='space-y-2 text-sm text-gray-300'>
              <li>
                <a href='#' className='hover:text-white'>
                  Post a Project
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white'>
                  Find Talent
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white'>
                  How It Works
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className='font-medium mb-4'>Support</h4>
            <ul className='space-y-2 text-sm text-gray-300'>
              <li>
                <a href='#' className='hover:text-white'>
                  Help Center
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white'>
                  Contact Us
                </a>
              </li>
              <li>
                <a href='#' className='hover:text-white'>
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className='border-t border-gray-700 mt-8 pt-8 text-center'>
          <p className='text-sm text-gray-300'>&copy; 2024 Offer Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default function FindWorkersPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid')
  const [isFilterOpen, setIsFilterOpen] = useState(true)
  const [selectedFreelancers, setSelectedFreelancers] = useState<string[]>([])
  const [showCompare, setShowCompare] = useState(false)
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerDisplay | null>(null)
  
  // Get URL parameters for initial state
  const searchParams = useSearchParams()
  const initialSearchQuery = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  
  const [currentFilters, setCurrentFilters] = useState<ServiceFilters>({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 10,
    keyword: initialSearchQuery || undefined,
    category: searchParams.get('category') || undefined,
    min_price: searchParams.get('min') ? parseFloat(searchParams.get('min')!) : undefined,
    max_price: searchParams.get('max') ? parseFloat(searchParams.get('max')!) : undefined,
  })

  // Use the services API hook
  const { services, isLoading, error, pagination, searchServices, clearError } = useServicesApi()

  // Handle search query changes with debouncing
  useEffect(() => {
    const filters = { ...currentFilters }
    if (searchQuery.trim()) {
      filters.keyword = searchQuery.trim()
    } else {
      delete filters.keyword
    }
    setCurrentFilters(filters)
    searchServices(filters)
  }, [searchQuery])

  // Handle filter changes
  const handleFiltersChange = (filters: ServiceFilters) => {
    setCurrentFilters(filters)
    searchServices(filters)
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    const newFilters = { ...currentFilters, page }
    setCurrentFilters(newFilters)
    searchServices(newFilters)
  }

  const toggleFreelancerSelection = (id: string) => {
    if (selectedFreelancers.includes(id)) {
      setSelectedFreelancers(selectedFreelancers.filter((freelancerId) => freelancerId !== id))
    } else {
      if (selectedFreelancers.length < 3) {
        setSelectedFreelancers([...selectedFreelancers, id])
      }
    }
  }

  const clearSelectedFreelancers = () => {
    setSelectedFreelancers([])
    setShowCompare(false)
  }

  const toggleCompare = () => {
    if (selectedFreelancers.length > 1) {
      setShowCompare(!showCompare)
    }
  }

  const openFreelancerDetail = (freelancer: FreelancerDisplay) => {
    setSelectedFreelancer(freelancer)
  }

  const closeFreelancerDetail = () => {
    setSelectedFreelancer(null)
  }

  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <SimpleHeader />

      <main className='flex-1'>
        <div className='bg-gradient-to-r from-[#002333] to-[#15949C] text-white py-10'>
          <div className='container mx-auto px-4 max-w-7xl'>
            <div className='max-w-3xl mx-auto text-center'>
              <h1 className='text-3xl md:text-4xl font-bold mb-4'>Find Expert Freelancers for Your Project</h1>
              <p className='text-lg opacity-90 mb-8'>
                Connect with skilled professionals ready to bring your ideas to life
              </p>
              <div className='relative'>
                <Input
                  type='text'
                  placeholder='Search for skills, expertise, or job titles...'
                  className='pl-10 pr-4 py-6 rounded-full text-[#002333] text-lg'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
                <Button className='absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-[#15949C] hover:bg-[#15949C]/90 px-6'>
                  Search
                </Button>
              </div>
              <div className='flex flex-wrap justify-center gap-2 mt-4'>
                <Badge className='bg-white/20 hover:bg-white/30 cursor-pointer'>Web Development</Badge>
                <Badge className='bg-white/20 hover:bg-white/30 cursor-pointer'>UI/UX Design</Badge>
                <Badge className='bg-white/20 hover:bg-white/30 cursor-pointer'>Mobile Development</Badge>
                <Badge className='bg-white/20 hover:bg-white/30 cursor-pointer'>Content Writing</Badge>
                <Badge className='bg-white/20 hover:bg-white/30 cursor-pointer'>Digital Marketing</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className='container mx-auto px-4 py-8 max-w-7xl'>
          {/* Compare bar */}
          {selectedFreelancers.length > 0 && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 py-4 px-6'
            >
              <div className='container mx-auto max-w-7xl flex items-center justify-between'>
                <div className='flex items-center'>
                  <span className='font-medium text-[#002333] mr-4'>
                    {selectedFreelancers.length} freelancer{selectedFreelancers.length > 1 ? 's' : ''} selected
                  </span>
                  <div className='flex -space-x-2'>
                    {selectedFreelancers.map((id) => (
                      <div
                        key={id}
                        className='h-10 w-10 rounded-full bg-[#DEEFE7] border-2 border-white flex items-center justify-center'
                      >
                        <span className='font-medium text-[#15949C]'>{id.charAt(0).toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='flex gap-3'>
                  <Button
                    variant='outline'
                    onClick={clearSelectedFreelancers}
                    className='border-red-500 text-red-500 hover:bg-red-50'
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={toggleCompare}
                    disabled={selectedFreelancers.length < 2}
                    className={`${selectedFreelancers.length < 2 ? 'bg-gray-400' : 'bg-[#15949C] hover:bg-[#15949C]/90'}`}
                  >
                    Compare Freelancers
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Main content */}
          <div className='flex flex-col lg:flex-row gap-6 mt-6'>
            {/* Filters sidebar */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className='lg:w-80 shrink-0'
                >
                  <TalentFilters 
                    onFiltersChange={handleFiltersChange}
                    currentFilters={currentFilters}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main content area */}
            <div className='flex-1'>
              <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6'>
                <div className='flex items-center'>
                  <Button variant='ghost' size='sm' onClick={() => setIsFilterOpen(!isFilterOpen)} className='mr-2'>
                    {isFilterOpen ? <X className='h-4 w-4 mr-2' /> : <Filter className='h-4 w-4 mr-2' />}
                    {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
                  </Button>
                  <Separator orientation='vertical' className='h-6 mx-2' />
                  <span className='text-sm text-[#002333]/70'>
                    {isLoading ? 'Loading...' : `${pagination?.total_services || services.length} freelancers found`}
                  </span>
                  {error && (
                    <span className='text-sm text-red-500 ml-2'>
                      Error: {error}
                    </span>
                  )}
                </div>

                <div className='flex items-center gap-2'>
                  <Select defaultValue='relevance'>
                    <SelectTrigger className='w-[180px]'>
                      <SelectValue placeholder='Sort by' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='relevance'>Relevance</SelectItem>
                      <SelectItem value='rating'>Highest Rating</SelectItem>
                      <SelectItem value='reviews'>Most Reviews</SelectItem>
                      <SelectItem value='newest'>Newest</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className='border rounded-md p-1 flex'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className={`h-8 w-8 ${viewMode === 'grid' ? 'bg-[#DEEFE7] text-[#15949C]' : ''}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className={`h-8 w-8 ${viewMode === 'list' ? 'bg-[#DEEFE7] text-[#15949C]' : ''}`}
                      onClick={() => setViewMode('list')}
                    >
                      <List className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className={`h-8 w-8 ${viewMode === 'map' ? 'bg-[#DEEFE7] text-[#15949C]' : ''}`}
                      onClick={() => setViewMode('map')}
                    >
                      <Map className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>

              {/* View content based on selected view mode */}
              <AnimatePresence mode='wait'>
                {isLoading ? (
                  <motion.div
                    key='loading'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='flex flex-col items-center justify-center py-20'
                  >
                    <div className='w-16 h-16 border-4 border-[#DEEFE7] border-t-[#15949C] rounded-full animate-spin mb-4'></div>
                    <p className='text-[#002333] font-medium'>Finding the best talent for you...</p>
                  </motion.div>
                ) : (
                  <>
                    {viewMode === 'grid' && (
                      <motion.div key='grid' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <TalentGridView
                          services={services}
                          selectedFreelancers={selectedFreelancers}
                          toggleFreelancerSelection={toggleFreelancerSelection}
                          openFreelancerDetail={openFreelancerDetail}
                          isLoading={isLoading}
                        />
                      </motion.div>
                    )}

                    {viewMode === 'list' && (
                      <motion.div key='list' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <TalentListView
                          selectedFreelancers={selectedFreelancers}
                          toggleFreelancerSelection={toggleFreelancerSelection}
                          openFreelancerDetail={openFreelancerDetail}
                        />
                      </motion.div>
                    )}

                    {viewMode === 'map' && (
                      <motion.div key='map' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <TalentMapView
                          selectedFreelancers={selectedFreelancers}
                          toggleFreelancerSelection={toggleFreelancerSelection}
                          openFreelancerDetail={openFreelancerDetail}
                        />
                      </motion.div>
                    )}
                  </>
                )}
              </AnimatePresence>

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

          {/* Market Insights Section */}
          <div className='mt-16'>
            <h2 className='text-2xl font-bold text-[#002333] mb-6'>Talent Market Insights</h2>
            <TalentMarketInsights />
          </div>

          {/* Popular Categories */}
          <div className='mt-16'>
            <h2 className='text-2xl font-bold text-[#002333] mb-6'>Browse Talent by Category</h2>
            <TalentCategories />
          </div>

          {/* Featured Freelancers */}
          <div className='mt-16'>
            <h2 className='text-2xl font-bold text-[#002333] mb-6'>Featured Talent</h2>
            <TalentFeatured
              selectedFreelancers={selectedFreelancers}
              toggleFreelancerSelection={toggleFreelancerSelection}
              openFreelancerDetail={openFreelancerDetail}
            />
          </div>
        </div>
      </main>

      <SimpleFooter />

      {/* Compare Dialog */}
      {showCompare && (
        <TalentCompare
          selectedFreelancers={selectedFreelancers}
          onClose={() => setShowCompare(false)}
          clearSelection={clearSelectedFreelancers}
        />
      )}

      {/* Freelancer Detail Dialog */}
      {selectedFreelancer && (
        <TalentDetailDialog
          freelancer={selectedFreelancer}
          onClose={closeFreelancerDetail}
          isSelected={selectedFreelancers.includes(String(selectedFreelancer.id))}
          onToggleSelect={() => toggleFreelancerSelection(String(selectedFreelancer.id))}
        />
      )}
    </div>
  )
}

