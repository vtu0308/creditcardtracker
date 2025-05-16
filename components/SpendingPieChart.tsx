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
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={categoryTotals}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={80}
          paddingAngle={2}
        >
          {categoryTotals.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatCurrency(value as number, "VND")}
          contentStyle={{ borderRadius: "8px", border: "none" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
