import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/currency";

export interface CategoryTotal {
  id: string;
  name: string;
  value: number;
  color: string;
}

interface SpendingPieChartProps {
  categoryTotals: CategoryTotal[];
  colors: string[];
}

export function SpendingPieChart({ categoryTotals, colors }: SpendingPieChartProps) {
  return (
    <div className="h-[340px] w-full flex items-center justify-center">
      <div className="flex flex-row items-center justify-center w-full max-w-3xl">
        <div className="flex items-center justify-center flex-1">
          <ResponsiveContainer width={260} height={260}>
            <PieChart>
              <Pie
                data={categoryTotals}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
              >
                {categoryTotals.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number, "VND")} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col ml-8 space-y-2 min-w-[160px]">
          {categoryTotals.map((entry, index) => (
            <div key={entry.name} className="flex items-center">
              <span className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: colors[index % colors.length] }} />
              <span className="text-sm font-medium">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
