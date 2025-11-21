"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExceptionDetailsSheet } from "@/components/exceptions/exception-details-sheet"
import { Search } from "lucide-react"

const exceptions = [
  {
    id: "EXC-001",
    invoiceId: "INV-2023-002",
    vendor: "Global Health Services",
    date: "2023-11-19",
    type: "Price Variance",
    severity: "High",
    status: "Open",
    invoiceAmount: "$4,500.00",
    contractRate: "$4,000.00",
    variance: "+$500.00",
  },
  {
    id: "EXC-002",
    invoiceId: "INV-2023-005",
    vendor: "Unity Medical",
    date: "2023-11-16",
    type: "Quantity Mismatch",
    severity: "Medium",
    status: "In Review",
    invoiceAmount: "$2,100.00",
    contractRate: "$1,850.00",
    variance: "+$250.00",
  },
  {
    id: "EXC-003",
    invoiceId: "INV-2023-008",
    vendor: "MediSupply Corp",
    date: "2023-11-15",
    type: "Duplicate Invoice",
    severity: "Critical",
    status: "Open",
    invoiceAmount: "$1,250.00",
    contractRate: "N/A",
    variance: "$1,250.00",
  },
  {
    id: "EXC-004",
    invoiceId: "INV-2023-012",
    vendor: "TechMed Solutions",
    date: "2023-11-14",
    type: "Unauthorized Service",
    severity: "High",
    status: "Resolved",
    invoiceAmount: "$850.00",
    contractRate: "$0.00",
    variance: "+$850.00",
  },
]

export default function ExceptionsPage() {
  const [selectedException, setSelectedException] = useState<(typeof exceptions)[0] | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleViewDetails = (exception: (typeof exceptions)[0]) => {
    setSelectedException(exception)
    setSheetOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Exception Management</h2>
          <p className="text-muted-foreground">Review and resolve flagged invoices and contract discrepancies.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search exceptions..." className="pl-8" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-review">In Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Exceptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Exceptions</CardTitle>
          <CardDescription>List of all current exceptions requiring attention.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exception ID</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exceptions.map((exception) => (
                <TableRow key={exception.id}>
                  <TableCell className="font-medium">{exception.id}</TableCell>
                  <TableCell>{exception.vendor}</TableCell>
                  <TableCell>{exception.type}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        exception.severity === "Critical"
                          ? "destructive"
                          : exception.severity === "High"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {exception.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{exception.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-destructive">{exception.variance}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(exception)}>
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Exception Details Sheet */}
      <ExceptionDetailsSheet exception={selectedException} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  )
}
