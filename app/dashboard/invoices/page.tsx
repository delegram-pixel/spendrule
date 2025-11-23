"use client"

import dynamic from 'next/dynamic'
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, CheckCircle2, AlertTriangle, Clock } from "lucide-react"
import { fetchRecords } from "@/lib/teable"
import { INVOICES_TABLE_ID } from "@/lib/teable-constants"

// Dynamically import components that use browser-specific APIs or cause SSR issues
const UploadInvoiceDialog = dynamic(
  () => import('@/components/invoices/upload-invoice-dialog').then(mod => mod.UploadInvoiceDialog),
  { ssr: false }
)
const ProofModal = dynamic(
  () => import('@/components/invoices/proof-modal').then(mod => mod.ProofModal),
  { ssr: false }
)

// Define a type for the invoice records
type Invoice = {
  id: string;
  fields: {
    'Invoice ID': string;
    'Vendor Name': string;
    'Invoice Date': string;
    'Status': 'Validated' | 'Flagged' | 'Pending';
    'Total Amount': number;
    [key: string]: any;
  };
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [proofOpen, setProofOpen] = useState(false)


  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const records = await fetchRecords(INVOICES_TABLE_ID);
      // Ensure the records are properly typed
      const typedRecords = records.map(record => ({
        id: record.id,
        fields: {
          'Invoice ID': record.fields['Invoice ID'] as string,
          'Vendor Name': record.fields['Vendor Name'] as string,
          'Invoice Date': record.fields['Invoice Date'] as string,
          'Status': (record.fields['Status'] as 'Validated' | 'Flagged' | 'Pending') || 'Pending',
          'Total Amount': record.fields['Total Amount'] as number,
        }
      }));
      setInvoices(typedRecords as Invoice[]);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      // Handle error state in UI if needed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleViewProof = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setProofOpen(true)
  }

  const handleInvoiceUploaded = () => {
    // Refetch the invoices to show the newly uploaded one
    fetchInvoices();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoice Validation</h2>
          <p className="text-muted-foreground">Review and approve invoices validated against your contracts.</p>
        </div>
        <UploadInvoiceDialog onInvoiceUploaded={handleInvoiceUploaded} />
      </div>

      {/* Stats Cards - These can be updated later to reflect real data */}
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.fields['Invoice ID']}</TableCell>
                    <TableCell>{invoice.fields['Vendor Name']}</TableCell>
                    <TableCell>{new Date(invoice.fields['Invoice Date']).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invoice.fields['Status'] === "Validated"
                            ? "default"
                            : invoice.fields['Status'] === "Flagged"
                              ? "destructive"
                              : "secondary"
                        }
                        className={invoice.fields['Status'] === "Validated" ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {invoice.fields['Status']}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(invoice.fields['Total Amount'])}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleViewProof(invoice)}>
                        View Proof
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Proof Modal */}
      <ProofModal invoice={selectedInvoice} open={proofOpen} onOpenChange={setProofOpen} />
    </div>
  )
}
