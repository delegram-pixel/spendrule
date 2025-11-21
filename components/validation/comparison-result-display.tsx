"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, FileText, DollarSign } from "lucide-react"
import type { ComparisonResult } from "@/lib/pdf-processor"

interface ComparisonResultDisplayProps {
  result: ComparisonResult
  onClear: () => void
}

export function ComparisonResultDisplay({ result, onClear }: ComparisonResultDisplayProps) {
  return (
    <div className="flex flex-col gap-6 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Validation Result</h2>
          <p className="text-muted-foreground">
            Review the comparison between the invoice and contract.
          </p>
        </div>
        <Button onClick={onClear} variant="outline">
          Start New Validation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
            {result.overallMatch ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                result.overallMatch ? "text-green-600" : "text-destructive"
              }`}
            >
              {result.overallMatch ? "Validated" : "Flagged"}
            </div>
            <p className="text-xs text-muted-foreground">
              {result.exceptions.length} exceptions found
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${result.potentialSavings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Based on {result.exceptions.length} flagged items
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidence Score</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(result.confidence * 100).toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              AI analysis confidence
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Exceptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Exceptions</CardTitle>
          <CardDescription>
            The following line items from the invoice do not match the contract terms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Invoice Item</TableHead>
                <TableHead>Invoice Price</TableHead>
                <TableHead>Contract Price</TableHead>
                <TableHead className="text-right">Variance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.exceptions.map((exception, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge
                      variant={exception.severity === "critical" ? "destructive" : "default"}
                      className={exception.severity === "warning" ? "bg-amber-500" : ""}
                    >
                      {exception.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>{exception.description}</TableCell>
                  <TableCell>{exception.lineItem.description}</TableCell>
                  <TableCell>${exception.lineItem.unitPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    ${exception.contractTerm?.unitPrice.toFixed(2) ?? "N/A"}
                  </TableCell>
                  <TableCell className="text-right text-destructive font-medium">
                    +${exception.variance.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
