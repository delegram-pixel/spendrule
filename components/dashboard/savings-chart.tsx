"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SavingsChartProps {
  exceptions: any[];
}

export function SavingsChart({ exceptions }: SavingsChartProps) {
  const processDataForChart = () => {
    if (!exceptions || exceptions.length === 0) {
      return [];
    }

    const savingsByCategory = exceptions.reduce((acc, exception) => {
      const category = exception.fields['Exception Type'] || 'Uncategorized';
      const variance = exception.fields['Variance'] || 0;

      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += variance;

      return acc;
    }, {});

    return Object.entries(savingsByCategory).map(([name, savings]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      savings: savings,
    })).sort((a, b) => b.savings - a.savings);
  };

  const chartData = processDataForChart();

  return (
    <Card className="col-span-12 lg:col-span-3 border shadow-sm">
      <CardHeader>
        <CardTitle>Savings by Category</CardTitle>
        <CardDescription>Total savings identified, broken down by exception type.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
              <XAxis 
                type="number" 
                className="text-muted-foreground" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                className="text-muted-foreground"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.75rem",
                  color: "hsl(var(--card-foreground))",
                }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Bar dataKey="savings" fill="#5B7FFF" radius={[0, 8, 8, 0]} name="Total Savings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
