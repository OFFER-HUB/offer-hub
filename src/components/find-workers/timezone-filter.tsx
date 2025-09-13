"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Globe, CheckCircle, AlertCircle, Info } from "lucide-react"
import { getTimezoneCompatibility, formatTimezone, getBusinessHoursOverlap } from "@/utils/timezone-helpers"

interface TimezoneFilterProps {
  userTimezone?: string
  selectedTimezones?: string[]
  onTimezoneSelect?: (timezones: string[]) => void
  showCompatibilityOnly?: boolean
  onCompatibilityToggle?: (enabled: boolean) => void
}

export default function TimezoneFilter({
  userTimezone,
  selectedTimezones = [],
  onTimezoneSelect,
  showCompatibilityOnly = false,
  onCompatibilityToggle
}: TimezoneFilterProps) {
  const [internalSelected, setInternalSelected] = useState<string[]>(selectedTimezones)
  const [userCurrentTime, setUserCurrentTime] = useState<Date>(new Date())

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setUserCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Popular freelancer timezones grouped by region
  const timezoneGroups = [
    {
      region: "Americas",
      timezones: [
        "America/New_York",
        "America/Chicago", 
        "America/Denver",
        "America/Los_Angeles",
        "America/Toronto",
        "America/Vancouver",
        "America/Mexico_City",
        "America/Sao_Paulo",
        "America/Buenos_Aires"
      ]
    },
    {
      region: "Europe & Africa",
      timezones: [
        "Europe/London",
        "Europe/Paris",
        "Europe/Berlin",
        "Europe/Madrid",
        "Europe/Rome",
        "Europe/Amsterdam",
        "Europe/Stockholm",
        "Africa/Cairo",
        "Africa/Lagos"
      ]
    },
    {
      region: "Asia Pacific",
      timezones: [
        "Asia/Tokyo",
        "Asia/Seoul",
        "Asia/Shanghai",
        "Asia/Singapore",
        "Asia/Kolkata",
        "Asia/Dubai",
        "Australia/Sydney",
        "Australia/Melbourne",
        "Pacific/Auckland"
      ]
    }
  ]

  const handleTimezoneToggle = (timezone: string) => {
    const newSelected = internalSelected.includes(timezone)
      ? internalSelected.filter(tz => tz !== timezone)
      : [...internalSelected, timezone]
    
    setInternalSelected(newSelected)
    onTimezoneSelect?.(newSelected)
  }

  const handleSelectAll = (timezones: string[]) => {
    const newSelected = [...new Set([...internalSelected, ...timezones])]
    setInternalSelected(newSelected)
    onTimezoneSelect?.(newSelected)
  }

  const handleClearAll = () => {
    setInternalSelected([])
    onTimezoneSelect?.([])
  }

  const getCompatibilityInfo = (timezone: string) => {
    if (!userTimezone) return null
    return getTimezoneCompatibility(userTimezone, timezone)
  }

  const getBusinessHoursInfo = (timezone: string) => {
    if (!userTimezone) return null
    return getBusinessHoursOverlap(userTimezone, timezone)
  }

  const renderTimezoneItem = (timezone: string) => {
    const isSelected = internalSelected.includes(timezone)
    const compatibility = getCompatibilityInfo(timezone)
    const businessHours = getBusinessHoursInfo(timezone)
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })

    // Filter based on compatibility if enabled
    if (showCompatibilityOnly && compatibility && compatibility.score < 3) {
      return null
    }

    return (
      <div 
        key={timezone} 
        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group"
      >
        <div className="flex items-center space-x-3 flex-1">
          <Checkbox
            id={timezone}
            checked={isSelected}
            onCheckedChange={() => handleTimezoneToggle(timezone)}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Label 
                htmlFor={timezone} 
                className="cursor-pointer font-medium text-[#002333] truncate"
              >
                {formatTimezone(timezone)}
              </Label>
              {compatibility && (
                <div className="flex items-center">
                  {compatibility.score >= 4 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : compatibility.score >= 2 ? (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-[#002333]/70">{currentTime}</span>
              {businessHours && businessHours.overlapHours > 0 && (
                <Badge variant="outline" className="text-xs">
                  {businessHours.overlapHours}h overlap
                </Badge>
              )}
            </div>
          </div>
        </div>

        {compatibility && (
          <div className="flex items-center ml-2">
            <Badge 
              className={`text-xs ${
                compatibility.score >= 4 
                  ? "bg-green-100 text-green-800" 
                  : compatibility.score >= 2
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {compatibility.label}
            </Badge>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-[#002333] flex items-center">
            <Clock className="h-4 w-4 mr-2 text-[#15949C]" />
            Timezone Preferences
          </Label>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              Clear All
            </Button>
          </div>
        </div>

        {/* User's current timezone display */}
        {userTimezone && (
          <div className="p-3 bg-[#DEEFE7]/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2 text-[#15949C]" />
                <div>
                  <p className="text-sm font-medium text-[#002333]">Your Timezone</p>
                  <p className="text-xs text-[#002333]/70">
                    {formatTimezone(userTimezone)} • {userCurrentTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compatibility filter toggle */}
        {userTimezone && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Info className="h-4 w-4 mr-2 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Show Compatible Timezones Only</p>
                <p className="text-xs text-blue-700">Filter freelancers with good timezone compatibility</p>
              </div>
            </div>
            <Checkbox
              checked={showCompatibilityOnly}
              onCheckedChange={onCompatibilityToggle}
            />
          </div>
        )}

        {/* Selected count */}
        {internalSelected.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge className="bg-[#15949C] text-white">
              {internalSelected.length} selected
            </Badge>
          </div>
        )}

        <Separator />

        {/* Timezone groups */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {timezoneGroups.map((group) => {
              const visibleTimezones = group.timezones.filter(timezone => {
                if (!showCompatibilityOnly || !userTimezone) return true
                const compatibility = getCompatibilityInfo(timezone)
                return compatibility && compatibility.score >= 3
              })

              if (visibleTimezones.length === 0) return null

              return (
                <div key={group.region}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-[#002333]">{group.region}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectAll(visibleTimezones)}
                      className="text-xs text-[#15949C] h-6"
                    >
                      Select All
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {visibleTimezones.map(renderTimezoneItem)}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {/* Compatibility legend */}
        {userTimezone && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-medium text-[#002333]/70 uppercase tracking-wide">
                Compatibility Legend
              </p>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <Badge className="bg-green-100 text-green-800 text-xs">Excellent</Badge>
                  <span className="text-[#002333]/70">4+ hours overlap</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">Good</Badge>
                  <span className="text-[#002333]/70">2-4 hours overlap</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-red-500" />
                  <Badge className="bg-red-100 text-red-800 text-xs">Poor</Badge>
                  <span className="text-[#002333]/70">Less than 2 hours</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}