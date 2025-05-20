// spendingpiechart.tsx

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/currency";
import { useEffect, useState } from 'react';

export function SpendingPieChart({ categoryTotals }: SpendingPieChartProps) {
  const [isMobile, setIsMobile] = useState(false);
  // Adjusted default to match desktop for initial render before effect runs
  const [chartRadii, setChartRadii] = useState({ outerRadius: 100, innerRadius: 55 }); 

  useEffect(() => {
    const checkMobile = () => {
      const mobileState = window.innerWidth < 768;
      setIsMobile(mobileState);
      if (mobileState) {
        // Mobile: Thicker donut, slightly smaller overall
        setChartRadii({ outerRadius: 80, innerRadius: 40 }); // Thickness: 80 - 40 = 40px
      } else {
        // Desktop: Thicker donut
        setChartRadii({ outerRadius: 100, innerRadius: 55 }); // Thickness: 100 - 55 = 45px
                                                              // Was: { outerRadius: 100, innerRadius: 65 } (Thickness 35px)
      }
    };

    if (typeof window !== 'undefined') {
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // ... (rest of the SpendingPieChart component is the same as the last good version)

  const legendTextFormatter = (value: string, entry: any) => {
    const itemColor = entry.color || entry.payload?.color || entry.payload?.fill;
    return (
      <span style={{
        color: itemColor,
        fontSize: '13px',
        fontWeight: 500,
        marginLeft: '6px',
      }}>
        {value}
      </span>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart> {/* No explicit margins, let Recharts auto-layout */}
        <Pie
          data={categoryTotals}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={chartRadii.outerRadius}
          innerRadius={chartRadii.innerRadius} // This value controls thickness
          paddingAngle={2}
          stroke="none"
          fill="#8884d8"
        >
          {categoryTotals.map((entry) => (
            <Cell key={`cell-${entry.id}`} fill={entry.color} stroke="none"/>
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatCurrency(value as number, "VND")}
          contentStyle={{
            backgroundColor: "white",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
            padding: "8px 12px",
            fontSize: "13px",
          }}
          itemStyle={{ padding: "1px 0" }}
        />
        <Legend
          layout={isMobile ? "horizontal" : "vertical"}
          align={isMobile ? "center" : "right"}
          verticalAlign={isMobile ? "bottom" : "middle"}
          iconType="circle"
          iconSize={10}
          formatter={legendTextFormatter}
          wrapperStyle={{
            ...(isMobile
              ? { paddingTop: "16px", paddingBottom: "0px", gap: "8px", display: "flex", flexWrap: "wrap", justifyContent: "center" }
              : { paddingLeft: "10px", gap: "8px", display: "flex", flexDirection: "column" })
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}