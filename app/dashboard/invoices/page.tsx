"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProofModal } from "@/components/invoices/proof-modal"
import { Search, Filter, CheckCircle2, AlertTriangle, Clock } from "lucide-react"

const invoices = [
  {
    id: "INV-2023-001",
    vendor: "MediSupply Corp",
    date: "2023-11-20",
    amount: "$1,250.00",
    status: "Validated",
    lineItem: "Surgical Gloves (Box of 100)",
    quantity: "50",
    unitPrice: "$25.00",
    totalAmount: "$1,250.00",
    contractTerm: "Surgical Gloves - Standard Grade",
    contractRate: "$25.00",
    variance: "$0.00",
  },
  {
    id: "INV-2023-002",
    vendor: "Global Health Services",
    date: "2023-11-19",
    amount: "$4,500.00",
    status: "Flagged",
    lineItem: "IT Support - Monthly Retainer",
    quantity: "1",
    unitPrice: "$4,500.00",
    totalAmount: "$4,500.00",
    contractTerm: "Monthly IT Support Services",
    contractRate: "$4,000.00",
    variance: "+$500.00",
  },
  {
    id: "INV-2023-003",
    vendor: "TechMed Solutions",
    date: "2023-11-18",
    amount: "$850.00",
    status: "Pending",
    lineItem: "Equipment Repair - X-Ray Unit",
    quantity: "1",
    unitPrice: "$850.00",
    totalAmount: "$850.00",
    contractTerm: "Emergency Equipment Repair",
    contractRate: "TBD",
    variance: "Pending",
  },
  {
    id: "INV-2023-004",
    vendor: "CareFirst Systems",
    date: "2023-11-17",
    amount: "$12,400.00",
    status: "Validated",
    lineItem: "Pharmaceutical Supply - Batch A",
    quantity: "1",
    unitPrice: "$12,400.00",
    totalAmount: "$12,400.00",
    contractTerm: "Bulk Pharmaceutical Supply",
    contractRate: "$12,400.00",
    variance: "$0.00",
  },
  {
    id: "INV-2023-005",
    vendor: "Unity Medical",
    date: "2023-11-16",
    amount: "$2,100.00",
    status: "Flagged",
    lineItem: "Lab Testing Services - Panel C",
    quantity: "100",
    unitPrice: "$21.00",
    totalAmount: "$2,100.00",
    contractTerm: "Standard Lab Panel C",
    contractRate: "$18.50",
    variance: "+$250.00",
  },
]

export default function InvoicesPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<(typeof invoices)[0] | null>(null)
  const [proofOpen, setProofOpen] = useState(false)

  const handleViewProof = (invoice: (typeof invoices)[0]) => {
    setSelectedInvoice(invoice)
    setProofOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoice Validation</h2>
          <p className="text-muted-foreground">Review and approve invoices validated against your contracts.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validated (This Month)</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">1,245</div>
            <p className="text-xs text-muted-foreground">$2.4M processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged for Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">23</div>
            <p className="text-xs text-muted-foreground">$45k in potential savings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Est. completion: 2 mins</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Real-time validation status of all incoming invoices.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search invoices..." className="pl-8 w-[250px]" />
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
                <TableHead>Invoice ID</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.vendor}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.status === "Validated"
                          ? "default"
                          : invoice.status === "Flagged"
                            ? "destructive"
                            : "secondary"
                      }
                      className={invoice.status === "Validated" ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{invoice.amount}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewProof(invoice)}>
                      View Proof
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Proof Modal */}
      <ProofModal invoice={selectedInvoice} open={proofOpen} onOpenChange={setProofOpen} />
    </div>
  )
}
