'use client';

import { useQuery } from '@tanstack/react-query';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { netWorthStorage, NetWorthSnapshot } from '@/lib/netWorthStorage';
import { formatCurrency, formatCompactNumber, SupportedCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm text-gray-800 font-medium">{`Date: ${new Date(label).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}</p>
        <p className="text-sm text-[#CE839C]">{`Net Worth: ${formatCompactNumber(payload[0].value)} VND`}</p>
      </div>
    );
  }

  return null;
};

interface NetWorthChartProps {
  onAddData: () => void;
  onEditData?: (snapshot: NetWorthSnapshot) => void;
}

export default function NetWorthChart({ onAddData, onEditData }: NetWorthChartProps) {
  const { data: snapshots = [] } = useQuery({
    queryKey: ['netWorthSnapshots'],
    queryFn: () => netWorthStorage.getNetWorthSnapshots(12),
  });

  const sortedData = [...snapshots].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const handleAddData = () => {
    onAddData();
  };

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const snapshot = data.activePayload[0].payload;
      if (onEditData && snapshot) {
        onEditData(snapshot);
      }
    }
  };

  return (
    <div className="bg-[#F7EDEF] p-4 sm:p-6 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Net Worth Trend</h2>
          <p className="text-sm text-gray-500 mt-1">Your net worth progression over time</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAddData}
          className="mt-3 sm:mt-0 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full text-xs px-3 py-1"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Data
        </Button>
      </div>

      <div className="border-b border-[#F3E2E7] mb-6" />
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <TrendingUp className="h-4 w-4 text-[#CE839C]" />
        <span className="text-black font-medium">Net Worth Trend</span>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sortedData} margin={{ top: 5, right: 30, bottom: 20, left: 10 }} onClick={handleChartClick}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#8F8B8B" opacity={0.3} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              tick={{ fill: '#8F8B8B', fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatCompactNumber(value)}
              tick={{ fill: '#8F8B8B', fontSize: 12, fontWeight: 500 }}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="netWorth"
              stroke="#CE839C"
              strokeWidth={2.5}
              dot={{ 
                r: 4, 
                fill: '#CE839C', 
                stroke: '#FDF7F9', 
                strokeWidth: 2,
                cursor: 'pointer',
              }}
              activeDot={{ 
                r: 6, 
                stroke: '#CE839C', 
                fill: '#FFFFFF',
                strokeWidth: 2,
                cursor: 'pointer',
              }}
              name="Net Worth"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
