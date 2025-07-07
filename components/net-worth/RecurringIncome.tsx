'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { netWorthStorage } from '@/lib/netWorthStorage';
import { formatCurrency, SupportedCurrency } from '@/lib/utils';

const formatAmount = (value: string) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  // Convert to number and format with commas
  const formatted = new Intl.NumberFormat('vi-VN').format(Number(digits));
  return `₫${formatted}`;
};

const parseAmount = (value: string) => {
  // Remove currency symbol and all non-digits
  return Number(value.replace(/[^\d]/g, ''));
};

export default function RecurringIncome() {
  const { data: income = { amount: 3500000, dayOfMonth: 25, isEnabled: true, originalCurrency: 'VND', vndAmount: 3500000 } } = useQuery({
    queryKey: ['recurringIncome'],
    queryFn: () => netWorthStorage.getRecurringIncome()
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isEnabled, setIsEnabled] = useState(income?.isEnabled ?? true);
  const [amount, setAmount] = useState<string>(formatAmount(String(income?.amount ?? 3500000)));
  const [dayOfMonth, setDayOfMonth] = useState(income?.dayOfMonth ?? 25);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isEditing) {
      setAmount(formatAmount(String(income?.amount ?? 3500000)));
      setDayOfMonth(income?.dayOfMonth ?? 25);
    }
  }, [income, isEditing]);

  const { mutate: saveIncome } = useMutation({
    mutationFn: () => {
      setIsSaving(true);
      return netWorthStorage.setRecurringIncome({
        amount: parseAmount(amount),
        dayOfMonth,
        isEnabled,
        originalCurrency: 'VND',
        vndAmount: parseAmount(amount)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringIncome'] });
      setIsEditing(false);
      setIsSaving(false);
    },
    onError: () => {
      setIsSaving(false);
    }
  });


  const nextPaymentDate = new Date();
  nextPaymentDate.setDate(income?.dayOfMonth || 25);
  if (nextPaymentDate < new Date()) {
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
  }

  const handleCancel = () => {
    setIsEditing(false);
    setAmount(formatAmount(String(income?.amount ?? 3500000)));
    setDayOfMonth(income?.dayOfMonth ?? 25);
  };

  return (
    <Card className="bg-[#F7EDEF] p-4 rounded-xl">
      <CardContent className="p-0 space-y-4">
        {/* Header */}
        <div className="pb-4 border-b border-[#F5E8EB]">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-800">Recurring Income</h2>
          </div>
          <p className="text-sm text-gray-500 pl-1">
            Set up automatic credit card payment from your monthly income
          </p>
        </div>

        {!isEditing ? (
          <div className="space-y-4 pt-4">
            {/* Monthly Income Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-[#F3E2E7] flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-[#CE839C]" />
                </div>
                <div>
                  <div className="font-bold text-gray-800">Monthly Income</div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(parseAmount(amount), 'VND' as SupportedCurrency)} on the {dayOfMonth}th of each month
                  </div>
                </div>
              </div>
              <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
            </div>

            {/* Next Payment Box */}
            <div className="bg-[#FBF6F7] rounded-lg p-3 border border-[#F5E8EB]">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-semibold text-gray-800">Next Payment</div>
                  <div className="text-xs text-gray-500">
                    Credit card balances will be automatically paid off on this date
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-800">
                  {nextPaymentDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <Button
              variant="outline"
              className="w-auto bg-[#F8F2F3] hover:bg-[#F3E2E7] border-[#E5D9DC] text-gray-700 font-semibold py-2 px-4 rounded-full shadow-sm"
              onClick={() => setIsEditing(true)}
            >
              Edit Income
            </Button>
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Monthly Income Amount</label>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(formatAmount(e.target.value))}
                  className="bg-[#F5E8EB] border-0 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Day</label>
                <Select
                  value={String(dayOfMonth)}
                  onValueChange={(value) => setDayOfMonth(Number(value))}
                >
                  <SelectTrigger className="bg-[#F5E8EB] border-0 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={String(day)}>
                        {day}th
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                className="bg-[#C58B9F] hover:bg-[#B47A8E] text-white font-bold py-2 px-4 rounded-lg"
                disabled={isSaving}
                onClick={() => saveIncome()}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
              <Button
                variant="outline"
                className="bg-white hover:bg-[#FBF6F7] border-[#E5D9DC] text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
