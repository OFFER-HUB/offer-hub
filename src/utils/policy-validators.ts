import { Policy, PolicyRule, PolicyAction } from '../types/policy.types';

export interface PolicyValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PolicyTestResult {
  violations: string[];
  suggestions: string[];
  matchedRules: PolicyRule[];
  executedActions: PolicyAction[];
}

export class PolicyValidator {
  /**
   * Validate a policy structure
   */
  static validatePolicy(policy: Policy): PolicyValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!policy.name || policy.name.trim().length === 0) {
      errors.push('Policy name is required');
    }

    if (!policy.category) {
      errors.push('Policy category is required');
    }

    if (!policy.rules || policy.rules.length === 0) {
      errors.push('At least one rule is required');
    }

    if (!policy.actions || policy.actions.length === 0) {
      errors.push('At least one action is required');
    }

    // Validate rules
    if (policy.rules) {
      for (let i = 0; i < policy.rules.length; i++) {
        const rule = policy.rules[i];
        const ruleValidation = this.validateRule(rule, i);
        if (!ruleValidation.isValid) {
          errors.push(...ruleValidation.errors);
        }
        warnings.push(...ruleValidation.warnings);
      }
    }

    // Validate actions
    if (policy.actions) {
      for (let i = 0; i < policy.actions.length; i++) {
        const action = policy.actions[i];
        const actionValidation = this.validateAction(action, i);
        if (!actionValidation.isValid) {
          errors.push(...actionValidation.errors);
        }
        warnings.push(...actionValidation.warnings);
      }
    }

    // Check for conflicting rules
    const conflictWarnings = this.checkRuleConflicts(policy.rules || []);
    warnings.push(...conflictWarnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate a policy rule
   */
  static validateRule(rule: PolicyRule, index: number): PolicyValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!rule.name || rule.name.trim().length === 0) {
      errors.push(`Rule ${index + 1}: Name is required`);
    }

    if (!rule.type) {
      errors.push(`Rule ${index + 1}: Type is required`);
    }

    if (!rule.operator) {
      errors.push(`Rule ${index + 1}: Operator is required`);
    }

    if (rule.field === undefined || rule.field === null || rule.field === '') {
      errors.push(`Rule ${index + 1}: Field is required`);
    }

    if (rule.value === undefined || rule.value === null) {
      errors.push(`Rule ${index + 1}: Value is required`);
    }

    // Validate operator and value compatibility
    const compatibilityCheck = this.validateOperatorValueCompatibility(rule.operator, rule.value);
    if (!compatibilityCheck.isValid) {
      errors.push(`Rule ${index + 1}: ${compatibilityCheck.message}`);
    }

    // Check for potentially problematic field paths
    if (rule.field && rule.field.includes('..')) {
      warnings.push(`Rule ${index + 1}: Field path contains '..' which may be unsafe`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate a policy action
   */
  static validateAction(action: PolicyAction, index: number): PolicyValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!action.name || action.name.trim().length === 0) {
      errors.push(`Action ${index + 1}: Name is required`);
    }

    if (!action.type) {
      errors.push(`Action ${index + 1}: Type is required`);
    }

    // Validate action-specific parameters
    const parameterValidation = this.validateActionParameters(action);
    if (!parameterValidation.isValid) {
      errors.push(...parameterValidation.errors);
    }
    warnings.push(...parameterValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate operator and value compatibility
   */
  private static validateOperatorValueCompatibility(
    operator: PolicyRule['operator'],
    value: PolicyRule['value']
  ): { isValid: boolean; message: string } {
    switch (operator) {
      case 'greater_than':
      case 'less_than':
        if (typeof value !== 'number' && !this.isNumericString(value)) {
          return {
            isValid: false,
            message: `Operator '${operator}' requires a numeric value`,
          };
        }
        break;
      case 'contains':
      case 'not_contains':
      case 'starts_with':
      case 'ends_with':
        if (typeof value !== 'string' && !Array.isArray(value)) {
          return {
            isValid: false,
            message: `Operator '${operator}' requires a string or array value`,
          };
        }
        break;
    }

    return { isValid: true, message: '' };
  }

  /**
   * Check if a value is a numeric string
   */
  private static isNumericString(value: unknown): boolean {
    return typeof value === 'string' && !isNaN(Number(value)) && !isNaN(parseFloat(value));
  }

  /**
   * Validate action parameters
   */
  private static validateActionParameters(action: PolicyAction): PolicyValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!action.parameters) {
      return { isValid: true, errors, warnings };
    }

    switch (action.type) {
      case 'notify':
        if (!action.parameters.email && !action.parameters.webhook) {
          errors.push(`Action '${action.name}': Email or webhook is required for notify action`);
        }
        break;
      case 'block':
        if (!action.parameters.duration && !action.parameters.permanent) {
          warnings.push(`Action '${action.name}': Consider specifying duration for block action`);
        }
        break;
      case 'auto_correct':
        if (!action.parameters.correctionValue && !action.parameters.correctionFunction) {
          errors.push(`Action '${action.name}': Correction value or function is required for auto_correct action`);
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check for conflicting rules
   */
  private static checkRuleConflicts(rules: PolicyRule[]): string[] {
    const warnings: string[] = [];

    // Check for contradictory rules on the same field
    for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) {
        const rule1 = rules[i];
        const rule2 = rules[j];

        if (rule1.field === rule2.field) {
          // Check for contradictory operators
          if (
            (rule1.operator === 'equals' && rule2.operator === 'not_equals' && rule1.value === rule2.value) ||
            (rule1.operator === 'not_equals' && rule2.operator === 'equals' && rule1.value === rule2.value) ||
            (rule1.operator === 'greater_than' && rule2.operator === 'less_than' && rule1.value >= rule2.value) ||
            (rule1.operator === 'less_than' && rule2.operator === 'greater_than' && rule1.value <= rule2.value)
          ) {
            warnings.push(
              `Potential conflict: Rules '${rule1.name}' and '${rule2.name}' may be contradictory on field '${rule1.field}'`
            );
          }
        }
      }
    }

    return warnings;
  }

  /**
   * Test a policy against sample data
   */
  static testPolicy(policy: Policy, testData: Record<string, unknown>): PolicyTestResult {
    const violations: string[] = [];
    const suggestions: string[] = [];
    const matchedRules: PolicyRule[] = [];
    const executedActions: PolicyAction[] = [];

    if (!policy.isActive) {
      return {
        violations: ['Policy is not active'],
        suggestions: ['Activate the policy to test it'],
        matchedRules,
        executedActions,
      };
    }

    // Evaluate rules
    for (const rule of policy.rules) {
      if (!rule.isActive) continue;

      const ruleResult = this.evaluateRule(rule, testData);
      if (ruleResult.matches) {
        matchedRules.push(rule);
        if (ruleResult.violation) {
          violations.push(ruleResult.violation);
        }
      }
    }

    // Execute actions for matched rules
    if (matchedRules.length > 0) {
      for (const action of policy.actions) {
        if (!action.isActive) continue;
        executedActions.push(action);
      }
    }

    // Generate suggestions
    if (matchedRules.length === 0 && policy.rules.length > 0) {
      suggestions.push('No rules matched the test data. Consider reviewing rule conditions.');
    }

    if (executedActions.length === 0 && matchedRules.length > 0) {
      suggestions.push('Rules matched but no actions were executed. Check if actions are active.');
    }

    return {
      violations,
      suggestions,
      matchedRules,
      executedActions,
    };
  }

  /**
   * Evaluate a rule against test data
   */
  private static evaluateRule(
    rule: PolicyRule,
    data: Record<string, unknown>
  ): { matches: boolean; violation?: string } {
    try {
      // Get the field value from test data using dot notation
      const fieldValue = this.getNestedValue(data, rule.field);

      if (fieldValue === undefined) {
        return { matches: false, violation: `Field '${rule.field}' not found in test data` };
      }

      // Evaluate the rule condition
      const matches = this.evaluateCondition(fieldValue, rule.operator, rule.value);

      return {
        matches,
        violation: matches ? `Rule '${rule.name}' triggered: ${rule.description || 'No description'}` : undefined,
      };
    } catch (error) {
      return {
        matches: false,
        violation: `Error evaluating rule '${rule.name}': ${(error as Error).message}`,
      };
    }
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
   * Evaluate a condition
   */
  private static evaluateCondition(
    fieldValue: unknown,
    operator: PolicyRule['operator'],
    ruleValue: PolicyRule['value']
  ): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === ruleValue;
      case 'not_equals':
        return fieldValue !== ruleValue;
      case 'greater_than':
        return Number(fieldValue) > Number(ruleValue);
      case 'less_than':
        return Number(fieldValue) < Number(ruleValue);
      case 'contains':
        if (typeof fieldValue === 'string' && typeof ruleValue === 'string') {
          return fieldValue.includes(ruleValue);
        }
        if (Array.isArray(fieldValue) && Array.isArray(ruleValue)) {
          return ruleValue.every(item => fieldValue.includes(item));
        }
        return false;
      case 'not_contains':
        if (typeof fieldValue === 'string' && typeof ruleValue === 'string') {
          return !fieldValue.includes(ruleValue);
        }
        if (Array.isArray(fieldValue) && Array.isArray(ruleValue)) {
          return !ruleValue.every(item => fieldValue.includes(item));
        }
        return true;
      case 'starts_with':
        return typeof fieldValue === 'string' && typeof ruleValue === 'string' && fieldValue.startsWith(ruleValue);
      case 'ends_with':
        return typeof fieldValue === 'string' && typeof ruleValue === 'string' && fieldValue.endsWith(ruleValue);
      default:
        return false;
    }
  }
}
