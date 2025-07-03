'use client';

import { useQuery } from '@tanstack/react-query';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { netWorthStorage } from '@/lib/netWorthStorage';
import { formatCurrency, SupportedCurrency } from '@/lib/utils';

// Themed colors for the asset allocation chart
const COLORS = ['#B96589', '#D895B0', '#EAC0D1', '#F3D8E4'];

const formatAssetType = (type: string): string => {
  if (type.toLowerCase() === 'etf') return 'ETF';
  return type.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

export default function AssetAllocationChart() {
  const { data: allocation = [] } = useQuery({
    queryKey: ['assetAllocation'],
    queryFn: () => netWorthStorage.getAssetAllocation(),
  });

  const total = allocation.reduce((sum, item) => sum + item.amount, 0);

  const data = allocation.map((item) => ({
    ...item,
    percentage: total > 0 ? ((item.amount / total) * 100) : 0,
  }));

  return (
    <div className="bg-[#F7EDEF] p-4 sm:p-6 rounded-lg shadow-sm h-full flex flex-col">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Asset Allocation</h2>
        <p className="text-sm text-gray-500 mt-1">Breakdown of your assets by type</p>
      </div>

      {data.length > 0 ? (
        <div className="flex-grow flex flex-col sm:flex-row items-center justify-center mt-2 sm:gap-x-3">
          <div className="w-[150px] h-[150px] sm:flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name, props) => {
                    const percentage = props.payload.percentage.toFixed(1);
                    const formattedValue = formatCurrency(value, 'EUR' as SupportedCurrency);
                    return [`${formattedValue} (${percentage}%)`, formatAssetType(String(name))];
                  }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid #F3E2E7',
                    borderRadius: '0.5rem',
                    color: '#374151'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full sm:w-auto flex flex-col justify-center space-y-1 mt-4 sm:mt-0">
            {data.map((entry, index) => (
              <div key={`legend-${index}`} className="flex items-center">
                <div 
                  className="w-2.5 h-2.5 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-700 font-medium">{formatAssetType(entry.type)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500">No asset data to display.</p>
        </div>
      )}
    </div>
  );
}
