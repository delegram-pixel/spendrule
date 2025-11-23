"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoreHorizontal, FileText, Download, Search } from "lucide-react"
import type { ComparisonResult, InvoiceLineItem } from "@/lib/pdf-processor"
import { Input } from "../ui/input"

interface ComparisonResultDisplayProps {
  result: ComparisonResult
}

// A new interface to merge invoice line item data with its corresponding exception for easy rendering
interface DisplayLineItem extends InvoiceLineItem {
  isException: boolean;
  status: 'Compliant' | 'Variance' | 'Missing';
  variancePercent?: number;
  contractPrice?: number;
}

export function ComparisonResultDisplay({ result }: ComparisonResultDisplayProps) {
  const complianceRate = result.totalLineItems > 0 
    ? (result.compliantLineItems / result.totalLineItems) * 100 
    : 100;

  const varianceItems = result.exceptions.filter(e => e.type === 'price_mismatch').length;
  const missingExtraItems = result.exceptions.filter(e => e.type === 'unauthorized_item').length;

  // Create a unified list of all line items for display, merging exception data
  const displayLineItems: DisplayLineItem[] = result.allInvoiceLineItems.map(item => {
    const exception = result.exceptions.find(e => e.lineItem.description === item.description);
    
    if (exception) {
      const contractPrice = exception.contractTerm?.unitPrice ?? 0;
      const variance = item.unitPrice - contractPrice;
      const variancePercent = contractPrice > 0 ? (variance / contractPrice) * 100 : 0;
      
      return {
        ...item,
        isException: true,
        status: exception.type === 'unauthorized_item' ? 'Missing' : 'Variance',
        variancePercent: variancePercent,
        contractPrice: contractPrice
      };
    } else {
      return {
        ...item,
        isException: false,
        status: 'Compliant',
        contractPrice: item.unitPrice // For compliant items, contract price is same as invoice
      };
    }
  });


  return (
    <div className="flex flex-col gap-6 pt-4">
      
      {/* Top Section: Selectors and Stat Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placeholder Selectors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Select Contract</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full justify-between" disabled>
              <span>Cloud Infrastructure Services</span>
              <Badge>V798D-40236</Badge>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Select Invoice</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full justify-between" disabled>
                <span>{result.invoiceId}</span>
                <Badge variant="secondary">${result.allInvoiceLineItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}</Badge>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-normal">Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{complianceRate.toFixed(0)}%</div>
            <Progress value={complianceRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-normal">Compliant Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.compliantLineItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-normal">Variance Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{varianceItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-normal">Missing/Extra Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{missingExtraItems}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Comparison Table */}
      <Tabs defaultValue="line-by-line">
        <div className="flex items-center justify-between">
            <TabsList>
                <TabsTrigger value="line-by-line">Line-by-Line</TabsTrigger>
                <TabsTrigger value="summary-view" disabled>Summary View</TabsTrigger>
                <TabsTrigger value="variance-analysis" disabled>Variance Analysis</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search items..." className="pl-8 w-48" />
                </div>
                <Button variant="outline" disabled><Download className="mr-2 h-4 w-4"/> Export</Button>
            </div>
        </div>

        <TabsContent value="line-by-line">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Line-by-Line Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Contract Price</TableHead>
                    <TableHead>Invoice Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Variance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayLineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell>${item.contractPrice?.toFixed(4)}</TableCell>
                      <TableCell>${item.unitPrice.toFixed(4)}</TableCell>
                      <TableCell>{item.quantity.toLocaleString()}</TableCell>
                      <TableCell>
                        {item.isException && item.status === 'Variance' && item.variancePercent ? (
                          <Badge variant="destructive" className="font-mono">
                            {item.variancePercent > 0 ? '+' : ''}{item.variancePercent.toFixed(1)}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0.0%</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.isException ? "destructive" : "default"} className={item.isException ? (item.status === 'Variance' ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800") : "bg-green-100 text-green-800"}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" disabled>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
