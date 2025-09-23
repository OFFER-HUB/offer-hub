/**
 * @fileoverview Utilities for geographic distance calculations and location services
 * @author Offer Hub Team
 */

export interface Coordinates {
    lat: number
    lng: number
  }
  
  export interface DistanceResult {
    distance: number
    unit: 'km' | 'miles'
  }
  
  /**
   * Calculate the distance between two points using the Haversine formula
   * @param lat1 Latitude of first point
   * @param lng1 Longitude of first point
   * @param lat2 Latitude of second point
   * @param lng2 Longitude of second point
   * @param unit Unit of measurement ('km' or 'miles')
   * @returns Distance between points
   */
  export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
    unit: 'km' | 'miles' = 'km'
  ): number {
    const R = unit === 'km' ? 6371 : 3959 // Earth's radius in km or miles
    
    const dLat = toRadians(lat2 - lat1)
    const dLng = toRadians(lng2 - lng1)
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    
    return R * c
  }
  
  /**
   * Convert degrees to radians
   */
  function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }
  
  /**
   * Convert radians to degrees
   */
  function toDegrees(radians: number): number {
    return radians * (180 / Math.PI)
  }
  
  /**
   * Calculate bearing (direction) from one point to another
   * @param lat1 Latitude of first point
   * @param lng1 Longitude of first point
   * @param lat2 Latitude of second point
   * @param lng2 Longitude of second point
   * @returns Bearing in degrees (0-360)
   */
  export function calculateBearing(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const dLng = toRadians(lng2 - lng1)
    const lat1Rad = toRadians(lat1)
    const lat2Rad = toRadians(lat2)
    
    const y = Math.sin(dLng) * Math.cos(lat2Rad)
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
             Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng)
    
    const bearing = toDegrees(Math.atan2(y, x))
    return (bearing + 360) % 360
  }
  
  /**
   * Get compass direction from bearing
   */
  export function getCompassDirection(bearing: number): string {
    const directions = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
    ]
    const index = Math.round(bearing / 22.5) % 16
    return directions[index]
  }
  
  /**
   * Check if a point is within a circular radius of another point
   */
  export function isWithinRadius(
    centerLat: number,
    centerLng: number,
    pointLat: number,
    pointLng: number,
    radius: number,
    unit: 'km' | 'miles' = 'km'
  ): boolean {
    const distance = calculateDistance(centerLat, centerLng, pointLat, pointLng, unit)
    return distance <= radius
  }
  
  /**
   * Find all points within a radius of a center point
   */
  export function findPointsWithinRadius<T extends { coordinates: Coordinates }>(
    centerLat: number,
    centerLng: number,
    points: T[],
    radius: number,
    unit: 'km' | 'miles' = 'km'
  ): Array<T & { distance: number }> {
    return points
      .map(point => ({
        ...point,
        distance: calculateDistance(
          centerLat,
          centerLng,
          point.coordinates.lat,
          point.coordinates.lng,
          unit
        )
      }))
      .filter(point => point.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
  }
  
  /**
   * Calculate the bounding box for a given center point and radius
   */
  export function getBoundingBox(
    centerLat: number,
    centerLng: number,
    radius: number,
    unit: 'km' | 'miles' = 'km'
  ): {
    north: number
    south: number
    east: number
    west: number
  } {
    const R = unit === 'km' ? 6371 : 3959
    const lat = toRadians(centerLat)
    const _lng = toRadians(centerLng)
    
    // Angular radius
    const angularRadius = radius / R
    
    const north = centerLat + toDegrees(angularRadius)
    const south = centerLat - toDegrees(angularRadius)
    
    const east = centerLng + toDegrees(angularRadius / Math.cos(lat))
    const west = centerLng - toDegrees(angularRadius / Math.cos(lat))
    
    return { north, south, east, west }
  }
  
  /**
   * Calculate the center point of multiple coordinates
   */
  export function getCenterPoint(coordinates: Coordinates[]): Coordinates {
    if (coordinates.length === 0) {
      throw new Error('Cannot calculate center of empty coordinates array')
    }
    
    if (coordinates.length === 1) {
      return coordinates[0]
    }
    
    let x = 0
    let y = 0
    let z = 0
    
    coordinates.forEach(coord => {
      const lat = toRadians(coord.lat)
      const lng = toRadians(coord.lng)
      
      x += Math.cos(lat) * Math.cos(lng)
      y += Math.cos(lat) * Math.sin(lng)
      z += Math.sin(lat)
    })
    
    x /= coordinates.length
    y /= coordinates.length
    z /= coordinates.length
    
    const centralLng = Math.atan2(y, x)
    const centralSquareRoot = Math.sqrt(x * x + y * y)
    const centralLat = Math.atan2(z, centralSquareRoot)
    
    return {
      lat: toDegrees(centralLat),
      lng: toDegrees(centralLng)
    }
  }
  
  /**
   * Cluster nearby points based on distance threshold
   */
  export function clusterPoints<T extends { coordinates: Coordinates; id: string }>(
    points: T[],
    maxDistance: number,
    unit: 'km' | 'miles' = 'km'
  ): Array<{
    center: Coordinates
    points: T[]
    id: string
  }> {
    const clusters: Array<{
      center: Coordinates
      points: T[]
      id: string
    }> = []
    
    const processed = new Set<string>()
    
    points.forEach(point => {
      if (processed.has(point.id)) return
      
      const cluster = {
        center: point.coordinates,
        points: [point],
        id: `cluster-${clusters.length}`
      }
      
      // Find nearby points
      const nearby = points.filter(other => {
        if (other.id === point.id || processed.has(other.id)) return false
        
        const distance = calculateDistance(
          point.coordinates.lat,
          point.coordinates.lng,
          other.coordinates.lat,
          other.coordinates.lng,
          unit
        )
        
        return distance <= maxDistance
      })
      
      // Add nearby points to cluster
      nearby.forEach(nearbyPoint => {
        cluster.points.push(nearbyPoint)
        processed.add(nearbyPoint.id)
      })
      
      // Calculate cluster center
      if (cluster.points.length > 1) {
        cluster.center = getCenterPoint(cluster.points.map(p => p.coordinates))
      }
      
      processed.add(point.id)
      clusters.push(cluster)
    })
    
    return clusters
  }
  
  /**
   * Format distance for display
   */
  export function formatDistance(distance: number, unit: 'km' | 'miles' = 'km'): string {
    if (distance < 1) {
      const meters = Math.round(distance * (unit === 'km' ? 1000 : 5280))
      return `${meters}${unit === 'km' ? 'm' : 'ft'}`
    } else if (distance < 10) {
      return `${distance.toFixed(1)}${unit}`
    } else {
      return `${Math.round(distance)}${unit}`
    }
  }
  
  /**
   * Validate coordinates
   */
  export function isValidCoordinates(lat: number, lng: number): boolean {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    )
  }
  
  /**
   * Generate random coordinates within a bounding box (for testing)
   */
  export function generateRandomCoordinates(
    bounds: { north: number; south: number; east: number; west: number },
    count: number
  ): Coordinates[] {
    const coordinates: Coordinates[] = []
    
    for (let i = 0; i < count; i++) {
      const lat = bounds.south + Math.random() * (bounds.north - bounds.south)
      const lng = bounds.west + Math.random() * (bounds.east - bounds.west)
      coordinates.push({ lat, lng })
    }
    
    return coordinates
  }