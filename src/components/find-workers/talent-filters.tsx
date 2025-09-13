"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, ChevronDown, ChevronUp, X, RefreshCw, Clock, DollarSign, Globe, Award, Briefcase, MapPin } from "lucide-react"
import { ServiceFilters } from "@/types/service.types"
import { LocationData } from "@/types/location.types"
import LocationSearch from "@/components/find-workers/location-search"
import TimezoneFilter from "@/components/find-workers/timezone-filter"

interface TalentFiltersProps {
  onFiltersChange?: (filters: ServiceFilters & { location?: LocationData; searchRadius?: number; timezones?: string[] }) => void;
  currentFilters?: ServiceFilters & { location?: LocationData; searchRadius?: number; timezones?: string[] };
}

export default function TalentFilters({ onFiltersChange, currentFilters }: TalentFiltersProps) {
  const [priceRange, setPriceRange] = useState([25, 75])
  const [experienceLevel, setExperienceLevel] = useState<string[]>([])
  const [availability, setAvailability] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [isOnlineNow, setIsOnlineNow] = useState(false)
  const [hasVerifiedId, setHasVerifiedId] = useState(false)
  const [topRatedOnly, setTopRatedOnly] = useState(false)
  
  // New location and timezone states
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(currentFilters?.location || null)
  const [searchRadius, setSearchRadius] = useState(currentFilters?.searchRadius || 50)
  const [selectedTimezones, setSelectedTimezones] = useState<string[]>(currentFilters?.timezones || [])
  const [showCompatibilityOnly, setShowCompatibilityOnly] = useState(false)
  const [activeFilterTab, setActiveFilterTab] = useState("basic")
  
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    price: false,
    experience: false,
    availability: false,
    languages: false,
    skills: false,
    location: false,
    timezone: false,
    other: false,
  })

  // Ref to track if we're updating from parent
  const isUpdatingFromParent = useRef(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize filters from currentFilters prop
  useEffect(() => {
    if (currentFilters && !isUpdatingFromParent.current) {
      if (currentFilters.min_price !== undefined && currentFilters.max_price !== undefined) {
        const newPriceRange = [currentFilters.min_price, currentFilters.max_price]
        setPriceRange(newPriceRange)
      }
      
      // Map category back to experience level if present
      if (currentFilters.category) {
        const categoryMap: Record<string, string> = {
          'development': 'entry',
          'design': 'intermediate',
          'business': 'expert'
        }
        const experience = categoryMap[currentFilters.category]
        if (experience) {
          setExperienceLevel([experience])
        }
      }

      // Initialize location and timezone data
      if (currentFilters.location) {
        setSelectedLocation(currentFilters.location)
      }
      if (currentFilters.searchRadius) {
        setSearchRadius(currentFilters.searchRadius)
      }
      if (currentFilters.timezones) {
        setSelectedTimezones(currentFilters.timezones)
      }
    }
  }, [currentFilters])

  const toggleSection = (section: string) => {
    setCollapsedSections({
      ...collapsedSections,
      [section]: !collapsedSections[section],
    })
  }

  // Function to notify parent of filter changes
  const notifyParentOfChanges = useCallback(() => {
    if (onFiltersChange && !isUpdatingFromParent.current) {
      const filters: ServiceFilters & { location?: LocationData; searchRadius?: number; timezones?: string[] } = {
        min_price: priceRange[0],
        max_price: priceRange[1],
        page: 1,
        limit: 10,
        location: selectedLocation || undefined,
        searchRadius: searchRadius,
        timezones: selectedTimezones.length > 0 ? selectedTimezones : undefined
      };
      
      // Add category filter if any experience level is selected
      if (experienceLevel.length > 0) {
        // Map experience levels to categories (this is a simplified mapping)
        const categoryMap: Record<string, string> = {
          'entry': 'development',
          'intermediate': 'design',
          'expert': 'business'
        };
        
        // Use the first selected experience level to determine category
        const category = categoryMap[experienceLevel[0]];
        if (category) {
          filters.category = category;
        }
      }
      
      isUpdatingFromParent.current = true
      onFiltersChange(filters);
      setTimeout(() => {
        isUpdatingFromParent.current = false
      }, 100)
    }
  }, [priceRange, experienceLevel, selectedLocation, searchRadius, selectedTimezones, onFiltersChange])

  // Debounced version for price range changes
  const debouncedNotifyParent = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      notifyParentOfChanges()
    }, 500) // 500ms debounce delay
  }, [notifyParentOfChanges])

  const toggleExperienceLevel = (level: string) => {
    if (experienceLevel.includes(level)) {
      setExperienceLevel(experienceLevel.filter((l) => l !== level))
    } else {
      setExperienceLevel([...experienceLevel, level])
    }
    
    // Immediately notify parent of experience level change
    setTimeout(() => {
      notifyParentOfChanges()
    }, 0)
  }

  const toggleAvailability = (option: string) => {
    if (availability.includes(option)) {
      setAvailability(availability.filter((a) => a !== option))
    } else {
      setAvailability([...availability, option])
    }
  }

  const toggleLanguage = (language: string) => {
    if (languages.includes(language)) {
      setLanguages(languages.filter((l) => l !== language))
    } else {
      setLanguages([...languages, language])
    }
  }

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput("")
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill()
    }
  }

  // New location and timezone handlers
  const handleLocationSelect = (location: LocationData | undefined) => {
    setSelectedLocation(location || null)
    notifyParentOfChanges()
  }

  const handleRadiusChange = (radius: number) => {
    setSearchRadius(radius)
    notifyParentOfChanges()
  }

  const handleTimezoneSelect = (timezones: string[]) => {
    setSelectedTimezones(timezones)
    notifyParentOfChanges()
  }

  const resetFilters = useCallback(() => {
    setPriceRange([25, 75])
    setExperienceLevel([])
    setAvailability([])
    setLanguages([])
    setSkills([])
    setIsOnlineNow(false)
    setHasVerifiedId(false)
    setTopRatedOnly(false)
    setSelectedLocation(null)
    setSearchRadius(50)
    setSelectedTimezones([])
    setShowCompatibilityOnly(false)
    
    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    // Notify parent of filter reset
    if (onFiltersChange) {
      isUpdatingFromParent.current = true
      onFiltersChange({
        min_price: 25,
        max_price: 75,
        page: 1,
        limit: 10
      });
      setTimeout(() => {
        isUpdatingFromParent.current = false
      }, 100)
    }
  }, [onFiltersChange])

  // Handle price range changes with debouncing
  const handlePriceRangeChange = useCallback((newPriceRange: number[]) => {
    setPriceRange(newPriceRange)
    debouncedNotifyParent()
  }, [debouncedNotifyParent])

  const SectionHeader = ({ title, section, icon }: { title: string; section: string; icon: React.ReactNode }) => (
    <div className="flex items-center justify-between cursor-pointer py-2" onClick={() => toggleSection(section)}>
      <div className="flex items-center">
        {icon}
        <h3 className="font-medium text-[#002333] ml-2">{title}</h3>
      </div>
      {collapsedSections[section] ? (
        <ChevronUp className="h-4 w-4 text-[#002333]/70" />
      ) : (
        <ChevronDown className="h-4 w-4 text-[#002333]/70" />
      )}
    </div>
  )

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#002333]">Filters</h2>
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-[#15949C]">
            <RefreshCw className="h-3 w-3 mr-2" />
            Reset
          </Button>
        </div>

        {/* Add tabs for different filter categories */}
        <Tabs value={activeFilterTab} onValueChange={setActiveFilterTab} className="mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="timezone">Timezone</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-300px)]">
            <TabsContent value="basic" className="space-y-6 pr-4">
              <div className="space-y-6">
                {/* Price Range - Keeping original structure */}
                <div className="space-y-4">
                  <SectionHeader
                    title="Hourly Rate"
                    section="price"
                    icon={<DollarSign className="h-4 w-4 text-[#15949C]" />}
                  />

                  {!collapsedSections.price && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mt-4 px-2">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-[#002333]/70">${priceRange[0]}</span>
                          <span className="text-sm text-[#002333]/70">${priceRange[1]}+</span>
                        </div>
                        <Slider
                          value={priceRange}
                          min={5}
                          max={150}
                          step={5}
                          onValueChange={handlePriceRangeChange}
                          className="my-4"
                        />
                        <div className="flex justify-between items-center gap-4">
                          <div className="relative flex-1">
                            <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#002333]/50" />
                            <Input
                              type="number"
                              value={priceRange[0]}
                              onChange={(e) => handlePriceRangeChange([Number.parseInt(e.target.value) || 5, priceRange[1]])}
                              className="pl-8"
                            />
                          </div>
                          <span className="text-[#002333]/50">to</span>
                          <div className="relative flex-1">
                            <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#002333]/50" />
                            <Input
                              type="number"
                              value={priceRange[1]}
                              onChange={(e) => handlePriceRangeChange([priceRange[0], Number.parseInt(e.target.value) || 150])}
                              className="pl-8"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <Separator />

                {/* Experience Level - Keeping original structure */}
                <div className="space-y-4">
                  <SectionHeader
                    title="Experience Level"
                    section="experience"
                    icon={<Briefcase className="h-4 w-4 text-[#15949C]" />}
                  />

                  {!collapsedSections.experience && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-3 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="entry"
                            checked={experienceLevel.includes("entry")}
                            onCheckedChange={() => toggleExperienceLevel("entry")}
                          />
                          <Label htmlFor="entry" className="cursor-pointer">
                            Entry Level
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="intermediate"
                            checked={experienceLevel.includes("intermediate")}
                            onCheckedChange={() => toggleExperienceLevel("intermediate")}
                          />
                          <Label htmlFor="intermediate" className="cursor-pointer">
                            Intermediate
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="expert"
                            checked={experienceLevel.includes("expert")}
                            onCheckedChange={() => toggleExperienceLevel("expert")}
                          />
                          <Label htmlFor="expert" className="cursor-pointer">
                            Expert
                          </Label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <Separator />

                {/* Keep all other existing sections: Availability, Languages, Skills, Other Filters */}
                {/* Availability */}
                <div className="space-y-4">
                  <SectionHeader
                    title="Availability"
                    section="availability"
                    icon={<Clock className="h-4 w-4 text-[#15949C]" />}
                  />

                  {!collapsedSections.availability && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-3 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hourly"
                            checked={availability.includes("hourly")}
                            onCheckedChange={() => toggleAvailability("hourly")}
                          />
                          <Label htmlFor="hourly" className="cursor-pointer">
                            Hourly
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="part-time"
                            checked={availability.includes("part-time")}
                            onCheckedChange={() => toggleAvailability("part-time")}
                          />
                          <Label htmlFor="part-time" className="cursor-pointer">
                            Part-time (20hrs/week)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="full-time"
                            checked={availability.includes("full-time")}
                            onCheckedChange={() => toggleAvailability("full-time")}
                          />
                          <Label htmlFor="full-time" className="cursor-pointer">
                            Full-time (40hrs/week)
                          </Label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <Separator />

                {/* Languages */}
                <div className="space-y-4">
                  <SectionHeader
                    title="Languages"
                    section="languages"
                    icon={<Globe className="h-4 w-4 text-[#15949C]" />}
                  />

                  {!collapsedSections.languages && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-3 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="english"
                            checked={languages.includes("english")}
                            onCheckedChange={() => toggleLanguage("english")}
                          />
                          <Label htmlFor="english" className="cursor-pointer">
                            English
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="spanish"
                            checked={languages.includes("spanish")}
                            onCheckedChange={() => toggleLanguage("spanish")}
                          />
                          <Label htmlFor="spanish" className="cursor-pointer">
                            Spanish
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="french"
                            checked={languages.includes("french")}
                            onCheckedChange={() => toggleLanguage("french")}
                          />
                          <Label htmlFor="french" className="cursor-pointer">
                            French
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="german"
                            checked={languages.includes("german")}
                            onCheckedChange={() => toggleLanguage("german")}
                          />
                          <Label htmlFor="german" className="cursor-pointer">
                            German
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="chinese"
                            checked={languages.includes("chinese")}
                            onCheckedChange={() => toggleLanguage("chinese")}
                          />
                          <Label htmlFor="chinese" className="cursor-pointer">
                            Chinese
                          </Label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <Separator />

                {/* Skills */}
                <div className="space-y-4">
                  <SectionHeader title="Skills" section="skills" icon={<Award className="h-4 w-4 text-[#15949C]" />} />

                  {!collapsedSections.skills && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mt-2">
                        <div className="flex gap-2 mb-3">
                          <Input
                            placeholder="Add a skill..."
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                          />
                          <Button size="sm" onClick={addSkill} className="bg-[#15949C] hover:bg-[#15949C]/90">
                            Add
                          </Button>
                        </div>

                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {skills.map((skill) => (
                              <Badge key={skill} className="bg-[#DEEFE7] text-[#002333] hover:bg-[#DEEFE7]/80">
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => removeSkill(skill)}
                                  className="ml-1 rounded-full hover:bg-[#15949C]/10"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="mt-4">
                          <p className="text-sm text-[#002333]/70 mb-2">Popular skills:</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              className="bg-gray-100 text-[#002333] hover:bg-gray-200 cursor-pointer"
                              onClick={() => {
                                if (!skills.includes("React")) {
                                  setSkills([...skills, "React"])
                                }
                              }}
                            >
                              React
                            </Badge>
                            <Badge
                              className="bg-gray-100 text-[#002333] hover:bg-gray-200 cursor-pointer"
                              onClick={() => {
                                if (!skills.includes("JavaScript")) {
                                  setSkills([...skills, "JavaScript"])
                                }
                              }}
                            >
                              JavaScript
                            </Badge>
                            <Badge
                              className="bg-gray-100 text-[#002333] hover:bg-gray-200 cursor-pointer"
                              onClick={() => {
                                if (!skills.includes("UI/UX Design")) {
                                  setSkills([...skills, "UI/UX Design"])
                                }
                              }}
                            >
                              UI/UX Design
                            </Badge>
                            <Badge
                              className="bg-gray-100 text-[#002333] hover:bg-gray-200 cursor-pointer"
                              onClick={() => {
                                if (!skills.includes("Python")) {
                                  setSkills([...skills, "Python"])
                                }
                              }}
                            >
                              Python
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <Separator />

                {/* Other Filters */}
                <div className="space-y-4">
                  <SectionHeader title="Other Filters" section="other" icon={<Star className="h-4 w-4 text-[#15949C]" />} />

                  {!collapsedSections.other && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-4 mt-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="online-now" className="cursor-pointer">
                            Online now
                          </Label>
                          <Switch id="online-now" checked={isOnlineNow} onCheckedChange={setIsOnlineNow} />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="verified-id" className="cursor-pointer">
                            Verified ID
                          </Label>
                          <Switch id="verified-id" checked={hasVerifiedId} onCheckedChange={setHasVerifiedId} />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="top-rated" className="cursor-pointer">
                            Top Rated Only
                          </Label>
                          <Switch id="top-rated" checked={topRatedOnly} onCheckedChange={setTopRatedOnly} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* New Location Tab */}
            <TabsContent value="location" className="space-y-6 pr-4">
              <LocationSearch
                onLocationSelect={handleLocationSelect}
                onRadiusChange={handleRadiusChange}
                currentLocation={selectedLocation}
                currentRadius={searchRadius}
              />
            </TabsContent>

            {/* New Timezone Tab */}
            <TabsContent value="timezone" className="space-y-6 pr-4">
              <TimezoneFilter
                userTimezone={selectedLocation?.timezone}
                selectedTimezones={selectedTimezones}
                onTimezoneSelect={handleTimezoneSelect}
                showCompatibilityOnly={showCompatibilityOnly}
                onCompatibilityToggle={setShowCompatibilityOnly}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="mt-6 pt-4 border-t">
          <Button className="w-full bg-[#15949C] hover:bg-[#15949C]/90">Apply Filters</Button>
        </div>
      </CardContent>
    </Card>
  )
}