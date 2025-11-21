"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
  {
    name: "Jan",
    total: 45000,
    savings: 12000,
  },
  {
    name: "Feb",
    total: 52000,
    savings: 14000,
  },
  {
    name: "Mar",
    total: 48000,
    savings: 11000,
  },
  {
    name: "Apr",
    total: 61000,
    savings: 18000,
  },
  {
    name: "May",
    total: 55000,
    savings: 16000,
  },
  {
    name: "Jun",
    total: 67000,
    savings: 21000,
  },
]

export function SavingsChart() {
  return (
    <Card className="col-span-4 border shadow-sm">
      <CardHeader>
        <CardTitle>Monthly Savings Overview</CardTitle>
        <CardDescription>Total spend vs. recovered savings over the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis dataKey="name" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                className="text-muted-foreground"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
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
              <Bar dataKey="total" fill="#93C5FD" radius={[8, 8, 0, 0]} name="Total Spend" />
              <Bar dataKey="savings" fill="#5B7FFF" radius={[8, 8, 0, 0]} name="Savings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
