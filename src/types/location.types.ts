export interface Coordinates {
    lat: number
    lng: number
  }
  
  export interface LocationData {
    id: string
    name: string
    fullName: string
    displayName: string
    country: string
    state?: string
    city: string
    timezone: string
    coordinates: Coordinates
  }
  
  export interface LocationSearchResult extends LocationData {
    relevanceScore: number
    matchType: 'exact' | 'partial' | 'fuzzy'
  }
  
  export interface LocationFilter {
    countries?: string[]
    states?: string[]
    cities?: string[]
    timezones?: string[]
    coordinates?: {
      center: Coordinates
      radius: number
      unit: 'km' | 'miles'
    }
  }
  
  export interface MarketInfo {
    freelancerCount: number
    avgHourlyRate: number
    topSkills: string[]
    marketTrend: 'up' | 'down' | 'stable'
    competitiveness: 'low' | 'medium' | 'high'
  }
  
  export interface LocationSuggestion extends LocationData {
    marketInfo?: MarketInfo
    timezoneCompatibility?: {
      score: number
      label: string
      businessHoursOverlap: number
    }
  }
  
  // Extended freelancer type with location data
  export interface FreelancerWithLocation {
    id: string
    name: string
    title: string
    location: string
    coordinates?: Coordinates
    timezone?: string
    hourlyRate: number
    rating: number
    reviewCount: number
    skills: string[]
    isTopRated: boolean
    isOnline?: boolean
    isVerified?: boolean
  }

  