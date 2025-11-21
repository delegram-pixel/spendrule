"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ContractStatusBadge } from "@/components/contracts/contract-status-badge"
import { ContractDetailsDialog } from "@/components/contracts/contract-details-dialog"
import { Search, Filter, FileText } from "lucide-react"

const contracts = [
  {
    id: "CNT001",
    vendor: "MediSupply Corp",
    type: "Medical Supplies",
    status: "Active" as const,
    startDate: "2023-01-01",
    endDate: "2024-12-31",
    value: "$245,000",
    terms: [
      "All items must be delivered within 48 hours of order placement",
      "5% discount on orders exceeding $10,000",
      "Monthly reconciliation required by the 15th of each month",
      "Late payment penalty: 1.5% per month after 30 days",
    ],
    extractedData: {
      discount: "5% on orders > $10,000; 8% on orders > $25,000",
      paymentTerms: "Net 30 days from invoice date",
      penaltyClause: "1.5% monthly interest on payments after 30 days",
    },
  },
  {
    id: "CNT002",
    vendor: "Global Health Services",
    type: "IT Services",
    status: "Active" as const,
    startDate: "2023-06-01",
    endDate: "2025-05-31",
    value: "$120,000",
    terms: [
      "24/7 support coverage with 4-hour response time",
      "Quarterly security audits included",
      "Unlimited user licenses",
      "Annual price increase capped at 3%",
    ],
    extractedData: {
      discount: "10% discount if paid annually upfront",
      paymentTerms: "Net 30 days or annual prepayment option",
      penaltyClause: "Service downtime credits: 5% per hour after 4 hours",
    },
  },
  {
    id: "CNT003",
    vendor: "TechMed Solutions",
    type: "Equipment Maintenance",
    status: "Pending" as const,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    value: "$85,000",
    terms: [
      "Preventive maintenance every 90 days",
      "Emergency repair within 24 hours",
      "Parts and labor included",
      "Loaner equipment provided during repairs",
    ],
    extractedData: {
      discount: "15% on annual prepayment",
      paymentTerms: "Quarterly billing, Net 30 days",
      penaltyClause: "Equipment downtime compensation: $500/day after 48 hours",
    },
  },
  {
    id: "CNT004",
    vendor: "CareFirst Systems",
    type: "Pharmaceuticals",
    status: "Active" as const,
    startDate: "2023-03-01",
    endDate: "2026-02-28",
    value: "$1,200,000",
    terms: [
      "Guaranteed pricing for 12 months",
      "Free shipping on orders over $5,000",
      "90-day payment terms for qualified buyers",
      "Automatic reordering based on usage patterns",
    ],
    extractedData: {
      discount: "Tiered pricing: 3% (>$50K), 5% (>$100K), 7% (>$250K)",
      paymentTerms: "Net 90 days for qualified buyers, otherwise Net 30",
      penaltyClause: "Late fees waived for first 60 days, then 2% monthly",
    },
  },
  {
    id: "CNT005",
    vendor: "Unity Medical",
    type: "Lab Services",
    status: "Expired" as const,
    startDate: "2022-01-01",
    endDate: "2023-12-31",
    value: "$95,000",
    terms: [
      "Standard turnaround: 24-48 hours",
      "STAT results available for 50% upcharge",
      "Monthly volume commitment: 100 tests minimum",
      "Price protection against market increases",
    ],
    extractedData: {
      discount: "Volume discount: 10% over 200 tests/month",
      paymentTerms: "Net 45 days from test completion",
      penaltyClause: "Failure to meet minimum volume: $500/month penalty",
    },
  },
]

export default function ContractsPage() {
  const [selectedContract, setSelectedContract] = useState<(typeof contracts)[0] | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleViewDetails = (contract: (typeof contracts)[0]) => {
    setSelectedContract(contract)
    setDetailsOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contract Intelligence</h2>
          <p className="text-muted-foreground">Manage and analyze your service contracts with AI-powered insights.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">+4 new this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">98</div>
            <p className="text-xs text-muted-foreground">79% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <FileText className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">8</div>
            <p className="text-xs text-muted-foreground">Within next 90 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Contracts</CardTitle>
              <CardDescription>View and manage all your vendor contracts.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search contracts..." className="pl-8 w-[250px]" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract ID</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.id}</TableCell>
                  <TableCell>{contract.vendor}</TableCell>
                  <TableCell>{contract.type}</TableCell>
                  <TableCell>
                    <ContractStatusBadge status={contract.status} />
                  </TableCell>
                  <TableCell>{contract.endDate}</TableCell>
                  <TableCell className="text-right">{contract.value}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(contract)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Contract Details Dialog */}
      {selectedContract && (
        <ContractDetailsDialog contract={selectedContract} open={detailsOpen} onOpenChange={setDetailsOpen} />
      )}
    </div>
  )
}
