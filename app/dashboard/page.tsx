"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SavingsChart } from "@/components/dashboard/savings-chart"
import { VendorScorecard } from "@/components/dashboard/vendor-scorecard"
import { BenchmarkComparison } from "@/components/dashboard/benchmark-comparison"
import { DollarSign, FileText, AlertTriangle, TrendingUp } from "lucide-react"
import { fetchRecords } from "@/lib/teable"
import { INVOICES_TABLE_ID, CONTRACTS_TABLE_ID, VALIDATION_EXCEPTIONS_TABLE_ID } from "@/lib/teable-constants"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalSpend: 0,
    totalSavings: 0,
    activeContracts: 0,
    pendingExceptions: 0,
  });
  const [invoiceRecords, setInvoiceRecords] = useState([]);
  const [exceptionRecords, setExceptionRecords] = useState([]);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [invoiceRecords, contractRecords, exceptionRecords] = await Promise.all([
        fetchRecords(INVOICES_TABLE_ID),
        fetchRecords(CONTRACTS_TABLE_ID),
        fetchRecords(VALIDATION_EXCEPTIONS_TABLE_ID),
      ]);

      const totalSpend = (invoiceRecords as any[]).reduce((sum, record) => sum + (record.fields['Gross Amount'] || 0), 0);
      const totalSavings = (exceptionRecords as any[]).reduce((sum, record) => sum + (record.fields['Variance'] || 0), 0);
      const activeContracts = contractRecords.length;
      const pendingExceptions = (exceptionRecords as any[]).filter(r => r.fields['Status'] !== 'Resolved').length;

      setInvoiceRecords(invoiceRecords as any);
      setExceptionRecords(exceptionRecords as any);
      setTotalInvoices(invoiceRecords.length);

      setStats({ totalSpend, totalSavings, activeContracts, pendingExceptions });
    } catch (err) {
      setError("Failed to fetch dashboard data. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Good morning, Admin</h2>
          <p className="text-sm text-muted-foreground mt-1">Here's your contract validation overview</p>
        </div>
        <div className="text-sm text-muted-foreground">Information updated just now</div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border shadow-sm"><CardHeader><CardTitle><div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" /></CardTitle></CardHeader><CardContent><div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse" /><div className="h-4 w-full bg-gray-200 rounded animate-pulse mt-2" /></CardContent></Card>
          <Card className="border shadow-sm"><CardHeader><CardTitle><div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" /></CardTitle></CardHeader><CardContent><div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse" /><div className="h-4 w-full bg-gray-200 rounded animate-pulse mt-2" /></CardContent></Card>
          <Card className="border shadow-sm"><CardHeader><CardTitle><div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" /></CardTitle></CardHeader><CardContent><div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse" /><div className="h-4 w-full bg-gray-200 rounded animate-pulse mt-2" /></CardContent></Card>
          <Card className="border shadow-sm"><CardHeader><CardTitle><div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" /></CardTitle></CardHeader><CardContent><div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse" /><div className="h-4 w-full bg-gray-200 rounded animate-pulse mt-2" /></CardContent></Card>
        </div>
      ) : error ? (
        <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spend</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalSpend)}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all invoices</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Savings</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalSavings)}</div>
              <p className="text-xs text-muted-foreground mt-1">Identified from exceptions</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Contracts</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeContracts}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently being monitored</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Exceptions</CardTitle>
              <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.pendingExceptions}</div>
              <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Benchmark Comparison */}
      {!loading && !error && (
        <div className="grid grid-cols-1">
          <BenchmarkComparison
            totalSpend={stats.totalSpend}
            totalSavings={stats.totalSavings}
            totalInvoices={totalInvoices}
            totalExceptions={stats.pendingExceptions}
          />
        </div>
      )}

      {/* Charts and Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-3">
          <SavingsChart exceptions={exceptionRecords} />
        </div>
        <div className="lg:col-span-4">
          <VendorScorecard invoices={invoiceRecords} exceptions={exceptionRecords} />
        </div>
      </div>
    </div>
  )
}
