import {
  DisputeAnalytics,
  PerformanceMetrics,
  TrendData,
  DisputePattern,
  PredictiveModel,
  ChartData,
  TimeSeriesData,
  SegmentData,
  AnalyticsFilter,
  DisputeStatus,
  DisputeType
} from '@/types/analytics.types';

export class AnalyticsCalculator {
  static calculatePerformanceMetrics(disputes: DisputeAnalytics[]): PerformanceMetrics {
    const total = disputes.length;
    const resolved = disputes.filter(d => d.status === DisputeStatus.RESOLVED).length;
    const pending = disputes.filter(d =>
      [DisputeStatus.PENDING, DisputeStatus.IN_REVIEW, DisputeStatus.INVESTIGATING].includes(d.status)
    ).length;

    const resolvedDisputes = disputes.filter(d => d.resolutionTime !== undefined);
    const avgResolutionTime = resolvedDisputes.length > 0
      ? resolvedDisputes.reduce((sum, d) => sum + (d.resolutionTime || 0), 0) / resolvedDisputes.length
      : 0;

    const satisfactionScores = disputes.filter(d => d.userSatisfactionScore !== undefined);
    const avgSatisfaction = satisfactionScores.length > 0
      ? satisfactionScores.reduce((sum, d) => sum + (d.userSatisfactionScore || 0), 0) / satisfactionScores.length
      : 0;

    const escalated = disputes.filter(d => d.escalationLevel > 0).length;
    const recurring = this.calculateRecurringDisputes(disputes);

    return {
      totalDisputes: total,
      resolvedDisputes: resolved,
      pendingDisputes: pending,
      averageResolutionTime: avgResolutionTime,
      resolutionRate: total > 0 ? (resolved / total) * 100 : 0,
      userSatisfactionRate: avgSatisfaction,
      escalationRate: total > 0 ? (escalated / total) * 100 : 0,
      recurringDisputeRate: total > 0 ? (recurring / total) * 100 : 0
    };
  }

  static calculateTrendData(
    disputes: DisputeAnalytics[],
    period: 'daily' | 'weekly' | 'monthly',
    metric: 'count' | 'resolution_time' | 'satisfaction'
  ): TrendData[] {
    const groupedData = this.groupDisputesByPeriod(disputes, period);
    const trends: TrendData[] = [];

    const sortedPeriods = Object.keys(groupedData).sort();

    sortedPeriods.forEach((periodKey, index) => {
      const currentData = groupedData[periodKey];
      const previousData = index > 0 ? groupedData[sortedPeriods[index - 1]] : null;

      let value = 0;
      let previousValue = 0;

      switch (metric) {
        case 'count':
          value = currentData.length;
          previousValue = previousData ? previousData.length : 0;
          break;
        case 'resolution_time':
          const resolved = currentData.filter(d => d.resolutionTime);
          value = resolved.length > 0
            ? resolved.reduce((sum, d) => sum + (d.resolutionTime || 0), 0) / resolved.length
            : 0;
          const prevResolved = previousData?.filter(d => d.resolutionTime) || [];
          previousValue = prevResolved.length > 0
            ? prevResolved.reduce((sum, d) => sum + (d.resolutionTime || 0), 0) / prevResolved.length
            : 0;
          break;
        case 'satisfaction':
          const withSatisfaction = currentData.filter(d => d.userSatisfactionScore);
          value = withSatisfaction.length > 0
            ? withSatisfaction.reduce((sum, d) => sum + (d.userSatisfactionScore || 0), 0) / withSatisfaction.length
            : 0;
          const prevWithSatisfaction = previousData?.filter(d => d.userSatisfactionScore) || [];
          previousValue = prevWithSatisfaction.length > 0
            ? prevWithSatisfaction.reduce((sum, d) => sum + (d.userSatisfactionScore || 0), 0) / prevWithSatisfaction.length
            : 0;
          break;
      }

      const change = value - previousValue;
      const changePercentage = previousValue > 0 ? (change / previousValue) * 100 : 0;

      trends.push({
        period: periodKey,
        value,
        change,
        changePercentage
      });
    });

    return trends;
  }

  static identifyDisputePatterns(disputes: DisputeAnalytics[]): DisputePattern[] {
    const patterns: Map<string, DisputeAnalytics[]> = new Map();

    disputes.forEach(dispute => {
      const key = `${dispute.type}_${dispute.category}`;
      if (!patterns.has(key)) {
        patterns.set(key, []);
      }
      patterns.get(key)!.push(dispute);
    });

    return Array.from(patterns.entries()).map(([key, groupedDisputes]) => {
      const [type, category] = key.split('_');
      const resolved = groupedDisputes.filter(d => d.status === DisputeStatus.RESOLVED);
      const avgResolutionTime = resolved.length > 0
        ? resolved.reduce((sum, d) => sum + (d.resolutionTime || 0), 0) / resolved.length
        : 0;

      const successRate = groupedDisputes.length > 0
        ? (resolved.length / groupedDisputes.length) * 100
        : 0;

      const recentDisputes = this.getRecentDisputes(groupedDisputes, 30);
      const olderDisputes = this.getDisputesInRange(groupedDisputes, 60, 30);

      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (recentDisputes.length > olderDisputes.length * 1.1) {
        trend = 'increasing';
      } else if (recentDisputes.length < olderDisputes.length * 0.9) {
        trend = 'decreasing';
      }

      return {
        type: `${type} - ${category}`,
        frequency: groupedDisputes.length,
        averageResolutionTime: avgResolutionTime,
        successRate,
        trend
      };
    }).sort((a, b) => b.frequency - a.frequency);
  }

  static generatePredictiveModel(disputes: DisputeAnalytics[]): PredictiveModel {
    const factors = [
      {
        name: 'Historical Dispute Volume',
        weight: 0.3,
        impact: this.calculateVolumeImpact(disputes),
        description: 'Based on recent dispute volume trends'
      },
      {
        name: 'Resolution Success Rate',
        weight: 0.25,
        impact: this.calculateSuccessRateImpact(disputes),
        description: 'Current dispute resolution effectiveness'
      },
      {
        name: 'Average Resolution Time',
        weight: 0.2,
        impact: this.calculateTimeImpact(disputes),
        description: 'Time efficiency in dispute resolution'
      },
      {
        name: 'Escalation Rate',
        weight: 0.15,
        impact: this.calculateEscalationImpact(disputes),
        description: 'Frequency of dispute escalations'
      },
      {
        name: 'User Satisfaction',
        weight: 0.1,
        impact: this.calculateSatisfactionImpact(disputes),
        description: 'User satisfaction with resolution process'
      }
    ];

    const riskScore = factors.reduce((score, factor) => {
      const impactMultiplier = factor.impact === 'negative' ? -1 : factor.impact === 'positive' ? 1 : 0;
      return score + (factor.weight * impactMultiplier);
    }, 0.5);

    const likelihood = Math.max(0, Math.min(1, riskScore));
    const confidence = this.calculateModelConfidence(disputes);

    return {
      riskScore: Math.round(riskScore * 100),
      likelihood: Math.round(likelihood * 100),
      factors,
      confidence,
      recommendations: this.generateRecommendations(factors, riskScore)
    };
  }

  static filterDisputes(disputes: DisputeAnalytics[], filter: AnalyticsFilter): DisputeAnalytics[] {
    return disputes.filter(dispute => {
      if (filter.dateRange) {
        const disputeDate = new Date(dispute.createdAt);
        if (disputeDate < filter.dateRange.from || disputeDate > filter.dateRange.to) {
          return false;
        }
      }

      if (filter.status && !filter.status.includes(dispute.status)) {
        return false;
      }

      if (filter.type && !filter.type.includes(dispute.type)) {
        return false;
      }

      if (filter.category && !filter.category.includes(dispute.category)) {
        return false;
      }

      if (filter.priority && !filter.priority.includes(dispute.priority)) {
        return false;
      }

      if (filter.assignedTo && filter.assignedTo.length > 0) {
        if (!dispute.assignedTo || !filter.assignedTo.includes(dispute.assignedTo)) {
          return false;
        }
      }

      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some(tag => dispute.tags.includes(tag));
        if (!hasMatchingTag) {
          return false;
        }
      }

      return true;
    });
  }

  static convertToChartData(data: any[], labelKey: string, valueKey: string): ChartData[] {
    return data.map((item, index) => ({
      name: item[labelKey],
      value: item[valueKey],
      percentage: this.calculatePercentage(item[valueKey], data, valueKey),
      color: this.getColorByIndex(index)
    }));
  }

  static convertToTimeSeriesData(disputes: DisputeAnalytics[], metric: string): TimeSeriesData[] {
    const grouped = this.groupDisputesByPeriod(disputes, 'daily');

    return Object.entries(grouped).map(([date, disputes]) => ({
      timestamp: new Date(date),
      value: this.calculateMetricValue(disputes, metric),
      label: date
    })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  static createSegmentedData(disputes: DisputeAnalytics[], segmentBy: keyof DisputeAnalytics): SegmentData[] {
    const segments: Map<string, DisputeAnalytics[]> = new Map();

    disputes.forEach(dispute => {
      const segmentValue = String(dispute[segmentBy]);
      if (!segments.has(segmentValue)) {
        segments.set(segmentValue, []);
      }
      segments.get(segmentValue)!.push(dispute);
    });

    const total = disputes.length;

    return Array.from(segments.entries()).map(([segment, segmentDisputes]) => {
      const value = segmentDisputes.length;
      const percentage = total > 0 ? (value / total) * 100 : 0;

      const recentCount = this.getRecentDisputes(segmentDisputes, 30).length;
      const olderCount = this.getDisputesInRange(segmentDisputes, 60, 30).length;
      const trend = olderCount > 0 ? ((recentCount - olderCount) / olderCount) * 100 : 0;

      return {
        segment,
        value,
        percentage,
        trend
      };
    }).sort((a, b) => b.value - a.value);
  }

  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
      return `${hours}h ${remainingMinutes}m`;
    } else {
      const days = Math.floor(minutes / 1440);
      const remainingHours = Math.floor((minutes % 1440) / 60);
      return `${days}d ${remainingHours}h`;
    }
  }

  static formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  static formatNumber(value: number, compact: boolean = false): string {
    if (compact) {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
    }
    return value.toLocaleString();
  }

  static calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  static calculateMovingAverage(data: number[], window: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - window + 1);
      const subset = data.slice(start, i + 1);
      const average = subset.reduce((sum, val) => sum + val, 0) / subset.length;
      result.push(average);
    }
    return result;
  }

  private static calculateRecurringDisputes(disputes: DisputeAnalytics[]): number {
    const userDisputes: Map<string, DisputeAnalytics[]> = new Map();

    disputes.forEach(dispute => {
      const userId = dispute.assignedTo || 'unknown';
      if (!userDisputes.has(userId)) {
        userDisputes.set(userId, []);
      }
      userDisputes.get(userId)!.push(dispute);
    });

    return Array.from(userDisputes.values()).filter(userDisputeList => userDisputeList.length > 1).length;
  }

  private static groupDisputesByPeriod(
    disputes: DisputeAnalytics[],
    period: 'daily' | 'weekly' | 'monthly'
  ): Record<string, DisputeAnalytics[]> {
    const groups: Record<string, DisputeAnalytics[]> = {};

    disputes.forEach(dispute => {
      const date = new Date(dispute.createdAt);
      let key: string;

      switch (period) {
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(dispute);
    });

    return groups;
  }

  private static getRecentDisputes(disputes: DisputeAnalytics[], days: number): DisputeAnalytics[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return disputes.filter(dispute => new Date(dispute.createdAt) >= cutoffDate);
  }

  private static getDisputesInRange(
    disputes: DisputeAnalytics[],
    startDaysAgo: number,
    endDaysAgo: number
  ): DisputeAnalytics[] {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - startDaysAgo);

    const endDate = new Date();
    endDate.setDate(endDate.getDate() - endDaysAgo);

    return disputes.filter(dispute => {
      const disputeDate = new Date(dispute.createdAt);
      return disputeDate >= endDate && disputeDate <= startDate;
    });
  }

  private static calculateVolumeImpact(disputes: DisputeAnalytics[]): 'positive' | 'negative' | 'neutral' {
    const recent = this.getRecentDisputes(disputes, 30);
    const older = this.getDisputesInRange(disputes, 60, 30);

    if (recent.length > older.length * 1.2) return 'negative';
    if (recent.length < older.length * 0.8) return 'positive';
    return 'neutral';
  }

  private static calculateSuccessRateImpact(disputes: DisputeAnalytics[]): 'positive' | 'negative' | 'neutral' {
    const resolved = disputes.filter(d => d.status === DisputeStatus.RESOLVED);
    const rate = disputes.length > 0 ? resolved.length / disputes.length : 0;

    if (rate > 0.8) return 'positive';
    if (rate < 0.6) return 'negative';
    return 'neutral';
  }

  private static calculateTimeImpact(disputes: DisputeAnalytics[]): 'positive' | 'negative' | 'neutral' {
    const resolved = disputes.filter(d => d.resolutionTime);
    const avgTime = resolved.length > 0
      ? resolved.reduce((sum, d) => sum + (d.resolutionTime || 0), 0) / resolved.length
      : 0;

    if (avgTime < 1440) return 'positive'; // Less than 1 day
    if (avgTime > 4320) return 'negative'; // More than 3 days
    return 'neutral';
  }

  private static calculateEscalationImpact(disputes: DisputeAnalytics[]): 'positive' | 'negative' | 'neutral' {
    const escalated = disputes.filter(d => d.escalationLevel > 0);
    const rate = disputes.length > 0 ? escalated.length / disputes.length : 0;

    if (rate < 0.1) return 'positive';
    if (rate > 0.3) return 'negative';
    return 'neutral';
  }

  private static calculateSatisfactionImpact(disputes: DisputeAnalytics[]): 'positive' | 'negative' | 'neutral' {
    const withSatisfaction = disputes.filter(d => d.userSatisfactionScore);
    const avgSatisfaction = withSatisfaction.length > 0
      ? withSatisfaction.reduce((sum, d) => sum + (d.userSatisfactionScore || 0), 0) / withSatisfaction.length
      : 0;

    if (avgSatisfaction > 4) return 'positive';
    if (avgSatisfaction < 3) return 'negative';
    return 'neutral';
  }

  private static calculateModelConfidence(disputes: DisputeAnalytics[]): number {
    const dataPoints = disputes.length;
    const timeSpan = this.calculateTimeSpan(disputes);
    const completeness = this.calculateDataCompleteness(disputes);

    let confidence = 0.5;

    if (dataPoints > 100) confidence += 0.2;
    else if (dataPoints > 50) confidence += 0.1;

    if (timeSpan > 90) confidence += 0.2;
    else if (timeSpan > 30) confidence += 0.1;

    confidence += completeness * 0.1;

    return Math.min(0.95, confidence);
  }

  private static calculateTimeSpan(disputes: DisputeAnalytics[]): number {
    if (disputes.length === 0) return 0;

    const dates = disputes.map(d => new Date(d.createdAt).getTime());
    const earliest = Math.min(...dates);
    const latest = Math.max(...dates);

    return (latest - earliest) / (1000 * 60 * 60 * 24);
  }

  private static calculateDataCompleteness(disputes: DisputeAnalytics[]): number {
    if (disputes.length === 0) return 0;

    const fields = ['resolutionTime', 'userSatisfactionScore', 'assignedTo'];
    let completeness = 0;

    fields.forEach(field => {
      const complete = disputes.filter(d => d[field as keyof DisputeAnalytics] != null).length;
      completeness += complete / disputes.length;
    });

    return completeness / fields.length;
  }

  private static generateRecommendations(factors: any[], riskScore: number): string[] {
    const recommendations: string[] = [];

    if (riskScore > 0.7) {
      recommendations.push('Immediate attention required - high dispute risk detected');
      recommendations.push('Review dispute resolution processes');
      recommendations.push('Consider additional staff training');
    } else if (riskScore > 0.5) {
      recommendations.push('Monitor dispute patterns closely');
      recommendations.push('Implement preventive measures');
    } else {
      recommendations.push('Maintain current dispute resolution practices');
      recommendations.push('Continue monitoring key metrics');
    }

    factors.forEach(factor => {
      if (factor.impact === 'negative' && factor.weight > 0.2) {
        recommendations.push(`Focus on improving ${factor.name.toLowerCase()}`);
      }
    });

    return recommendations;
  }

  private static calculatePercentage(value: number, data: any[], valueKey: string): number {
    const total = data.reduce((sum, item) => sum + item[valueKey], 0);
    return total > 0 ? (value / total) * 100 : 0;
  }

  private static getColorByIndex(index: number): string {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];
    return colors[index % colors.length];
  }

  private static calculateMetricValue(disputes: DisputeAnalytics[], metric: string): number {
    switch (metric) {
      case 'count':
        return disputes.length;
      case 'resolution_time':
        const resolved = disputes.filter(d => d.resolutionTime);
        return resolved.length > 0
          ? resolved.reduce((sum, d) => sum + (d.resolutionTime || 0), 0) / resolved.length
          : 0;
      case 'satisfaction':
        const withSatisfaction = disputes.filter(d => d.userSatisfactionScore);
        return withSatisfaction.length > 0
          ? withSatisfaction.reduce((sum, d) => sum + (d.userSatisfactionScore || 0), 0) / withSatisfaction.length
          : 0;
      default:
        return disputes.length;
    }
  }
}