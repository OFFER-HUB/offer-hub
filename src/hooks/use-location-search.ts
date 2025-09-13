import { useState, useCallback, useRef } from 'react'
import { LocationData } from '@/types/location.types'

// Mock location data - in a real app, this would come from a geocoding service
const mockLocations: LocationData[] = [
  {
    id: 'sf-usa',
    name: 'San Francisco',
    fullName: 'San Francisco, California, United States',
    displayName: 'San Francisco, CA, USA',
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    timezone: 'America/Los_Angeles',
    coordinates: { lat: 37.7749, lng: -122.4194 }
  },
  {
    id: 'london-uk',
    name: 'London',
    fullName: 'London, England, United Kingdom',
    displayName: 'London, UK',
    country: 'United Kingdom',
    state: 'England',
    city: 'London',
    timezone: 'Europe/London',
    coordinates: { lat: 51.5074, lng: -0.1278 }
  },
  {
    id: 'toronto-ca',
    name: 'Toronto',
    fullName: 'Toronto, Ontario, Canada',
    displayName: 'Toronto, ON, Canada',
    country: 'Canada',
    state: 'Ontario',
    city: 'Toronto',
    timezone: 'America/Toronto',
    coordinates: { lat: 43.6532, lng: -79.3832 }
  },
  {
    id: 'berlin-de',
    name: 'Berlin',
    fullName: 'Berlin, Germany',
    displayName: 'Berlin, Germany',
    country: 'Germany',
    state: 'Berlin',
    city: 'Berlin',
    timezone: 'Europe/Berlin',
    coordinates: { lat: 52.5200, lng: 13.4050 }
  },
  {
    id: 'tokyo-jp',
    name: 'Tokyo',
    fullName: 'Tokyo, Japan',
    displayName: 'Tokyo, Japan',
    country: 'Japan',
    state: 'Tokyo',
    city: 'Tokyo',
    timezone: 'Asia/Tokyo',
    coordinates: { lat: 35.6762, lng: 139.6503 }
  },
  {
    id: 'sydney-au',
    name: 'Sydney',
    fullName: 'Sydney, New South Wales, Australia',
    displayName: 'Sydney, NSW, Australia',
    country: 'Australia',
    state: 'New South Wales',
    city: 'Sydney',
    timezone: 'Australia/Sydney',
    coordinates: { lat: -33.8688, lng: 151.2093 }
  },
  {
    id: 'mumbai-in',
    name: 'Mumbai',
    fullName: 'Mumbai, Maharashtra, India',
    displayName: 'Mumbai, India',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    timezone: 'Asia/Kolkata',
    coordinates: { lat: 19.0760, lng: 72.8777 }
  },
  {
    id: 'seoul-kr',
    name: 'Seoul',
    fullName: 'Seoul, South Korea',
    displayName: 'Seoul, South Korea',
    country: 'South Korea',
    state: 'Seoul',
    city: 'Seoul',
    timezone: 'Asia/Seoul',
    coordinates: { lat: 37.5665, lng: 126.9780 }
  },
  {
    id: 'madrid-es',
    name: 'Madrid',
    fullName: 'Madrid, Spain',
    displayName: 'Madrid, Spain',
    country: 'Spain',
    state: 'Madrid',
    city: 'Madrid',
    timezone: 'Europe/Madrid',
    coordinates: { lat: 40.4168, lng: -3.7038 }
  },
  {
    id: 'sao-paulo-br',
    name: 'São Paulo',
    fullName: 'São Paulo, Brazil',
    displayName: 'São Paulo, Brazil',
    country: 'Brazil',
    state: 'São Paulo',
    city: 'São Paulo',
    timezone: 'America/Sao_Paulo',
    coordinates: { lat: -23.5505, lng: -46.6333 }
  }
]

const popularLocations: LocationData[] = [
  mockLocations.find(l => l.id === 'sf-usa')!,
  mockLocations.find(l => l.id === 'london-uk')!,
  mockLocations.find(l => l.id === 'toronto-ca')!,
  mockLocations.find(l => l.id === 'berlin-de')!,
  mockLocations.find(l => l.id === 'tokyo-jp')!,
]

export function useLocationSearch() {
  const [suggestions, setSuggestions] = useState<LocationData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [recentLocations, setRecentLocations] = useState<LocationData[]>(() => {
    // In a real app, this would come from localStorage or user preferences
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('recent-locations')
        return saved ? JSON.parse(saved) : []
      } catch {
        return []
      }
    }
    return []
  })
  
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    // Simulate API delay
    searchTimeout.current = setTimeout(() => {
      try {
        // Mock search - in a real app, this would call a geocoding API
        const filtered = mockLocations.filter(location => 
          location.name.toLowerCase().includes(query.toLowerCase()) ||
          location.fullName.toLowerCase().includes(query.toLowerCase()) ||
          location.country.toLowerCase().includes(query.toLowerCase()) ||
          (location.state && location.state.toLowerCase().includes(query.toLowerCase()))
        )
        
        // Sort by relevance (name match first, then other matches)
        const sorted = filtered.sort((a, b) => {
          const aNameMatch = a.name.toLowerCase().startsWith(query.toLowerCase())
          const bNameMatch = b.name.toLowerCase().startsWith(query.toLowerCase())
          
          if (aNameMatch && !bNameMatch) return -1
          if (!aNameMatch && bNameMatch) return 1
          
          return a.name.localeCompare(b.name)
        })

        setSuggestions(sorted.slice(0, 8)) // Limit to 8 suggestions
      } catch (error) {
        console.error('Error searching locations:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 200)
  }, [])

  const clearSearch = useCallback(() => {
    setSuggestions([])
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
  }, [])

  const addToRecentLocations = useCallback((location: LocationData) => {
    setRecentLocations(prev => {
      const filtered = prev.filter(l => l.id !== location.id)
      const updated = [location, ...filtered].slice(0, 5) // Keep last 5
      
      // Save to localStorage in a real app
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('recent-locations', JSON.stringify(updated))
        } catch (error) {
          console.error('Error saving recent locations:', error)
        }
      }
      
      return updated
    })
  }, [])

  const getLocationById = useCallback((id: string): LocationData | undefined => {
    return mockLocations.find(location => location.id === id)
  }, [])

  const searchByCoordinates = useCallback(async (lat: number, lng: number): Promise<LocationData | null> => {
    // Mock reverse geocoding - in a real app, this would call a reverse geocoding API
    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
      
      // Find the closest location (this is a very basic implementation)
      let closest: LocationData | null = null
      let minDistance = Infinity
      
      mockLocations.forEach(location => {
        const distance = Math.sqrt(
          Math.pow(location.coordinates.lat - lat, 2) + 
          Math.pow(location.coordinates.lng - lng, 2)
        )
        
        if (distance < minDistance) {
          minDistance = distance
          closest = location
        }
      })
      
      return closest
    } catch (error) {
      console.error('Error reverse geocoding:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getCurrentLocation = useCallback((): Promise<LocationData | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          const location = await searchByCoordinates(latitude, longitude)
          resolve(location)
        },
        (error) => {
          console.error('Error getting current location:', error)
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }, [searchByCoordinates])

  return {
    suggestions,
    isLoading,
    recentLocations,
    popularLocations,
    searchLocations,
    clearSearch,
    addToRecentLocations,
    getLocationById,
    searchByCoordinates,
    getCurrentLocation
  }
}