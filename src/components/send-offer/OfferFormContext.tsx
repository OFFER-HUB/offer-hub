'use client';

import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { OfferFormData, defaultOfferFormData, PaymentMilestone } from '@/lib/mockData/offer-form-mock';

interface OfferFormState {
  formData: OfferFormData;
  currentStep: number;
  isValid: boolean;
  errors: Record<string, string>;
}

type OfferFormAction =
  | { type: 'UPDATE_FIELD'; field: keyof OfferFormData; value: OfferFormData[keyof OfferFormData] }
  | { type: 'UPDATE_DELIVERABLES'; deliverables: string[] }
  | { type: 'UPDATE_MILESTONES'; milestones: PaymentMilestone[] }
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'CLEAR_ERROR'; field: string }
  | { type: 'CLEAR_ALL_ERRORS' }
  | { type: 'RESET_FORM' }
  | { type: 'VALIDATE_STEP'; step: number };

interface OfferFormContextType {
  state: OfferFormState;
  dispatch: React.Dispatch<OfferFormAction>;
  updateField: (field: keyof OfferFormData, value: OfferFormData[keyof OfferFormData]) => void;
  updateDeliverables: (deliverables: string[]) => void;
  updateMilestones: (milestones: PaymentMilestone[]) => void;
  setCurrentStep: (step: number) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  validateStep: (step: number) => boolean;
  resetForm: () => void;
}

const OfferFormContext = createContext<OfferFormContextType | undefined>(undefined);

const initialState: OfferFormState = {
  formData: { ...defaultOfferFormData },
  currentStep: 1,
  isValid: false,
  errors: {}
};

function offerFormReducer(state: OfferFormState, action: OfferFormAction): OfferFormState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value
        }
      };
    
    case 'UPDATE_DELIVERABLES':
      return {
        ...state,
        formData: {
          ...state.formData,
          deliverables: action.deliverables
        }
      };
    
    case 'UPDATE_MILESTONES':
      return {
        ...state,
        formData: {
          ...state.formData,
          paymentMilestones: action.milestones
        }
      };
    
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.step
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.error
        }
      };
    
    case 'CLEAR_ERROR':
      const { [action.field]: _, ...restErrors } = state.errors;
      return {
        ...state,
        errors: restErrors
      };
    
    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        errors: {}
      };
    
    case 'RESET_FORM':
      return {
        ...initialState,
        formData: { ...defaultOfferFormData }
      };
    
    case 'VALIDATE_STEP':
      const isValid = validateStepData(state.formData, action.step);
      return {
        ...state,
        isValid
      };
    
    default:
      return state;
  }
}

function validateStepData(formData: OfferFormData, step: number): boolean {
  switch (step) {
    case 1:
      return !!(
        formData.offerTitle.trim() &&
        formData.projectDescription.trim() &&
        formData.budgetAmount > 0
      );
    
    case 2:
      return !!(formData.projectDuration);
    
    case 3:
      return !!(
        formData.offerTitle.trim() &&
        formData.projectDescription.trim() &&
        formData.budgetAmount > 0 &&
        formData.projectDuration
      );
    
    default:
      return false;
  }
}

interface OfferFormProviderProps {
  children: ReactNode;
}

export function OfferFormProvider({ children }: OfferFormProviderProps) {
  const [state, dispatch] = useReducer(offerFormReducer, initialState);

  const updateField = useCallback((field: keyof OfferFormData, value: OfferFormData[keyof OfferFormData]) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  }, []);

  const updateDeliverables = useCallback((deliverables: string[]) => {
    dispatch({ type: 'UPDATE_DELIVERABLES', deliverables });
  }, []);

  const updateMilestones = useCallback((milestones: PaymentMilestone[]) => {
    dispatch({ type: 'UPDATE_MILESTONES', milestones });
  }, []);

  const setCurrentStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', step });
  }, []);

  const setError = useCallback((field: string, error: string) => {
    dispatch({ type: 'SET_ERROR', field, error });
  }, []);

  const clearError = useCallback((field: string) => {
    dispatch({ type: 'CLEAR_ERROR', field });
  }, []);

  const clearAllErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    dispatch({ type: 'VALIDATE_STEP', step });
    return validateStepData(state.formData, step);
  }, [state.formData]);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  const contextValue: OfferFormContextType = {
    state,
    dispatch,
    updateField,
    updateDeliverables,
    updateMilestones,
    setCurrentStep,
    setError,
    clearError,
    clearAllErrors,
    validateStep,
    resetForm
  };

  return (
    <OfferFormContext.Provider value={contextValue}>
      {children}
    </OfferFormContext.Provider>
  );
}

export function useOfferForm() {
  const context = useContext(OfferFormContext);
  if (context === undefined) {
    throw new Error('useOfferForm must be used within a OfferFormProvider');
  }
  return context;
}