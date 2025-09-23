'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Users,
  DollarSign,
  Calendar,
  User,
  Building,
  CreditCard,
  Bitcoin,
  Check,
  AlertCircle,
  Clock,
  Filter,
  Download
} from 'lucide-react';
import {
  CommissionDistributionProps,
  CalculatedCommission,
  CommissionRecipient,
  CommissionType
} from '@/types/fee-management.types';

export function CommissionDistribution({
  commissions,
  onDistribute,
  onRecipientUpdate,
  className
}: CommissionDistributionProps) {
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<CommissionType | 'all'>('all');
  const [editingRecipient, setEditingRecipient] = useState<string | null>(null);
  const [isDistributing, setIsDistributing] = useState(false);

  const filteredCommissions = commissions.filter(
    commission => filterType === 'all' || commission.type === filterType
  );

  const totalSelectedAmount = filteredCommissions
    .filter(commission => selectedCommissions.includes(commission.id))
    .reduce((sum, commission) => sum + commission.amount, 0);

  const handleSelectAll = () => {
    if (selectedCommissions.length === filteredCommissions.length) {
      setSelectedCommissions([]);
    } else {
      setSelectedCommissions(filteredCommissions.map(c => c.id));
    }
  };

  const handleSelectCommission = (commissionId: string) => {
    setSelectedCommissions(prev =>
      prev.includes(commissionId)
        ? prev.filter(id => id !== commissionId)
        : [...prev, commissionId]
    );
  };

  const handleDistribute = async () => {
    if (selectedCommissions.length === 0) return;

    setIsDistributing(true);
    try {
      await onDistribute?.(selectedCommissions);
      setSelectedCommissions([]);
    } catch (error) {
      // TODO: better error handling
      console.error('Distribution failed:', error);
    } finally {
      setIsDistributing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'calculated':
        return 'bg-blue-100 text-blue-800';
      case 'applied':
        return 'bg-green-100 text-green-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return <Building className="h-4 w-4" />;
      case 'paypal':
        return <CreditCard className="h-4 w-4" />;
      case 'crypto':
        return <Bitcoin className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // commission filter options
  const commissionTypes: { value: CommissionType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Types' },
    { value: 'referral', label: 'Referral' },
    { value: 'partner', label: 'Partner' },
    { value: 'affiliate', label: 'Affiliate' },
  ];

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#002333] flex items-center gap-2">
            <Users className="h-5 w-5" />
            Commission Distribution
          </h2>
          <p className="text-[#6D758F] text-sm mt-1">
            Manage and distribute commissions to recipients
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6D758F]">Total Commissions</p>
                <p className="text-2xl font-bold text-[#002333]">
                  {formatCurrency(commissions.reduce((sum, c) => sum + c.amount, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-[#149A9B]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6D758F]">Selected Amount</p>
                <p className="text-2xl font-bold text-[#002333]">
                  {formatCurrency(totalSelectedAmount)}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6D758F]">Recipients</p>
                <p className="text-2xl font-bold text-[#002333]">
                  {new Set(commissions.map(c => c.recipient.id)).size}
                </p>
              </div>
              <Users className="h-8 w-8 text-[#149A9B]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#6D758F]" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as CommissionType | 'all')}
                  className="text-sm border border-[#E1E4ED] rounded-md px-2 py-1 focus:ring-2 focus:ring-[#149A9B] focus:border-transparent"
                >
                  {commissionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedCommissions.length === filteredCommissions.length}
                  onCheckedChange={handleSelectAll}
                  disabled={filteredCommissions.length === 0}
                />
                <span className="text-sm text-[#6D758F]">
                  Select All ({filteredCommissions.length})
                </span>
              </div>
            </div>

            <Button
              onClick={handleDistribute}
              disabled={selectedCommissions.length === 0 || isDistributing}
              className="bg-[#149A9B] hover:bg-[#118787] w-full sm:w-auto"
            >
              {isDistributing ? 'Distributing...' : `Distribute (${selectedCommissions.length})`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Commissions List */}
      <div className="space-y-3">
        {filteredCommissions.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-[#6D758F]">
                <Users className="h-12 w-12 mx-auto mb-3 text-[#B4B9C9]" />
                <p>No commissions found for the selected filter</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredCommissions.map((commission) => (
            <CommissionCard
              key={commission.id}
              commission={commission}
              isSelected={selectedCommissions.includes(commission.id)}
              onSelect={() => handleSelectCommission(commission.id)}
              onRecipientUpdate={onRecipientUpdate}
              isEditing={editingRecipient === commission.recipient.id}
              onStartEdit={() => setEditingRecipient(commission.recipient.id)}
              onStopEdit={() => setEditingRecipient(null)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface CommissionCardProps {
  commission: CalculatedCommission;
  isSelected: boolean;
  onSelect: () => void;
  onRecipientUpdate?: (recipientId: string, updates: Partial<CommissionRecipient>) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
}

function CommissionCard({
  commission,
  isSelected,
  onSelect,
  onRecipientUpdate,
  isEditing,
  onStartEdit,
  onStopEdit
}: CommissionCardProps) {
  const [editedRecipient, setEditedRecipient] = useState(commission.recipient);

  // quick currency formatter
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'calculated':
        return 'bg-blue-100 text-blue-800';
      case 'applied':
        return 'bg-green-100 text-green-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'referral':
        return 'bg-blue-100 text-blue-800';
      case 'partner':
        return 'bg-green-100 text-green-800';
      case 'affiliate':
        return 'bg-purple-100 text-purple-800';
      case 'performance':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return <Building className="h-4 w-4" />;
      case 'paypal':
        return <CreditCard className="h-4 w-4" />;
      case 'crypto':
        return <Bitcoin className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const handleSaveRecipient = () => {
    onRecipientUpdate?.(commission.recipient.id, editedRecipient);
    onStopEdit();
  };

  return (
    <Card className={`transition-all ${isSelected ? 'ring-2 ring-[#149A9B] bg-[#F0FDFD]' : ''}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                className="mt-1"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(commission.type)}>
                    {commission.type.replace('_', ' ')}
                  </Badge>
                  <Badge className={getStatusColor(commission.status)}>
                    {commission.status}
                  </Badge>
                </div>
                <h3 className="font-medium text-[#002333]">{commission.description}</h3>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-[#002333]">
                {formatCurrency(commission.amount)}
              </div>
              <div className="text-sm text-[#6D758F]">
                {commission.percentage.toFixed(1)}%
              </div>
            </div>
          </div>

          <Separator />

          {/* Recipient Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-[#002333] flex items-center gap-2">
                <User className="h-4 w-4" />
                Recipient Details
              </h4>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={onStartEdit}>
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onStopEdit}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveRecipient} className="bg-[#149A9B] hover:bg-[#118787]">
                    Save
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#6D758F] mb-1">Name</label>
                {isEditing ? (
                  <Input
                    value={editedRecipient.name}
                    onChange={(e) => setEditedRecipient(prev => ({ ...prev, name: e.target.value }))}
                    className="text-sm"
                  />
                ) : (
                  <div className="text-sm text-[#002333]">{commission.recipient.name}</div>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#6D758F] mb-1">Type</label>
                <div className="text-sm text-[#002333] capitalize">{commission.recipient.type}</div>
              </div>

              <div>
                <label className="block text-sm text-[#6D758F] mb-1">Payment Method</label>
                <div className="flex items-center gap-2">
                  {getPaymentMethodIcon(commission.recipient.paymentPreferences.method)}
                  <span className="text-sm text-[#002333] capitalize">
                    {commission.recipient.paymentPreferences.method.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#6D758F] mb-1">Currency</label>
                <div className="text-sm text-[#002333]">{commission.recipient.paymentPreferences.currency}</div>
              </div>

              <div>
                <label className="block text-sm text-[#6D758F] mb-1">Payment Frequency</label>
                <div className="text-sm text-[#002333] capitalize">
                  {commission.recipient.paymentPreferences.frequency}
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#6D758F] mb-1">Due Date</label>
                <div className="flex items-center gap-2 text-sm text-[#002333]">
                  <Calendar className="h-3 w-3" />
                  {new Date(commission.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {commission.status === 'pending' && (
              <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">Payment pending approval</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}