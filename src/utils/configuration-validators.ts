import { PlatformConfiguration, ConfigurationValidationRule } from '../types/configuration.types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ConfigurationValidator {
  /**
   * Validate a configuration value against its validation rules
   */
  static validateValue(
    value: unknown,
    dataType: PlatformConfiguration['dataType'],
    validationRules?: ConfigurationValidationRule[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic type validation
    const typeValidation = this.validateDataType(value, dataType);
    if (!typeValidation.isValid) {
      errors.push(...typeValidation.errors);
      return { isValid: false, errors, warnings };
    }

    // Apply custom validation rules
    if (validationRules && validationRules.length > 0) {
      for (const rule of validationRules) {
        if (!rule.isActive) continue;

        const ruleResult = this.validateRule(value, rule);
        if (!ruleResult.isValid) {
          errors.push(ruleResult.message);
        } else if (ruleResult.warning) {
          warnings.push(ruleResult.message);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate data type
   */
  private static validateDataType(
    value: unknown,
    dataType: PlatformConfiguration['dataType']
  ): ValidationResult {
    const errors: string[] = [];

    switch (dataType) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push('Value must be a string');
        }
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push('Value must be a valid number');
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push('Value must be a boolean');
        }
        break;
      case 'json':
        if (typeof value !== 'object' || value === null) {
          errors.push('Value must be a valid JSON object');
        }
        break;
      case 'array':
        if (!Array.isArray(value)) {
          errors.push('Value must be an array');
        }
        break;
      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          errors.push('Value must be an object');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * Validate against a specific rule
   */
  private static validateRule(
    value: unknown,
    rule: ConfigurationValidationRule
  ): { isValid: boolean; message: string; warning?: boolean } {
    try {
      switch (rule.type) {
        case 'regex':
          if (typeof value === 'string' && typeof rule.value === 'string') {
            const regex = new RegExp(rule.value);
            if (!regex.test(value)) {
              return { isValid: false, message: rule.message };
            }
          }
          break;

        case 'min':
          if (typeof value === 'number' && typeof rule.value === 'number') {
            if (value < rule.value) {
              return { isValid: false, message: rule.message };
            }
          } else if (typeof value === 'string' && typeof rule.value === 'number') {
            if (value.length < rule.value) {
              return { isValid: false, message: rule.message };
            }
          }
          break;

        case 'max':
          if (typeof value === 'number' && typeof rule.value === 'number') {
            if (value > rule.value) {
              return { isValid: false, message: rule.message };
            }
          } else if (typeof value === 'string' && typeof rule.value === 'number') {
            if (value.length > rule.value) {
              return { isValid: false, message: rule.message };
            }
          }
          break;

        case 'enum':
          if (Array.isArray(rule.value)) {
            if (!rule.value.includes(String(value))) {
              return { isValid: false, message: rule.message };
            }
          }
          break;

        case 'custom':
          // For custom validation, we would need to implement a way to execute custom functions
          // This is a placeholder for future implementation
          console.warn('Custom validation not yet implemented');
          break;
      }

      return { isValid: true, message: rule.message };
    } catch (error) {
      return { 
        isValid: false, 
        message: `Validation error: ${(error as Error).message}`,
        warning: true 
      };
    }
  }

  /**
   * Validate configuration dependencies
   */
  static validateDependencies(
    configurations: PlatformConfiguration[],
    currentConfig: PlatformConfiguration
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!currentConfig.dependencies || currentConfig.dependencies.length === 0) {
      return { isValid: true, errors, warnings };
    }

    for (const dependency of currentConfig.dependencies) {
      const dependentConfig = configurations.find(
        config => config.key === dependency.configurationKey
      );

      if (!dependentConfig) {
        errors.push(`Dependency configuration "${dependency.configurationKey}" not found`);
        continue;
      }

      try {
        // Evaluate the dependency condition
        const conditionResult = this.evaluateCondition(
          dependentConfig.value,
          dependency.condition
        );

        if (!conditionResult) {
          errors.push(dependency.message);
        }
      } catch (error) {
        warnings.push(`Failed to evaluate dependency condition: ${(error as Error).message}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Evaluate a dependency condition
   */
  private static evaluateCondition(value: unknown, condition: string): boolean {
    try {
      // Replace 'value' in the condition with the actual value
      const expression = condition.replace(/value/g, JSON.stringify(value));
      
      // Use Function constructor to safely evaluate the condition
      // Note: In production, you might want to use a more sophisticated expression evaluator
      const result = new Function('return ' + expression)();
      return Boolean(result);
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }

  /**
   * Validate all configurations in a batch
   */
  static validateBatch(configurations: PlatformConfiguration[]): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};

    for (const config of configurations) {
      // Validate the configuration value
      const valueValidation = this.validateValue(
        config.value,
        config.dataType,
        config.validationRules
      );

      // Validate dependencies
      const dependencyValidation = this.validateDependencies(configurations, config);

      // Combine results
      results[config.id] = {
        isValid: valueValidation.isValid && dependencyValidation.isValid,
        errors: [...valueValidation.errors, ...dependencyValidation.errors],
        warnings: [...valueValidation.warnings, ...dependencyValidation.warnings],
      };
    }

    return results;
  }

  /**
   * Get validation summary for multiple configurations
   */
  static getValidationSummary(results: Record<string, ValidationResult>) {
    const total = Object.keys(results).length;
    const valid = Object.values(results).filter(result => result.isValid).length;
    const invalid = total - valid;
    const withWarnings = Object.values(results).filter(result => result.warnings.length > 0).length;

    return {
      total,
      valid,
      invalid,
      withWarnings,
      percentage: total > 0 ? Math.round((valid / total) * 100) : 0,
    };
  }
}
