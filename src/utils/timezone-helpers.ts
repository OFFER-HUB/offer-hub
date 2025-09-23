export interface TimezoneCompatibility {
    score: number // 1-5 rating
    label: string
    timeDifference: number
    description: string
  }
  
  export interface BusinessHoursOverlap {
    overlapHours: number
    overlapStart: string
    overlapEnd: string
    userBusinessStart: string
    userBusinessEnd: string
    freelancerBusinessStart: string
    freelancerBusinessEnd: string
  }
  
  /**
   * Get timezone offset in minutes from UTC
   */
  export function getTimezoneOffset(timezone: string): number {
    try {
      const now = new Date()
      const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
      const target = new Date(utc.toLocaleString('en-US', { timeZone: timezone }))
      const offset = (target.getTime() - utc.getTime()) / (1000 * 60)
      return Math.round(offset)
    } catch (_error) {
      console.error('Error getting timezone offset:', error)
      return 0
    }
  }
  
  /**
   * Calculate time difference between two timezones in hours
   */
  export function getTimeDifference(timezone1: string, timezone2: string): number {
    const offset1 = getTimezoneOffset(timezone1)
    const offset2 = getTimezoneOffset(timezone2)
    return Math.abs(offset1 - offset2) / 60
  }
  
  /**
   * Format timezone for display
   */
  export function formatTimezone(timezone: string): string {
    const parts = timezone.split('/')
    if (parts.length >= 2) {
      const city = parts[parts.length - 1].replace(/_/g, ' ')
      const region = parts[0]
      
      // Handle special cases
      if (region === 'America') {
        if (city === 'New York') return 'New York (EST/EDT)'
        if (city === 'Los Angeles') return 'Los Angeles (PST/PDT)'
        if (city === 'Chicago') return 'Chicago (CST/CDT)'
        if (city === 'Denver') return 'Denver (MST/MDT)'
      }
      
      return `${city} (${getTimezoneAbbreviation(timezone)})`
    }
    
    return timezone.replace(/_/g, ' ')
  }
  
  /**
   * Get timezone abbreviation
   */
  export function getTimezoneAbbreviation(timezone: string): string {
    try {
      const now = new Date()
      return now.toLocaleDateString('en', {
        timeZone: timezone,
        timeZoneName: 'short',
      }).split(', ')[1] || timezone.split('/').pop()?.replace(/_/g, ' ') || timezone
    } catch (_error) {
      return timezone.split('/').pop()?.replace(/_/g, ' ') || timezone
    }
  }
  
  /**
   * Calculate timezone compatibility score
   */
  export function getTimezoneCompatibility(
    userTimezone: string, 
    freelancerTimezone: string
  ): TimezoneCompatibility {
    const timeDifference = getTimeDifference(userTimezone, freelancerTimezone)
    
    let score: number
    let label: string
    let description: string
    
    if (timeDifference <= 2) {
      score = 5
      label = 'Excellent'
      description = 'Perfect for real-time collaboration'
    } else if (timeDifference <= 4) {
      score = 4
      label = 'Very Good'
      description = 'Great overlap for regular communication'
    } else if (timeDifference <= 8) {
      score = 3
      label = 'Good'
      description = 'Some overlap possible with flexibility'
    } else if (timeDifference <= 12) {
      score = 2
      label = 'Fair'
      description = 'Limited overlap, requires planning'
    } else {
      score = 1
      label = 'Poor'
      description = 'Minimal overlap, mostly asynchronous'
    }
    
    return {
      score,
      label,
      timeDifference,
      description
    }
  }
  
  /**
   * Calculate business hours overlap between two timezones
   */
  export function getBusinessHoursOverlap(
    userTimezone: string,
    freelancerTimezone: string,
    userBusinessStart: number = 9, // 9 AM
    userBusinessEnd: number = 17, // 5 PM
    freelancerBusinessStart: number = 9,
    freelancerBusinessEnd: number = 17
  ): BusinessHoursOverlap {
    try {
      // Convert business hours to UTC for comparison
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      // User business hours in UTC
      const userStartUTC = convertTimeToUTC(today, userBusinessStart, userTimezone)
      const userEndUTC = convertTimeToUTC(today, userBusinessEnd, userTimezone)
      
      // Freelancer business hours in UTC
      const freelancerStartUTC = convertTimeToUTC(today, freelancerBusinessStart, freelancerTimezone)
      const freelancerEndUTC = convertTimeToUTC(today, freelancerBusinessEnd, freelancerTimezone)
      
      // Calculate overlap
      const overlapStartUTC = Math.max(userStartUTC.getTime(), freelancerStartUTC.getTime())
      const overlapEndUTC = Math.min(userEndUTC.getTime(), freelancerEndUTC.getTime())
      
      let overlapHours = 0
      let overlapStart = ''
      let overlapEnd = ''
      
      if (overlapStartUTC < overlapEndUTC) {
        overlapHours = (overlapEndUTC - overlapStartUTC) / (1000 * 60 * 60)
        
        // Convert overlap times back to user timezone for display
        const overlapStartInUserTZ = new Date(overlapStartUTC)
        const overlapEndInUserTZ = new Date(overlapEndUTC)
        
        overlapStart = overlapStartInUserTZ.toLocaleTimeString('en-US', {
          timeZone: userTimezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
        
        overlapEnd = overlapEndInUserTZ.toLocaleTimeString('en-US', {
          timeZone: userTimezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      }
      
      return {
        overlapHours: Math.round(overlapHours * 10) / 10, // Round to 1 decimal
        overlapStart,
        overlapEnd,
        userBusinessStart: formatTime(userBusinessStart),
        userBusinessEnd: formatTime(userBusinessEnd),
        freelancerBusinessStart: formatTime(freelancerBusinessStart),
        freelancerBusinessEnd: formatTime(freelancerBusinessEnd)
      }
    } catch (_error) {
      console.error('Error calculating business hours overlap:', error)
      return {
        overlapHours: 0,
        overlapStart: '',
        overlapEnd: '',
        userBusinessStart: formatTime(userBusinessStart),
        userBusinessEnd: formatTime(userBusinessEnd),
        freelancerBusinessStart: formatTime(freelancerBusinessStart),
        freelancerBusinessEnd: formatTime(freelancerBusinessEnd)
      }
    }
  }
  
  /**
   * Convert a time (in 24-hour format) to UTC for a specific timezone
   */
  function convertTimeToUTC(date: Date, hour: number, timezone: string): Date {
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour)
    
    // Get the local time string in the target timezone
    const localTimeString = localDate.toLocaleString('en-US', { timeZone: timezone })
    
    // Parse it back to get UTC equivalent
    return new Date(localTimeString)
  }
  
  /**
   * Format hour number to readable time string
   */
  function formatTime(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:00 ${period}`
  }
  
  /**
   * Get current time in a specific timezone
   */
  export function getCurrentTimeInTimezone(timezone: string): string {
    try {
      return new Date().toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } catch (_error) {
      return 'Unknown'
    }
  }
  
  /**
   * Check if a timezone is currently in business hours
   */
  export function isInBusinessHours(
    timezone: string,
    businessStart: number = 9,
    businessEnd: number = 17
  ): boolean {
    try {
      const now = new Date()
      const timeInTimezone = now.toLocaleString('en-US', { 
        timeZone: timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      })
      
      const [hourStr] = timeInTimezone.split(':')
      const currentHour = parseInt(hourStr, 10)
      
      return currentHour >= businessStart && currentHour < businessEnd
    } catch (_error) {
      console.error('Error checking business hours:', error)
      return false
    }
  }
  
  /**
   * Get list of timezones that are compatible with user's timezone
   */
  export function getCompatibleTimezones(
    userTimezone: string,
    allTimezones: string[],
    minScore: number = 3
  ): string[] {
    return allTimezones.filter(timezone => {
      if (timezone === userTimezone) return true
      const compatibility = getTimezoneCompatibility(userTimezone, timezone)
      return compatibility.score >= minScore
    })
  }
  
  /**
   * Group timezones by their UTC offset
   */
  export function groupTimezonesByOffset(timezones: string[]): Record<string, string[]> {
    const groups: Record<string, string[]> = {}
    
    timezones.forEach(timezone => {
      const offset = getTimezoneOffset(timezone)
      const offsetHours = Math.floor(offset / 60)
      const offsetMinutes = Math.abs(offset % 60)
      
      let offsetString: string
      if (offset === 0) {
        offsetString = 'UTC+0'
      } else {
        const sign = offset > 0 ? '+' : '-'
        const absHours = Math.abs(offsetHours)
        offsetString = offsetMinutes === 0 
          ? `UTC${sign}${absHours}`
          : `UTC${sign}${absHours}:${offsetMinutes.toString().padStart(2, '0')}`
      }
      
      if (!groups[offsetString]) {
        groups[offsetString] = []
      }
      groups[offsetString].push(timezone)
    })
    
    return groups
  }