'use client';

import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { netWorthStorage } from '@/lib/netWorthStorage';
import { formatCurrency, SupportedCurrency } from '@/lib/utils';

export default function NetWorthOverview() {
  const { data } = useQuery({
    queryKey: ['netWorth'],
    queryFn: () => netWorthStorage.calculateNetWorth()
  });

  const { totalAssets = 0, totalLiabilities = 0, netWorth = 0 } = data || {};

  return (
    <div className="space-y-0"> {/* Reduced space-y, title removed */}
      {/* Financial Overview title is now managed by the parent page */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-3 pb-1 px-4">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-4">
            <div className="text-2xl font-extrabold text-green-600">
              {formatCurrency(totalAssets, 'VND' as SupportedCurrency)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-3 pb-1 px-4">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <div className="h-7 w-7 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-4">
            <div className="text-2xl font-extrabold text-red-600">
              {formatCurrency(totalLiabilities, 'VND' as SupportedCurrency)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-3 pb-1 px-4">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <div className={`h-7 w-7 rounded-full ${netWorth >= 0 ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
              <DollarSign className={`h-4 w-4 ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-4">
            <div className={`text-2xl font-extrabold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netWorth, 'VND' as SupportedCurrency)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
