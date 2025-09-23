// Analytics helper functions

import { 
  TimeSeriesDataPoint,
  RatingDistribution,
  DateRange,
  AnalyticsQuery,
  ChartData,
  ChartDataset,
  ReputationMetrics
} from '@/types/review-analytics.types';
import { Review } from '@/types/review.types';

// Date Utilities
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getDateRange = (period: '7d' | '30d' | '90d' | '1y' | 'custom', customRange?: DateRange): DateRange => {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case 'custom':
      if (customRange) {
        return customRange;
      }
      break;
  }

  return { startDate, endDate };
};

export const generateDateSequence = (startDate: Date, endDate: Date, granularity: 'day' | 'week' | 'month'): Date[] => {
  const dates: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(new Date(current));
    
    switch (granularity) {
      case 'day':
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }

  return dates;
};

// Statistical Calculations
export const calculateRatingDistribution = (reviews: Review[]): RatingDistribution => {
  const distribution = {
    oneStar: 0,
    twoStar: 0,
    threeStar: 0,
    fourStar: 0,
    fiveStar: 0,
  };

  reviews.forEach(review => {
    switch (review.rating) {
      case 1:
        distribution.oneStar++;
        break;
      case 2:
        distribution.twoStar++;
        break;
      case 3:
        distribution.threeStar++;
        break;
      case 4:
        distribution.fourStar++;
        break;
      case 5:
        distribution.fiveStar++;
        break;
    }
  });

  return distribution;
};

export const calculateAverageRating = (reviews: Review[]): number => {
  if (reviews.length === 0) return 0;
  
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 100) / 100;
};

export const calculatePercentileRating = (reviews: Review[], percentile: number): number => {
  if (reviews.length === 0) return 0;
  
  const sortedRatings = reviews.map(r => r.rating).sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sortedRatings.length) - 1;
  return sortedRatings[Math.max(0, index)];
};

export const calculateStandardDeviation = (values: number[]): number => {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
};

export const calculateTrendDirection = (current: number, previous: number): 'up' | 'down' | 'stable' => {
  const threshold = 0.05; // 5% threshold for considering stable
  const changePercentage = Math.abs((current - previous) / previous);
  
  if (changePercentage < threshold) return 'stable';
  return current > previous ? 'up' : 'down';
};

export const calculateChangePercentage = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 10000) / 100;
};

// Time Series Analysis
export const groupReviewsByDate = (
  reviews: Review[], 
  granularity: 'day' | 'week' | 'month'
): TimeSeriesDataPoint[] => {
  const groupedData: { [key: string]: Review[] } = {};

  reviews.forEach(review => {
    const date = new Date(review.created_at);
    let key: string;

    switch (granularity) {
      case 'day':
        key = formatDate(date);
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = formatDate(weekStart);
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = formatDate(date);
    }

    if (!groupedData[key]) {
      groupedData[key] = [];
    }
    groupedData[key].push(review);
  });

  return Object.entries(groupedData)
    .map(([date, reviewsForDate]) => ({
      date,
      value: reviewsForDate.length,
      label: `${reviewsForDate.length} reviews`
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const calculateMovingAverage = (data: TimeSeriesDataPoint[], windowSize: number): TimeSeriesDataPoint[] => {
  const result: TimeSeriesDataPoint[] = [];

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = data.slice(start, i + 1);
    const average = window.reduce((sum, point) => sum + point.value, 0) / window.length;

    result.push({
      date: data[i].date,
      value: Math.round(average * 100) / 100,
      label: `${Math.round(average * 100) / 100} (${windowSize}-period avg)`
    });
  }

  return result;
};

export const detectTrendChangePoints = (data: TimeSeriesDataPoint[]): number[] => {
  const changePoints: number[] = [];
  const threshold = 0.2; // 20% change threshold

  for (let i = 1; i < data.length - 1; i++) {
    const prev = data[i - 1].value;
    const current = data[i].value;
    const next = data[i + 1].value;

    const changePrev = Math.abs((current - prev) / prev);
    const changeNext = Math.abs((next - current) / current);

    if (changePrev > threshold || changeNext > threshold) {
      changePoints.push(i);
    }
  }

  return changePoints;
};

// Data Filtering and Segmentation
export const filterReviewsByDateRange = (reviews: Review[], dateRange: DateRange): Review[] => {
  return reviews.filter(review => {
    const reviewDate = new Date(review.created_at);
    return reviewDate >= dateRange.startDate && reviewDate <= dateRange.endDate;
  });
};

export const segmentReviewsByRating = (reviews: Review[]): Record<string, Review[]> => {
  return {
    positive: reviews.filter(r => r.rating >= 4),
    neutral: reviews.filter(r => r.rating === 3),
    negative: reviews.filter(r => r.rating <= 2)
  };
};

export const segmentReviewsByUserType = (reviews: Review[], userTypes: Record<string, string>): Record<string, Review[]> => {
  const segments: Record<string, Review[]> = {};
  
  reviews.forEach(review => {
    const userType = userTypes[review.from_id] || 'unknown';
    if (!segments[userType]) {
      segments[userType] = [];
    }
    segments[userType].push(review);
  });

  return segments;
};

// Metric Calculations
export const calculateReviewMetrics = (reviews: Review[]): ReputationMetrics => {
  const averageRating = calculateAverageRating(reviews);
  const totalReviews = reviews.length;
  const highRatedUsers = new Set(reviews.filter(r => r.rating >= 4).map(r => r.to_id)).size;
  const lowRatedUsers = new Set(reviews.filter(r => r.rating <= 2).map(r => r.to_id)).size;
  
  // Simple reputation score calculation (can be enhanced)
  const reputationScore = Math.round((averageRating * 20) + (totalReviews * 0.1));

  return {
    averageRating,
    totalReviews,
    highRatedUsers,
    lowRatedUsers,
    reputationScore
  };
};

export const calculateResponseTimeMetrics = (reviews: Review[]): { average: number; median: number; percentile95: number } => {
  // This would typically require additional data about when reviews were requested vs completed
  // For now, returning mock calculations that would be replaced with actual data
  const responseTimes = reviews.map(() => Math.random() * 168); // Mock: 0-168 hours
  
  const sorted = responseTimes.sort((a, b) => a - b);
  const average = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const median = sorted.length % 2 === 0 
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  const percentile95Index = Math.floor(sorted.length * 0.95);
  const percentile95 = sorted[percentile95Index];

  return {
    average: Math.round(average * 100) / 100,
    median: Math.round(median * 100) / 100,
    percentile95: Math.round(percentile95 * 100) / 100
  };
};

// Chart Data Preparation
export const prepareChartData = (
  data: TimeSeriesDataPoint[], 
  label: string,
  color?: string
): ChartData => {
  const dataset: ChartDataset = {
    label,
    data: data.map(point => point.value),
    backgroundColor: color || '#3b82f6',
    borderColor: color || '#2563eb',
    borderWidth: 2,
    fill: false,
    tension: 0.1
  };

  return {
    labels: data.map(point => point.date),
    datasets: [dataset]
  };
};

export const prepareDistributionChartData = (distribution: RatingDistribution): ChartData => {
  return {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [{
      label: 'Rating Distribution',
      data: [
        distribution.oneStar,
        distribution.twoStar,
        distribution.threeStar,
        distribution.fourStar,
        distribution.fiveStar
      ],
      backgroundColor: [
        '#ef4444', // red-500
        '#f97316', // orange-500
        '#eab308', // yellow-500
        '#22c55e', // green-500
        '#16a34a'  // green-600
      ],
      borderWidth: 0
    }]
  };
};


// Export Utilities
export const formatDataForExport = (data: any[], format: 'csv' | 'json'): string => {
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  }

  if (format === 'csv') {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  }

  return '';
};

// Performance Optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  interval: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= interval) {
      lastCall = now;
      func(...args);
    }
  };
};

// Cache Utilities
export const generateCacheKey = (query: AnalyticsQuery): string => {
  const keyParts = [
    query.metrics.sort().join(','),
    query.dimensions.sort().join(','),
    JSON.stringify(query.filters),
    formatDate(query.dateRange.startDate),
    formatDate(query.dateRange.endDate),
    query.granularity
  ];
  
  return btoa(keyParts.join('|'));
};

// Validation Utilities
export const validateDateRange = (dateRange: DateRange): boolean => {
  return dateRange.startDate <= dateRange.endDate &&
         dateRange.startDate <= new Date() &&
         dateRange.endDate <= new Date();
};

export const validateMetricValue = (value: any, type: 'number' | 'percentage' | 'currency'): boolean => {
  const numValue = Number(value);
  
  if (isNaN(numValue)) return false;
  
  switch (type) {
    case 'percentage':
      return numValue >= 0 && numValue <= 100;
    case 'currency':
      return numValue >= 0;
    case 'number':
      return true;
    default:
      return false;
  }
};

// Color Utilities
export const generateColorPalette = (count: number): string[] => {
  const baseColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];
  
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  // Generate additional colors if needed
  const additionalColors = [];
  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * 137.508) % 360; // Golden angle approximation
    additionalColors.push(`hsl(${hue}, 70%, 50%)`);
  }
  
  return [...baseColors, ...additionalColors];
};

// Advanced Analytics Utilities
export const calculateCorrelation = (dataX: number[], dataY: number[]): number => {
  if (dataX.length !== dataY.length || dataX.length === 0) return 0;
  
  const n = dataX.length;
  const sumX = dataX.reduce((a, b) => a + b, 0);
  const sumY = dataY.reduce((a, b) => a + b, 0);
  const sumXY = dataX.reduce((acc, x, i) => acc + x * dataY[i], 0);
  const sumXX = dataX.reduce((acc, x) => acc + x * x, 0);
  const sumYY = dataY.reduce((acc, y) => acc + y * y, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
};

export const detectSeasonality = (data: TimeSeriesDataPoint[]): { 
  period: number; 
  strength: number; 
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';
} => {
  if (data.length < 7) return { period: 0, strength: 0, type: 'none' };
  
  const values = data.map(d => d.value);
  let maxStrength = 0;
  let bestPeriod = 0;
  let bestType: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none' = 'none';
  
  // Test common periods
  const periods = [
    { period: 7, type: 'weekly' as const },
    { period: 30, type: 'monthly' as const },
    { period: 365, type: 'yearly' as const }
  ];
  
  for (const { period, type } of periods) {
    if (data.length >= period * 2) {
      const autocorr = calculateAutocorrelation(values, period);
      if (autocorr > maxStrength) {
        maxStrength = autocorr;
        bestPeriod = period;
        bestType = type;
      }
    }
  }
  
  return { 
    period: bestPeriod, 
    strength: maxStrength, 
    type: maxStrength > 0.3 ? bestType : 'none' 
  };
};

export const calculateAutocorrelation = (data: number[], lag: number): number => {
  if (lag >= data.length || lag <= 0) return 0;
  
  const n = data.length - lag;
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (data[i] - mean) * (data[i + lag] - mean);
  }
  
  for (let i = 0; i < data.length; i++) {
    denominator += (data[i] - mean) ** 2;
  }
  
  return denominator === 0 ? 0 : numerator / denominator;
};

export const calculateForecast = (
  data: TimeSeriesDataPoint[], 
  periods: number = 7
): TimeSeriesDataPoint[] => {
  if (data.length < 3) return [];
  
  const values = data.map(d => d.value);
  const n = values.length;
  
  // Simple exponential smoothing
  const alpha = 0.3;
  let smoothed = values[0];
  
  for (let i = 1; i < n; i++) {
    smoothed = alpha * values[i] + (1 - alpha) * smoothed;
  }
  
  const forecast: TimeSeriesDataPoint[] = [];
  const lastDate = new Date(data[data.length - 1].date);
  
  for (let i = 1; i <= periods; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(lastDate.getDate() + i);
    
    // Add some trend and seasonality simulation
    const trend = (values[n - 1] - values[0]) / n;
    const seasonal = Math.sin(i * 2 * Math.PI / 7) * 5; // Weekly pattern
    const noise = (Math.random() - 0.5) * 2;
    
    forecast.push({
      date: forecastDate.toISOString().split('T')[0],
      value: Math.max(0, Math.round(smoothed + trend * i + seasonal + noise)),
      label: `Forecast: ${Math.round(smoothed + trend * i + seasonal + noise)}`
    });
  }
  
  return forecast;
};

export const detectAnomalies = (
  data: TimeSeriesDataPoint[], 
  threshold: number = 2
): { index: number; value: number; severity: 'low' | 'medium' | 'high' }[] => {
  if (data.length < 3) return [];
  
  const values = data.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std = calculateStandardDeviation(values);
  
  const anomalies = [];
  
  for (let i = 0; i < values.length; i++) {
    const zscore = Math.abs((values[i] - mean) / std);
    
    if (zscore > threshold) {
      let severity: 'low' | 'medium' | 'high';
      if (zscore > threshold * 2) {
        severity = 'high';
      } else if (zscore > threshold * 1.5) {
        severity = 'medium';
      } else {
        severity = 'low';
      }
      
      anomalies.push({
        index: i,
        value: values[i],
        severity
      });
    }
  }
  
  return anomalies;
};

// Performance Metrics Utilities
export const calculateSystemMetrics = (data: any[]): {
  responseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
} => {
  if (data.length === 0) {
    return { responseTime: 0, throughput: 0, errorRate: 0, availability: 0 };
  }
  
  const responseTime = data.reduce((acc, d) => acc + (d.responseTime || 0), 0) / data.length;
  const throughput = data.reduce((acc, d) => acc + (d.requestCount || 0), 0);
  const errors = data.reduce((acc, d) => acc + (d.errorCount || 0), 0);
  const errorRate = throughput > 0 ? (errors / throughput) * 100 : 0;
  const uptime = data.filter(d => d.status === 'up').length;
  const availability = (uptime / data.length) * 100;
  
  return {
    responseTime: Math.round(responseTime * 100) / 100,
    throughput,
    errorRate: Math.round(errorRate * 100) / 100,
    availability: Math.round(availability * 100) / 100
  };
};

export const calculateResourceUtilization = (metrics: {
  cpu: number[];
  memory: number[];
  network: number[];
}): {
  cpu: { current: number; average: number; peak: number };
  memory: { current: number; average: number; peak: number };
  network: { current: number; average: number; peak: number };
} => {
  const calculateStats = (data: number[]) => ({
    current: data[data.length - 1] || 0,
    average: data.reduce((a, b) => a + b, 0) / data.length || 0,
    peak: Math.max(...data) || 0
  });
  
  return {
    cpu: calculateStats(metrics.cpu),
    memory: calculateStats(metrics.memory),
    network: calculateStats(metrics.network)
  };
};

// ML Model Utilities
export const calculateModelMetrics = (
  predictions: number[], 
  actuals: number[]
): {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mse: number;
  rmse: number;
  mae: number;
} => {
  if (predictions.length !== actuals.length || predictions.length === 0) {
    return { accuracy: 0, precision: 0, recall: 0, f1Score: 0, mse: 0, rmse: 0, mae: 0 };
  }
  
  const n = predictions.length;
  
  // For regression metrics
  const mse = predictions.reduce((acc, pred, i) => acc + Math.pow(pred - actuals[i], 2), 0) / n;
  const rmse = Math.sqrt(mse);
  const mae = predictions.reduce((acc, pred, i) => acc + Math.abs(pred - actuals[i]), 0) / n;
  
  // For classification metrics (assuming binary classification with threshold 0.5)
  let tp = 0, fp = 0, tn = 0, fn = 0;
  
  for (let i = 0; i < n; i++) {
    const predicted = predictions[i] > 0.5 ? 1 : 0;
    const actual = actuals[i] > 0.5 ? 1 : 0;
    
    if (predicted === 1 && actual === 1) tp++;
    else if (predicted === 1 && actual === 0) fp++;
    else if (predicted === 0 && actual === 0) tn++;
    else if (predicted === 0 && actual === 1) fn++;
  }
  
  const accuracy = (tp + tn) / n;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1Score = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
  
  return {
    accuracy: Math.round(accuracy * 10000) / 100,
    precision: Math.round(precision * 10000) / 100,
    recall: Math.round(recall * 10000) / 100,
    f1Score: Math.round(f1Score * 10000) / 100,
    mse: Math.round(mse * 100) / 100,
    rmse: Math.round(rmse * 100) / 100,
    mae: Math.round(mae * 100) / 100
  };
};

// Advanced Export Utilities
export const exportToExcel = (data: any[], filename: string = 'export.xlsx'): void => {
  // This would integrate with a library like xlsx or exceljs
  console.log('Exporting to Excel:', filename, data);
  // Placeholder implementation
};

export const exportToPDF = (data: any[], filename: string = 'export.pdf'): void => {
  // This would integrate with a library like jsPDF
  console.log('Exporting to PDF:', filename, data);
  // Placeholder implementation
};

export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(value);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};