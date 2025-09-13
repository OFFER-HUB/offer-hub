"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, TrendingUp, Clock, Users, Star, Globe } from "lucide-react"
import { LocationData } from "@/types/location.types"
import { useLocationSearch } from "@/hooks/use-location-search"
import { getTimezoneCompatibility, getCurrentTimeInTimezone } from "@/utils/timezone-helpers"

interface LocationSuggestionsProps {
  userTimezone?: string
  onLocationSelect?: (location: LocationData) => void
  showTimezoneCompatibility?: boolean
  maxSuggestions?: number
}

export default function LocationSuggestions({
  userTimezone,
  onLocationSelect,
  showTimezoneCompatibility = true,
  maxSuggestions = 8
}: LocationSuggestionsProps) {
  const [currentTimes, setCurrentTimes] = useState<Record<string, string>>({})
  const { popularLocations, recentLocations } = useLocationSearch()

  // Update times every minute
  useEffect(() => {
    const updateTimes = () => {
      const times: Record<string, string> = {}
      popularLocations.forEach(location => {
        times[location.id] = getCurrentTimeInTimezone(location.timezone)
      })
      setCurrentTimes(times)
    }

    updateTimes()
    const interval = setInterval(updateTimes, 60000)
    return () => clearInterval(interval)
  }, [popularLocations])

  // Suggested locations with market data (mock data)
  const locationSuggestions = [
    {
      location: popularLocations.find(l => l.city === 'San Francisco'),
      freelancerCount: 1247,
      avgRate: 75,
      topSkills: ['React', 'Node.js', 'Python'],
      marketTrend: 'up' as const
    },
    {
      location: popularLocations.find(l => l.city === 'London'),
      freelancerCount: 892,
      avgRate: 68,
      topSkills: ['JavaScript', 'UI/UX', 'PHP'],
      marketTrend: 'up' as const
    },
    {
      location: popularLocations.find(l => l.city === 'Toronto'),
      freelancerCount: 634,
      avgRate: 58,
      topSkills: ['React', 'Python', 'Mobile'],
      marketTrend: 'stable' as const
    },
    {
      location: popularLocations.find(l => l.city === 'Berlin'),
      freelancerCount: 456,
      avgRate: 52,
      topSkills: ['Vue.js', 'DevOps', 'Design'],
      marketTrend: 'up' as const
    },
    {
      location: popularLocations.find(l => l.city === 'Tokyo'),
      freelancerCount: 789,
      avgRate: 62,
      topSkills: ['Mobile', 'AI/ML', 'Java'],
      marketTrend: 'stable' as const
    }
  ].filter(item => item.location)

  const handleLocationClick = (location: LocationData) => {
    onLocationSelect?.(location)
  }

  const renderLocationCard = (
    location: LocationData,
    metadata?: {
      freelancerCount?: number
      avgRate?: number
      topSkills?: string[]
      marketTrend?: 'up' | 'down' | 'stable'
    }
  ) => {
    const compatibility = userTimezone && showTimezoneCompatibility 
      ? getTimezoneCompatibility(userTimezone, location.timezone)
      : null

    return (
      <Card 
        key={location.id}
        className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-[#15949C]/50"
        onClick={() => handleLocationClick(location)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-[#DEEFE7] flex items-center justify-center mr-3">
                <MapPin className="h-4 w-4 text-[#15949C]" />
              </div>
              <div>
                <h4 className="font-medium text-[#002333]">{location.name}</h4>
                <p className="text-xs text-[#002333]/70">{location.country}</p>
              </div>
            </div>
            {metadata?.marketTrend && (
              <div className="flex items-center">
                <TrendingUp className={`h-3 w-3 mr-1 ${
                  metadata.marketTrend === 'up' ? 'text-green-500' : 
                  metadata.marketTrend === 'down' ? 'text-red-500' : 'text-gray-500'
                }`} />
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    metadata.marketTrend === 'up' ? 'text-green-700 border-green-200' :
                    metadata.marketTrend === 'down' ? 'text-red-700 border-red-200' :
                    'text-gray-700 border-gray-200'
                  }`}
                >
                  {metadata.marketTrend === 'up' ? 'Growing' : 
                   metadata.marketTrend === 'down' ? 'Declining' : 'Stable'}
                </Badge>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {/* Time and timezone compatibility */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-[#002333]/70">
                <Clock className="h-3 w-3 mr-1" />
                {currentTimes[location.id] || 'Loading...'}
              </div>
              {compatibility && (
                <Badge 
                  className={`text-xs ${
                    compatibility.score >= 4 ? 'bg-green-100 text-green-800' :
                    compatibility.score >= 3 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}
                >
                  {compatibility.label}
                </Badge>
              )}
            </div>

            {/* Market info */}
            {metadata && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-[#002333]/70">
                  <Users className="h-3 w-3 mr-1" />
                  {metadata.freelancerCount} freelancers
                </div>
                <div className="text-[#15949C] font-medium">
                  ${metadata.avgRate}/hr avg
                </div>
              </div>
            )}

            {/* Top skills */}
            {metadata?.topSkills && (
              <div className="flex flex-wrap gap-1 mt-2">
                {metadata.topSkills.slice(0, 3).map(skill => (
                  <Badge key={skill} variant="outline" className="text-xs py-0">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Recent searches */}
      {recentLocations.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[#002333] mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-2 text-[#15949C]" />
            Recent Searches
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentLocations.slice(0, 3).map(location => 
              renderLocationCard(location)
            )}
          </div>
        </div>
      )}

      {recentLocations.length > 0 && <Separator />}

      {/* Popular locations with market data */}
      <div>
        <h3 className="text-sm font-medium text-[#002333] mb-3 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2 text-[#15949C]" />
          Popular Freelancer Markets
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {locationSuggestions.slice(0, maxSuggestions).map(({ location, ...metadata }) => 
            location ? renderLocationCard(location, metadata) : null
          )}
        </div>
      </div>

      <Separator />

      {/* Browse all locations */}
      <div>
        <h3 className="text-sm font-medium text-[#002333] mb-3 flex items-center">
          <Globe className="h-4 w-4 mr-2 text-[#15949C]" />
          Browse by Region
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { region: 'North America', count: 2843, flag: '🇺🇸' },
            { region: 'Europe', count: 1967, flag: '🇪🇺' },
            { region: 'Asia Pacific', count: 1534, flag: '🌏' },
            { region: 'Latin America', count: 892, flag: '🌎' },
            { region: 'Middle East', count: 456, flag: '🕌' },
            { region: 'Africa', count: 234, flag: '🌍' },
            { region: 'Oceania', count: 178, flag: '🇦🇺' },
            { region: 'Caribbean', count: 123, flag: '🏝️' }
          ].map(region => (
            <Button
              key={region.region}
              variant="outline"
              className="h-auto p-3 flex flex-col items-center text-center hover:border-[#15949C] hover:text-[#15949C]"
            >
              <span className="text-lg mb-1">{region.flag}</span>
              <span className="text-xs font-medium">{region.region}</span>
              <span className="text-xs text-[#002333]/70">{region.count} freelancers</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Timezone compatibility notice */}
      {userTimezone && showTimezoneCompatibility && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start">
            <Clock className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                Timezone Compatibility
              </p>
              <p className="text-xs text-blue-700">
                Locations are ranked by timezone compatibility with your current location. 
                Green badges indicate excellent overlap for real-time collaboration.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}