"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown } from "lucide-react"

// --- Dummy Data for Peer Benchmarks ---
const peerBenchmarks = {
  savingsRate: 0.15, // 15%
  avgExceptionRate: 0.08, // 8%
};

interface BenchmarkComparisonProps {
  totalSpend: number;
  totalSavings: number;
  totalInvoices: number;
  totalExceptions: number;
}

export function BenchmarkComparison({
  totalSpend,
  totalSavings,
  totalInvoices,
  totalExceptions,
}: BenchmarkComparisonProps) {

  const ourSavingsRate = totalSpend > 0 ? totalSavings / totalSpend : 0;
  const ourExceptionRate = totalInvoices > 0 ? totalExceptions / totalInvoices : 0;

  const savingsDifference = ourSavingsRate - peerBenchmarks.savingsRate;
  const exceptionDifference = ourExceptionRate - peerBenchmarks.avgExceptionRate;

  const renderComparison = (value: number, benchmark: number, formatAsPercent = true, lowerIsBetter = false) => {
    const difference = value - benchmark;
    const isPositive = difference >= 0;
    const displayValue = formatAsPercent ? `${(value * 100).toFixed(1)}%` : value.toFixed(2);
    const displayBenchmark = formatAsPercent ? `${(benchmark * 100).toFixed(1)}%` : benchmark.toFixed(2);

    let indicator;
    if ((isPositive && !lowerIsBetter) || (!isPositive && lowerIsBetter)) {
      indicator = <Badge variant="default" className="bg-green-600 hover:bg-green-700"><ArrowUp className="h-4 w-4 mr-1" /> Better</Badge>;
    } else {
      indicator = <Badge variant="destructive"><ArrowDown className="h-4 w-4 mr-1" /> Worse</Badge>;
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">{displayValue}</span>
          {indicator}
        </div>
        <Progress value={value * 100} className="h-2" />
        <p className="text-xs text-muted-foreground text-right">
          Peer Median: <span className="font-semibold">{displayBenchmark}</span>
        </p>
      </div>
    );
  };

  return (
    <Card className="col-span-12">
      <CardHeader>
        <CardTitle>Benchmark Comparison</CardTitle>
        <CardDescription>
          How your organization's performance compares to the industry peer median.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h4 className="font-medium">Savings Rate</h4>
          <p className="text-sm text-muted-foreground">
            Percentage of total spend recovered through validation. Higher is better.
          </p>
          {renderComparison(ourSavingsRate, peerBenchmarks.savingsRate)}
        </div>
        <div className="space-y-2">
          <h4 className="font-medium">Exception Rate</h4>
          <p className="text-sm text-muted-foreground">
            Percentage of invoices that have at least one exception. Lower is better.
          </p>
          {renderComparison(ourExceptionRate, peerBenchmarks.avgExceptionRate, true, true)}
        </div>
      </CardContent>
    </Card>
  )
}
