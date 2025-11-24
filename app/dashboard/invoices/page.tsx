"use client"

import dynamic from 'next/dynamic'
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, FileText, DollarSign, Clock } from "lucide-react"
import { fetchRecords } from "@/lib/teable"
import { Invoice } from "@/lib/invoice-types"
import { INVOICES_TABLE_ID } from "@/lib/teable-constants"
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge"
import { InvoiceDetailsDialog } from "@/components/invoices/invoice-details-dialog"

const UploadInvoiceDialog = dynamic(
  () => import('@/components/invoices/upload-invoice-dialog').then(mod => mod.UploadInvoiceDialog),
  { ssr: false }
)

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const invoiceRecords = await fetchRecords(INVOICES_TABLE_ID) as any[];

      const typedInvoices: Invoice[] = invoiceRecords.map(record => {
        const vendorName = record.fields.vendor_party_id?.title || 'N/A';
        const customerName = record.fields.customer_party_id?.title || 'N/A';
        
        return {
          id: record.id,
          fields: {
            ...record.fields,
            'Vendor Name': vendorName,
            'Customer Name': customerName,
          }
        } as Invoice;
      });

      setInvoices(typedInvoices);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsDialogOpen(true);
  };

  const handleInvoiceUploaded = () => {
    fetchInvoices();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between z-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Invoice Management
          </h2>
          <p className="text-muted-foreground">
            Track and manage all your incoming and outgoing invoices.
          </p>
        </div>
        <UploadInvoiceDialog onInvoiceUploaded={handleInvoiceUploaded} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.length > 0 ? "Overview of all invoices" : "No invoices yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Paid Invoices
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {invoices.filter(i => i.fields['Current Status'] === 'Paid').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoices.length > 0
                ? `${Math.round(
                    (invoices.filter(i => i.fields['Current Status'] === 'Paid').length /
                      invoices.length) *
                      100,
                  )}% of total`
                : "No paid invoices"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {
                invoices.filter((i) => {
                  const now = new Date();
                  const dueDate = i.fields['Payment Date'] ? new Date(i.fields['Payment Date']) : null;
                  if (!dueDate) return false;
                  const diff = dueDate.getTime() - now.getTime();
                  const days = diff / (1000 * 3600 * 24);
                  return days > 0 && days <= 30; // Due within next 30 days
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Within next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>
                View and manage all your invoices.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search invoices..."
                  className="pl-8 w-[250px]"
                />
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
                <TableHead>Customer</TableHead>
                <TableHead>Invoice Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.fields['Invoice ID']}</TableCell>
                    <TableCell>{invoice.fields['vendor_party_id']?.title || 'N/A'}</TableCell>
                    <TableCell>{invoice.fields['customer_party_id']?.title || 'N/A'}</TableCell>
                    <TableCell>{new Date(invoice.fields['Invoice Date']).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {invoice.fields['Payment Date']
                        ? new Date(invoice.fields['Payment Date']).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={invoice.fields['Current Status']} />
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: invoice.fields['Currency'] || "USD",
                      }).format(invoice.fields['Gross Amount'])}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedInvoice && (
        <InvoiceDetailsDialog
          invoice={selectedInvoice}
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        />
      )}
    </div>
  )
}
