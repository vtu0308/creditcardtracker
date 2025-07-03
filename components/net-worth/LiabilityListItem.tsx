'use client';

import { Liability } from '@/lib/netWorthStorage';
import { format, parseISO } from 'date-fns';
import { formatCurrency, SupportedCurrency } from '@/lib/utils';
import { Landmark, Calendar, Edit, Trash2, TrendingDown, AlertTriangle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LiabilityListItemProps {
  liability: Liability;
  onEdit: (liability: Liability) => void;
  onDelete: (id: string) => void;
}

const getLiabilityIcon = (type: string) => {
  // TODO: Expand this later with more specific icons based on liability.type
  if (type.toLowerCase().includes('card')) {
    return <CreditCard className="h-6 w-6 text-[#CE839C]" />;
  }
  return <Landmark className="h-6 w-6 text-[#CE839C]" />; // Default icon
};

const formatLiabilityType = (type: string): string => {
  if (type.toLowerCase() === 'etf') return 'ETF'; // Though less likely for a liability
  if (type.toLowerCase() === 'credit_card') return 'Credit Card';
  // Basic snake_case to Title Case, can be expanded
  return type.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

export function LiabilityListItem({ liability, onEdit, onDelete }: LiabilityListItemProps) {
  const formattedAmount = formatCurrency(liability.amount, liability.originalCurrency as SupportedCurrency);
  const formattedDate = format(parseISO(liability.updatedAt), 'M/d/yyyy');

  return (
    <div className="bg-[#F7EDEF] rounded-lg shadow-sm p-4 space-y-3 hover:bg-[#F3E2E7] transition-colors">
      {/* Top Section: Icon, Name/Badge, Actions */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#F3E2E7] rounded-full self-start">
            {getLiabilityIcon(liability.customType || liability.type)}
          </div>
          <div className="flex flex-col">
            <p className="font-bold text-gray-800">{liability.name}</p>
            <Badge className="capitalize text-xs self-start mt-0.5 border-none bg-[#EFD6DD] text-[#CE839C] hover:bg-[#e6c9d3]">
              {formatLiabilityType(liability.customType || liability.type)}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-800 w-8 h-8" onClick={() => onEdit(liability)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 w-8 h-8" onClick={() => onDelete(liability.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Middle Section: Value */}
      <div className="bg-[#FCF6F7] p-3 rounded-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <TrendingDown size={16} className="text-red-600" />
          <span className="text-xs font-medium text-gray-700">Outstanding Balance</span>
        </div>
        <p className="font-bold text-lg text-red-600 tracking-tight">{formattedAmount}</p>
      </div>

      {/* Bottom Section: Details */}
      <div className="space-y-1.5 pl-1">
        {liability.bank && (
          <div className="flex items-center gap-1.5">
            <Landmark size={14} className="text-gray-500" />
            <span className="text-xs font-medium text-gray-700">{liability.bank}</span>
          </div>
        )}
        {liability.interestRate && (
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-red-500" />
            <span className="text-xs font-medium text-red-700">{liability.interestRate}% APR</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 pt-0.5">
          <Calendar size={12} className="text-gray-500" />
          <span className="text-[11px] font-medium text-gray-500">Updated {formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
