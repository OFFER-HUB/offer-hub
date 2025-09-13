"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { MapPin, Star, MessageSquare, Heart, Check, Maximize2, Minimize2, Filter, Users } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { LocationData } from "@/types/location.types"
import { FreelancerDisplay } from "@/types/service.types"
import { calculateDistance } from "@/utils/geographic-calculations" 

interface LocationMapViewProps {
  freelancers: FreelancerDisplay[]
  selectedLocation?: LocationData | null
  searchRadius?: number
  selectedFreelancers: string[]
  onFreelancerSelect?: (freelancerId: string) => void
  onFreelancerView?: (freelancer: FreelancerDisplay) => void
  className?: string
}

export default function LocationMapView({
  freelancers,
  selectedLocation,
  searchRadius = 50,
  selectedFreelancers,
  onFreelancerSelect,
  onFreelancerView,
  className = ""
}: LocationMapViewProps) {
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [clusteredView, setClusteredView] = useState(true)
  const mapRef = useRef<HTMLDivElement>(null)

  // Filter freelancers within radius if location is selected
  const filteredFreelancers = selectedLocation 
    ? freelancers.filter(freelancer => {
        if (!freelancer.coordinates) return false
        const distance = calculateDistance(
          selectedLocation.coordinates.lat,
          selectedLocation.coordinates.lng,
          freelancer.coordinates.lat,
          freelancer.coordinates.lng
        )
        return distance <= searchRadius
      })
    : freelancers

  // Cluster nearby freelancers for better visualization
  const clusterFreelancers = (freelancers: FreelancerDisplay[]) => {
    if (!clusteredView) return freelancers.map(f => ({ ...f, cluster: false, clusterCount: 1 }))
    
    const clusters: Array<FreelancerDisplay & { cluster: boolean; clusterCount: number }> = []
    const processed = new Set<string>()
    
    freelancers.forEach(freelancer => {
      if (processed.has(freelancer.id) || !freelancer.coordinates) return
      
      const nearby = freelancers.filter(other => {
        if (other.id === freelancer.id || processed.has(other.id) || !other.coordinates) return false
        const distance = calculateDistance(
          freelancer.coordinates!.lat,
          freelancer.coordinates!.lng,
          other.coordinates.lat,
          other.coordinates.lng
        )
        return distance <= 10 // Cluster within 10km
      })
      
      if (nearby.length > 0) {
        clusters.push({
          ...freelancer,
          cluster: true,
          clusterCount: nearby.length + 1
        })
        processed.add(freelancer.id)
        nearby.forEach(f => processed.add(f.id))
      } else {
        clusters.push({
          ...freelancer,
          cluster: false,
          clusterCount: 1
        })
        processed.add(freelancer.id)
      }
    })
    
    return clusters
  }

  const clusteredFreelancers = clusterFreelancers(filteredFreelancers)

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        />
      ))
  }

  const generateMapPosition = (index: number, total: number) => {
    // Generate positions in a more organized grid pattern
    const cols = Math.ceil(Math.sqrt(total))
    const row = Math.floor(index / cols)
    const col = index % cols
    
    const padding = 15
    const width = 100 - (2 * padding)
    const height = 100 - (2 * padding)
    
    const top = padding + (row * (height / Math.ceil(total / cols)))
    const left = padding + (col * (width / cols))
    
    return { top: `${Math.min(top, 85)}%`, left: `${Math.min(left, 85)}%` }
  }

  return (
    <div className={`relative ${className}`}>
      <Card className={`overflow-hidden transition-all duration-300 ${isFullScreen ? 'fixed inset-4 z-50' : 'h-[600px]'}`}>
        <CardContent className="p-0 h-full">
          {/* Map Header */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-white/95 backdrop-blur-sm border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#15949C]" />
                <div>
                  <h3 className="font-medium text-[#002333]">
                    {selectedLocation ? selectedLocation.name : "Global Map"}
                  </h3>
                  <p className="text-sm text-[#002333]/70">
                    {filteredFreelancers.length} freelancers
                    {selectedLocation && searchRadius && ` within ${searchRadius}km`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setClusteredView(!clusteredView)}
                  className="h-8"
                >
                  <Users className="h-4 w-4 mr-1" />
                  {clusteredView ? "Uncluster" : "Cluster"}
                </Button>
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-8"
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="h-8 w-8 p-0"
                >
                  {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div ref={mapRef} className="relative w-full h-full bg-gradient-to-br from-blue-50 to-green-50">
            {/* Selected Location Center */}
            {selectedLocation && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ top: '50%', left: '50%' }}
              >
                <div className="relative">
                  <div className="h-6 w-6 rounded-full bg-[#15949C] border-2 border-white shadow-lg flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  {searchRadius && (
                    <div 
                      className="absolute rounded-full border-2 border-[#15949C]/30 bg-[#15949C]/10 transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        width: `${Math.min(searchRadius * 2, 200)}px`,
                        height: `${Math.min(searchRadius * 2, 200)}px`,
                        top: '50%',
                        left: '50%'
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Freelancer Markers */}
            {clusteredFreelancers.map((freelancer, index) => {
              const position = generateMapPosition(index, clusteredFreelancers.length)
              const isSelected = selectedMarker === freelancer.id
              const isChosenFreelancer = selectedFreelancers.includes(freelancer.id)

              return (
                <div key={freelancer.id}>
                  <motion.div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-15"
                    style={position}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMarker(isSelected ? null : freelancer.id)}
                  >
                    <div className={`relative`}>
                      {freelancer.cluster ? (
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-all
                          ${isSelected ? 'bg-[#15949C] scale-110' : 'bg-[#15949C]/80 hover:bg-[#15949C]'}
                          ${isChosenFreelancer ? 'ring-2 ring-yellow-400' : ''}
                        `}>
                          {freelancer.clusterCount}
                        </div>
                      ) : (
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg transition-all
                          ${isSelected ? 'bg-[#15949C] scale-110' : 'bg-[#15949C]/80 hover:bg-[#15949C]'}
                          ${isChosenFreelancer ? 'ring-2 ring-yellow-400' : ''}
                        `}>
                          ${freelancer.hourlyRate}
                        </div>
                      )}
                      
                      {freelancer.isTopRated && (
                        <div className="absolute -top-1 -right-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Freelancer Details Popup */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute z-30 w-80"
                        style={{
                          top: position.top,
                          left: position.left,
                          transform: 'translate(-50%, calc(-100% - 10px))'
                        }}
                      >
                        <Card className="shadow-xl border-2 border-[#15949C]/20">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-12 w-12 border-2 border-[#15949C]/20">
                                <AvatarImage src="" alt={freelancer.name} />
                                <AvatarFallback className="bg-[#15949C]/20 text-[#15949C]">
                                  {freelancer.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-semibold text-[#002333] truncate">
                                    {freelancer.name}
                                  </h4>
                                  <span className="font-bold text-[#15949C] text-lg">
                                    ${freelancer.hourlyRate}/hr
                                  </span>
                                </div>

                                <p className="text-sm text-[#002333]/70 mb-2 truncate">
                                  {freelancer.title}
                                </p>

                                <div className="flex items-center mb-2">
                                  <div className="flex mr-1">{renderStars(freelancer.rating)}</div>
                                  <span className="text-sm text-[#002333] mr-1">{freelancer.rating}</span>
                                  <span className="text-sm text-[#002333]/70">
                                    ({freelancer.reviewCount} reviews)
                                  </span>
                                </div>

                                <div className="flex items-center mb-3 text-sm text-[#002333]/70">
                                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">{freelancer.location}</span>
                                  {freelancer.timezone && (
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      {freelancer.timezone}
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-1 mb-3">
                                  {freelancer.skills.slice(0, 3).map((skill) => (
                                    <Badge 
                                      key={skill} 
                                      variant="outline" 
                                      className="text-xs py-0"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                  {freelancer.skills.length > 3 && (
                                    <Badge variant="outline" className="text-xs py-0">
                                      +{freelancer.skills.length - 3}
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="flex-1 h-8 text-xs bg-[#15949C] hover:bg-[#15949C]/90"
                                    onClick={() => onFreelancerView?.(freelancer)}
                                  >
                                    View Profile
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-2"
                                    onClick={() => onFreelancerSelect?.(freelancer.id)}
                                  >
                                    {isChosenFreelancer ? (
                                      <Check className="h-3 w-3" />
                                    ) : (
                                      <Heart className="h-3 w-3" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-2"
                                  >
                                    <MessageSquare className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          {/* Map Stats */}
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <div className="flex items-center justify-between">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-[#15949C]"></div>
                    <span className="text-[#002333]/70">
                      {filteredFreelancers.length} freelancers
                    </span>
                  </div>
                  {selectedFreelancers.length > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                      <span className="text-[#002333]/70">
                        {selectedFreelancers.length} selected
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {selectedLocation && (
                <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                  <div className="text-sm text-[#002333]/70">
                    Within {searchRadius}km of {selectedLocation.name}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Click outside to close popup */}
          {selectedMarker && (
            <div 
              className="absolute inset-0 z-10"
              onClick={() => setSelectedMarker(null)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}