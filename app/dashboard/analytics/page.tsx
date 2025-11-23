"use client"

import { useState, useEffect } from "react"
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
import { fetchRecords } from "@/lib/teable"
import { VALIDATION_METRICS_TABLE_ID, VALIDATION_EXCEPTIONS_TABLE_ID } from "@/lib/teable-constants"

// Define types for the fetched data
type ValidationMetric = {
  id: string;
  fields: {
    'validation_id': string;
    'overall_status': 'Approved' | 'Under Review';
    'confidence_score': number;
    'variance_amount': number;
    'potential_savings': number;
    'validation_date': string;
    [key: string]: any;
  };
};

type ValidationException = {
  id: string;
  fields: {
    'exception_id': string;
    'exception_type': string;
    'severity': 'High' | 'Medium' | 'Low';
    'variance_amount': number;
    'validation_id': string;
    [key: string]: any;
  };
};

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<ValidationMetric[]>([]);
  const [exceptions, setExceptions] = useState<ValidationException[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        const [metricsData, exceptionsData] = await Promise.all([
          fetchRecords(VALIDATION_METRICS_TABLE_ID),
          fetchRecords(VALIDATION_EXCEPTIONS_TABLE_ID),
        ]);
        setMetrics(metricsData as any);
        setExceptions(exceptionsData as any);
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  // Placeholder data for charts and tables until real data is processed
  const benchmarkingData = exceptions.map(ex => ({
    category: ex.fields.exception_type,
    yourRate: `${(ex.fields.variance_amount || 0).toFixed(2)}`,
    marketMedian: "$0.00",
    bestInClass: "$0.00",
    percentile: "N/A",
    status: ex.fields.severity === "High" ? "critical" : "warning",
    annualSpend: `${(ex.fields.variance_amount || 0).toFixed(2)}`,
    savingsOpportunity: `${(ex.fields.variance_amount || 0).toFixed(2)}`,
  }));

  const savingsTrendData = metrics.map(m => ({
    month: new Date(m.fields.validation_date).toLocaleString('default', { month: 'short' }),
    identified: m.fields.potential_savings,
    realized: m.fields.variance_amount,
  }));

  const categoryDistribution = exceptions.reduce((acc, ex) => {
    const category = ex.fields.exception_type || 'Other';
    const existing = acc.find(item => item.name === category);
    if (existing) {
      existing.value += ex.fields.variance_amount || 0;
    } else {
      acc.push({ name: category, value: ex.fields.variance_amount || 0, color: `#${Math.floor(Math.random()*16777215).toString(16)}` });
    }
    return acc;
  }, [] as { name: string; value: number; color: string }[]);

  const realizedSavingsYTD = metrics.reduce(
    (sum, item) => sum + (item.fields.variance_amount || 0),
    0,
  );

  const totalSavingsOpportunity = metrics.reduce(
    (sum, item) => sum + (item.fields.potential_savings || 0),
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
            {loading ? (
              <div className="text-2xl font-bold">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">${(totalSavingsOpportunity / 1000).toFixed(1)}K</div>
                <p className="text-xs text-muted-foreground">If optimized to market median</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realized Savings YTD</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">${(realizedSavingsYTD / 1000).toFixed(1)}K</div>
                <p className="text-xs text-muted-foreground">+23% from last quarter</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exceptions Created</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{exceptions.length}</div>
                <p className="text-xs text-muted-foreground">Across all service types</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Confidence Score</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {(
                    metrics.reduce((sum, item) => sum + (item.fields.confidence_score || 0), 0) /
                    (metrics.length || 1)
                  ).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Target: Above 0.90</p>
              </>
            )}
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
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : (
                      benchmarkingData.map((item, index) => (
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
                            {item.savingsOpportunity !== "$0.00" ? (
                              <span className="font-semibold text-green-600">{item.savingsOpportunity}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
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
                {loading ? (
                  <div>Loading...</div>
                ) : (
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
                )}
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
                  {loading ? (
                    <div>Loading...</div>
                  ) : (
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
                  )}
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
                  {loading ? (
                    <div>Loading...</div>
                  ) : (
                    benchmarkingData
                      .filter((item) => item.savingsOpportunity !== "$0.00")
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
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
