"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, AlertTriangle, Download } from "lucide-react"

// Mock benchmarking data
const benchmarkingData = [
  {
    category: "Facilities > Cleaning/sqft",
    yourRate: "$0.95",
    marketMedian: "$0.82",
    bestInClass: "$0.71",
    percentile: "78th",
    status: "warning",
    annualSpend: "$342,000",
    savingsOpportunity: "$44,460",
  },
  {
    category: "Temp Staff > IT Support/hr",
    yourRate: "$52",
    marketMedian: "$45",
    bestInClass: "$38",
    percentile: "85th",
    status: "critical",
    annualSpend: "$624,000",
    savingsOpportunity: "$84,000",
  },
  {
    category: "Equipment > HVAC Maint/unit",
    yourRate: "$450",
    marketMedian: "$385",
    bestInClass: "$320",
    percentile: "72nd",
    status: "warning",
    annualSpend: "$180,000",
    savingsOpportunity: "$26,000",
  },
  {
    category: "Professional > Consulting/hr",
    yourRate: "$185",
    marketMedian: "$165",
    bestInClass: "$142",
    percentile: "76th",
    status: "warning",
    annualSpend: "$296,000",
    savingsOpportunity: "$32,000",
  },
  {
    category: "Security > Guard Services/hr",
    yourRate: "$28",
    marketMedian: "$32",
    bestInClass: "$26",
    percentile: "35th",
    status: "good",
    annualSpend: "$245,760",
    savingsOpportunity: "$0",
  },
]

const savingsTrendData = [
  { month: "Jan", identified: 145000, realized: 98000 },
  { month: "Feb", identified: 178000, realized: 134000 },
  { month: "Mar", identified: 234000, realized: 189000 },
  { month: "Apr", identified: 298000, realized: 245000 },
  { month: "May", identified: 356000, realized: 312000 },
  { month: "Jun", identified: 425000, realized: 387000 },
]

const categoryDistribution = [
  { name: "Facilities", value: 342000, color: "#5B7FFF" },
  { name: "Temp Staff", value: 624000, color: "#A78BFA" },
  { name: "Equipment", value: 180000, color: "#10B981" },
  { name: "Professional", value: 296000, color: "#F59E0B" },
  { name: "Security", value: 245760, color: "#EF4444" },
]

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("6m")

  const totalSavingsOpportunity = benchmarkingData.reduce(
    (sum, item) => sum + Number.parseFloat(item.savingsOpportunity.replace(/[$,]/g, "")),
    0,
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Insights</h1>
          <p className="text-muted-foreground">Benchmarking and savings analysis across your organization</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings Opportunity</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalSavingsOpportunity / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">If optimized to market median</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realized Savings YTD</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$387K</div>
            <p className="text-xs text-muted-foreground">+23% from last quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories Analyzed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">Across all service types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Market Percentile</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">74th</div>
            <p className="text-xs text-muted-foreground">Target: Below 50th percentile</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="benchmarking" className="space-y-4">
        <TabsList>
          <TabsTrigger value="benchmarking">Benchmarking</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Category Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="benchmarking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rate Benchmarking Analysis</CardTitle>
              <CardDescription>Compare your rates against market median and best-in-class pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Category</TableHead>
                      <TableHead className="text-right">Your Rate</TableHead>
                      <TableHead className="text-right">Market Median</TableHead>
                      <TableHead className="text-right">Best-in-Class</TableHead>
                      <TableHead className="text-center">Percentile</TableHead>
                      <TableHead className="text-right">Annual Spend</TableHead>
                      <TableHead className="text-right">Opportunity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {benchmarkingData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.category}</TableCell>
                        <TableCell className="text-right font-semibold">{item.yourRate}</TableCell>
                        <TableCell className="text-right">{item.marketMedian}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{item.bestInClass}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              item.status === "critical"
                                ? "destructive"
                                : item.status === "warning"
                                  ? "secondary"
                                  : "default"
                            }
                          >
                            {item.percentile}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{item.annualSpend}</TableCell>
                        <TableCell className="text-right">
                          {item.savingsOpportunity !== "$0" ? (
                            <span className="font-semibold text-green-600">{item.savingsOpportunity}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Potential savings if at market median:</strong> ${(totalSavingsOpportunity / 1000).toFixed(1)}
                  K annualized
                  <br />
                  <span className="text-blue-700">Based on 15,000+ actual invoices across peer organizations</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Savings Trend</CardTitle>
              <CardDescription>Identified vs. Realized savings over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={savingsTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${(value / 1000).toFixed(0)}K`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="identified"
                    stroke="#5B7FFF"
                    strokeWidth={2}
                    name="Identified Savings"
                  />
                  <Line type="monotone" dataKey="realized" stroke="#10B981" strokeWidth={2} name="Realized Savings" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Exception Rate</CardTitle>
              <CardDescription>Percentage of invoices flagged by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { month: "Jan", rate: 12 },
                    { month: "Feb", rate: 15 },
                    { month: "Mar", rate: 9 },
                    { month: "Apr", rate: 11 },
                    { month: "May", rate: 8 },
                    { month: "Jun", rate: 7 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Bar dataKey="rate" fill="#A78BFA" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Spend Distribution</CardTitle>
                <CardDescription>By service category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${(value / 1000).toFixed(0)}K`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Savings Opportunities</CardTitle>
                <CardDescription>Ranked by potential impact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {benchmarkingData
                    .filter((item) => item.savingsOpportunity !== "$0")
                    .sort(
                      (a, b) =>
                        Number.parseFloat(b.savingsOpportunity.replace(/[$,]/g, "")) -
                        Number.parseFloat(a.savingsOpportunity.replace(/[$,]/g, "")),
                    )
                    .map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.category}</p>
                          <p className="text-sm text-muted-foreground">Currently at {item.percentile} percentile</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{item.savingsOpportunity}</p>
                          <p className="text-xs text-muted-foreground">potential</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
