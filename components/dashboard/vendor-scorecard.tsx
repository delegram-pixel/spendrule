"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// This type will be refined once we know the exact data structure
type VendorPerformance = {
  vendorName: string;
  exceptionCount: number;
  totalVariance: number;
  errorRate: number; // Percentage
};

interface VendorScorecardProps {
  // We'll pass the raw exception data here
  exceptions: any[];
  invoices: any[]; // To calculate total invoices per vendor
}

export function VendorScorecard({ exceptions, invoices }: VendorScorecardProps) {

  const calculateVendorPerformance = (): VendorPerformance[] => {
    if (!exceptions || !invoices) return [];

    const vendorData: { [key: string]: { exceptionCount: number; totalVariance: number; invoiceCount: number } } = {};

    // Aggregate exceptions by vendor
    exceptions.forEach(ex => {
      const vendorName = ex.fields['Vendor Name']?.[0]?.title || 'Unknown Vendor';
      if (!vendorData[vendorName]) {
        vendorData[vendorName] = { exceptionCount: 0, totalVariance: 0, invoiceCount: 0 };
      }
      vendorData[vendorName].exceptionCount += 1;
      vendorData[vendorName].totalVariance += ex.fields['Variance'] || 0;
    });

    // Count total invoices per vendor
    invoices.forEach(inv => {
        const vendorName = inv.fields['vendor_party_id']?.title || 'Unknown Vendor';
        if(vendorData[vendorName]) {
            vendorData[vendorName].invoiceCount = (vendorData[vendorName].invoiceCount || 0) + 1;
        }
    });

    // Format into the VendorPerformance array
    const performanceList: VendorPerformance[] = Object.entries(vendorData).map(([vendorName, data]) => ({
      vendorName,
      ...data,
      errorRate: data.invoiceCount > 0 ? (data.exceptionCount / data.invoiceCount) * 100 : 0,
    }));
    
    // Sort by total variance descending
    return performanceList.sort((a, b) => b.totalVariance - a.totalVariance);
  };

  const vendorPerformance = calculateVendorPerformance();

  return (
    <Card className="col-span-12 lg:col-span-4">
      <CardHeader>
        <CardTitle>Vendor Scorecard</CardTitle>
        <CardDescription>
          Performance overview of top vendors by exception impact.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead className="text-center">Exceptions</TableHead>
              <TableHead className="text-center">Error Rate</TableHead>
              <TableHead className="text-right">Total Variance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendorPerformance.length > 0 ? (
              vendorPerformance.slice(0, 5).map((vendor) => ( // Show top 5
                <TableRow key={vendor.vendorName}>
                  <TableCell className="font-medium">{vendor.vendorName}</TableCell>
                  <TableCell className="text-center">{vendor.exceptionCount}</TableCell>
                  <TableCell className="text-center">
                     <Badge variant={vendor.errorRate > 10 ? 'destructive' : 'secondary'}>
                        {vendor.errorRate.toFixed(1)}%
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(vendor.totalVariance)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No vendor data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
