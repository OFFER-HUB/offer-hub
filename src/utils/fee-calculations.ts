// quick fee calc stuff
import {
  FeeStructure,
  FeeCalculationInput,
  FeeCalculationResult,
  CalculatedFee,
  CalculatedCommission,
  FeeBreakdown,
  FeeCalculationError,
  UserTier
} from '@/types/fee-management.types';

// hardcoded for now - TODO: move to database later
export const DEFAULT_FEE_STRUCTURES: FeeStructure[] = [
  {
    id: 'basic_structure',
    name: 'Basic Fees',
    isActive: true,
    userTiers: ['basic'],
    rules: [
      {
        id: 'basic_platform_fee',
        type: 'platform_fee',
        calculationMethod: 'percentage',
        value: 5.0,
        isActive: true
      }
    ],
    createdAt: new Date().toISOString()
  },
  // TODO: add premium and enterprise structures
];

// commission rates - just percentages for now
export const COMMISSION_RATES = {
  referral: 5.0,
  partner: 10.0,
  affiliate: 3.0
};

export async function calculateFees(input: FeeCalculationInput): Promise<FeeCalculationResult> {
  // basic validation
  if (input.projectValue <= 0) {
    throw new FeeCalculationError('Project value must be positive', 'INVALID_VALUE');
  }

  // find the right fee structure
  const structure = DEFAULT_FEE_STRUCTURES.find(s => 
    s.isActive && s.userTiers.includes(input.userTier)
  );

  if (!structure) {
    throw new FeeCalculationError('No fee structure found', 'NO_STRUCTURE');
  }

  // calculate the fees
  const fees: CalculatedFee[] = [];
  let totalFees = 0;

  for (const rule of structure.rules) {
    if (!rule.isActive) continue;

    let amount = 0;
    if (rule.calculationMethod === 'percentage') {
      amount = (input.projectValue * rule.value) / 100;
    } else {
      // fixed amount
      amount = rule.value;
    }

    // apply limits if needed
    if (rule.minAmount && amount < rule.minAmount) amount = rule.minAmount;
    if (rule.maxAmount && amount > rule.maxAmount) amount = rule.maxAmount;

    totalFees += amount;

    fees.push({
      id: `fee_${Date.now()}_${Math.random()}`, // quick id generation
      type: rule.type,
      name: rule.type.replace('_', ' ').toUpperCase(),
      description: `${rule.calculationMethod} fee`,
      amount: Math.round(amount * 100) / 100,
      percentage: rule.calculationMethod === 'percentage' ? rule.value : undefined,
      rule,
      applied: true
    });
  }

  // basic commission calc - just for basic users for now
  const commissions: CalculatedCommission[] = [];
  if (input.userTier === 'basic') {
    const commissionAmount = (input.projectValue * 2) / 100; // hardcoded 2%
    commissions.push({
      id: `comm_${Date.now()}`,
      type: 'referral',
      amount: commissionAmount,
      percentage: 2,
      description: 'Platform referral commission',
      status: 'pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      recipient: {
        id: 'platform',
        name: 'Platform',
        type: 'user',
        accountDetails: {},
        paymentPreferences: {
          method: 'bank_transfer',
          currency: input.currency,
          frequency: 'monthly',
          minimumAmount: 50
        }
      }
    });
  }

  const netAmount = input.projectValue - totalFees;

  // build the breakdown
  const breakdown: FeeBreakdown = {
    grossAmount: input.projectValue,
    platformFees: fees.find(f => f.type === 'platform_fee')?.amount || 0,
    serviceFees: fees.find(f => f.type === 'service_fee')?.amount || 0,
    processingFees: fees.find(f => f.type === 'processing_fee')?.amount || 0,
    netAmount,
    feePercentage: (totalFees / input.projectValue) * 100
  };

  return {
    input,
    totalAmount: input.projectValue,
    netAmount,
    fees,
    commissions,
    breakdown,
    calculatedAt: new Date().toISOString()
  };
}


// helper function
export function getDefaultStructure(userTier: string) {
  return DEFAULT_FEE_STRUCTURES.find(s => 
    s.isActive && s.userTiers.includes(userTier as UserTier)
  );
}