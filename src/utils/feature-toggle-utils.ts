import { FeatureToggle, FeatureToggleTargetAudience } from '../types/feature-toggle.types';

export interface FeatureToggleEvaluation {
  isEnabled: boolean;
  variant?: string;
  reason?: string;
  matchedCriteria?: Array<{ field: string; operator: string; value: unknown }>;
}

export interface FeatureToggleAnalytics {
  totalEvaluations: number;
  enabledEvaluations: number;
  disabledEvaluations: number;
  variantDistribution: Record<string, number>;
  userSegmentDistribution: Record<string, number>;
  errorRate: number;
}

export class FeatureToggleUtils {
  /**
   * Evaluate if a feature toggle should be enabled for a given user
   */
  static evaluateFeatureToggle(
    featureToggle: FeatureToggle,
    userContext?: Record<string, unknown>
  ): FeatureToggleEvaluation {
    // Check if feature toggle is active
    if (!featureToggle.isActive) {
      return {
        isEnabled: false,
        reason: 'Feature toggle is not active',
      };
    }

    // Check if feature toggle is in the correct environment
    if (featureToggle.environment !== this.getCurrentEnvironment()) {
      return {
        isEnabled: false,
        reason: `Feature toggle is not available in ${this.getCurrentEnvironment()} environment`,
      };
    }

    // Check dependencies
    if (featureToggle.dependencies && featureToggle.dependencies.length > 0) {
      const dependencyCheck = this.checkDependencies(featureToggle.dependencies);
      if (!dependencyCheck.satisfied) {
        return {
          isEnabled: false,
          reason: `Dependency not satisfied: ${dependencyCheck.reason}`,
        };
      }
    }

    // Evaluate based on rollout strategy
    switch (featureToggle.rolloutStrategy) {
      case 'all':
        return this.evaluateAllUsersStrategy(featureToggle);
      case 'percentage':
        return this.evaluatePercentageStrategy(featureToggle, userContext);
      case 'user_group':
        return this.evaluateUserGroupStrategy(featureToggle, userContext);
      case 'attributes':
        return this.evaluateAttributesStrategy(featureToggle, userContext);
      default:
        return {
          isEnabled: false,
          reason: 'Unknown rollout strategy',
        };
    }
  }

  /**
   * Evaluate all users strategy
   */
  private static evaluateAllUsersStrategy(featureToggle: FeatureToggle): FeatureToggleEvaluation {
    return {
      isEnabled: true,
      variant: this.getVariant(featureToggle),
      reason: 'All users strategy - feature enabled for everyone',
    };
  }

  /**
   * Evaluate percentage-based rollout strategy
   */
  private static evaluatePercentageStrategy(
    featureToggle: FeatureToggle,
    userContext?: Record<string, unknown>
  ): FeatureToggleEvaluation {
    const percentage = featureToggle.rolloutPercentage || 0;
    
    if (percentage >= 100) {
      return {
        isEnabled: true,
        variant: this.getVariant(featureToggle),
        reason: 'Percentage strategy - 100% rollout',
      };
    }

    if (percentage <= 0) {
      return {
        isEnabled: false,
        reason: 'Percentage strategy - 0% rollout',
      };
    }

    // Generate a consistent hash based on user ID or other stable identifier
    const userId = userContext?.userId || userContext?.id || 'anonymous';
    const hash = this.hashString(`${featureToggle.key}-${userId}`);
    const userPercentage = (hash % 100) + 1;

    const isEnabled = userPercentage <= percentage;
    
    return {
      isEnabled,
      variant: isEnabled ? this.getVariant(featureToggle) : undefined,
      reason: `Percentage strategy - user in ${isEnabled ? 'enabled' : 'disabled'} segment (${userPercentage}%)`,
    };
  }

  /**
   * Evaluate user group-based rollout strategy
   */
  private static evaluateUserGroupStrategy(
    featureToggle: FeatureToggle,
    userContext?: Record<string, unknown>
  ): FeatureToggleEvaluation {
    if (!featureToggle.targetAudience || featureToggle.targetAudience.type !== 'user_group') {
      return {
        isEnabled: false,
        reason: 'No target audience defined for user group strategy',
      };
    }

    const matches = this.evaluateTargetAudience(featureToggle.targetAudience, userContext);
    
    return {
      isEnabled: matches.isMatch,
      variant: matches.isMatch ? this.getVariant(featureToggle) : undefined,
      reason: matches.isMatch ? 'User group strategy - user matches target audience' : 'User group strategy - user does not match target audience',
      matchedCriteria: matches.matchedCriteria,
    };
  }

  /**
   * Evaluate attribute-based rollout strategy
   */
  private static evaluateAttributesStrategy(
    featureToggle: FeatureToggle,
    userContext?: Record<string, unknown>
  ): FeatureToggleEvaluation {
    if (!featureToggle.targetAudience || featureToggle.targetAudience.type !== 'attributes') {
      return {
        isEnabled: false,
        reason: 'No target audience defined for attributes strategy',
      };
    }

    const matches = this.evaluateTargetAudience(featureToggle.targetAudience, userContext);
    
    return {
      isEnabled: matches.isMatch,
      variant: matches.isMatch ? this.getVariant(featureToggle) : undefined,
      reason: matches.isMatch ? 'Attributes strategy - user matches criteria' : 'Attributes strategy - user does not match criteria',
      matchedCriteria: matches.matchedCriteria,
    };
  }

  /**
   * Evaluate target audience criteria
   */
  private static evaluateTargetAudience(
    targetAudience: FeatureToggleTargetAudience,
    userContext?: Record<string, unknown>
  ): { isMatch: boolean; matchedCriteria: Array<{ field: string; operator: string; value: unknown }> } {
    if (!targetAudience.criteria || targetAudience.criteria.length === 0) {
      return { isMatch: false, matchedCriteria: [] };
    }

    const matchedCriteria: Array<{ field: string; operator: string; value: unknown }> = [];

    for (const criterion of targetAudience.criteria) {
      const userValue = this.getNestedValue(userContext || {}, criterion.field);
      
      if (this.evaluateCriterion(userValue, criterion.operator, criterion.value)) {
        matchedCriteria.push({
          field: criterion.field,
          operator: criterion.operator,
          value: criterion.value,
        });
      }
    }

    // All criteria must match for user group strategy
    // For attributes strategy, at least one criterion must match
    const isMatch = targetAudience.type === 'user_group' 
      ? matchedCriteria.length === targetAudience.criteria.length
      : matchedCriteria.length > 0;

    return { isMatch, matchedCriteria };
  }

  /**
   * Evaluate a single criterion
   */
  private static evaluateCriterion(
    userValue: unknown,
    operator: string,
    criterionValue: unknown
  ): boolean {
    switch (operator) {
      case 'equals':
        return userValue === criterionValue;
      case 'not_equals':
        return userValue !== criterionValue;
      case 'greater_than':
        return Number(userValue) > Number(criterionValue);
      case 'less_than':
        return Number(userValue) < Number(criterionValue);
      case 'contains':
        if (typeof userValue === 'string' && typeof criterionValue === 'string') {
          return userValue.includes(criterionValue);
        }
        if (Array.isArray(userValue) && Array.isArray(criterionValue)) {
          return criterionValue.every(item => userValue.includes(item));
        }
        return false;
      case 'not_contains':
        if (typeof userValue === 'string' && typeof criterionValue === 'string') {
          return !userValue.includes(criterionValue);
        }
        if (Array.isArray(userValue) && Array.isArray(criterionValue)) {
          return !criterionValue.every(item => userValue.includes(item));
        }
        return true;
      default:
        return false;
    }
  }

  /**
   * Check feature toggle dependencies
   */
  private static checkDependencies(
    dependencies: Array<{ featureKey: string; condition: 'enabled' | 'disabled' }>
  ): { satisfied: boolean; reason?: string } {
    // This would typically check against a feature toggle service
    // For now, we'll assume all dependencies are satisfied
    // In a real implementation, you would check the actual state of dependent feature toggles
    
    for (const dependency of dependencies) {
      // Placeholder logic - replace with actual dependency checking
      const dependentToggleState = true; // This should come from your feature toggle service
      
      if (dependency.condition === 'enabled' && !dependentToggleState) {
        return {
          satisfied: false,
          reason: `Dependency '${dependency.featureKey}' is not enabled`,
        };
      }
      
      if (dependency.condition === 'disabled' && dependentToggleState) {
        return {
          satisfied: false,
          reason: `Dependency '${dependency.featureKey}' is not disabled`,
        };
      }
    }

    return { satisfied: true };
  }

  /**
   * Get variant for feature toggle
   */
  private static getVariant(featureToggle: FeatureToggle): string | undefined {
    if (featureToggle.type === 'variant' && typeof featureToggle.defaultValue === 'string') {
      return featureToggle.defaultValue;
    }
    
    if (featureToggle.type === 'boolean') {
      return featureToggle.defaultValue ? 'enabled' : 'disabled';
    }
    
    return undefined;
  }

  /**
   * Generate a consistent hash from a string
   */
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get nested value from object using dot notation
   */
  private static getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current, key) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  /**
   * Get current environment
   */
  private static getCurrentEnvironment(): string {
    // This should be determined by your application's environment detection logic
    return process.env.NODE_ENV || 'development';
  }

  /**
   * Batch evaluate multiple feature toggles
   */
  static batchEvaluateFeatureToggles(
    featureToggles: FeatureToggle[],
    userContext?: Record<string, unknown>
  ): Record<string, FeatureToggleEvaluation> {
    const results: Record<string, FeatureToggleEvaluation> = {};

    for (const toggle of featureToggles) {
      results[toggle.key] = this.evaluateFeatureToggle(toggle, userContext);
    }

    return results;
  }

  /**
   * Get feature toggle analytics summary
   */
  static getAnalyticsSummary(
    featureToggles: FeatureToggle[],
    evaluationHistory?: Array<{ toggleKey: string; enabled: boolean; variant?: string; timestamp: Date }>
  ): FeatureToggleAnalytics {
    const totalEvaluations = evaluationHistory?.length || 0;
    const enabledEvaluations = evaluationHistory?.filter(e => e.enabled).length || 0;
    const disabledEvaluations = totalEvaluations - enabledEvaluations;

    const variantDistribution: Record<string, number> = {};
    const userSegmentDistribution: Record<string, number> = {};

    if (evaluationHistory) {
      evaluationHistory.forEach(evaluation => {
        if (evaluation.variant) {
          variantDistribution[evaluation.variant] = (variantDistribution[evaluation.variant] || 0) + 1;
        }
      });
    }

    // Calculate error rate (placeholder - would need actual error tracking)
    const errorRate = 0.01; // 1% error rate

    return {
      totalEvaluations,
      enabledEvaluations,
      disabledEvaluations,
      variantDistribution,
      userSegmentDistribution,
      errorRate,
    };
  }

  /**
   * Validate feature toggle configuration
   */
  static validateFeatureToggle(featureToggle: FeatureToggle): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!featureToggle.key || featureToggle.key.trim().length === 0) {
      errors.push('Feature key is required');
    }

    if (!featureToggle.name || featureToggle.name.trim().length === 0) {
      errors.push('Feature name is required');
    }

    if (!featureToggle.category) {
      errors.push('Feature category is required');
    }

    if (!featureToggle.type) {
      errors.push('Feature type is required');
    }

    if (featureToggle.rolloutStrategy === 'percentage') {
      const percentage = featureToggle.rolloutPercentage || 0;
      if (percentage < 0 || percentage > 100) {
        errors.push('Rollout percentage must be between 0 and 100');
      }
    }

    if ((featureToggle.rolloutStrategy === 'user_group' || featureToggle.rolloutStrategy === 'attributes') 
        && !featureToggle.targetAudience) {
      errors.push('Target audience is required for user group or attributes rollout strategy');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
