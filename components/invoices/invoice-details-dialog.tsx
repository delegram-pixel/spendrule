"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Invoice } from "@/lib/invoice-types"
import { Label } from "@/components/ui/label"
import { DollarSign, CalendarDays, ReceiptText, Tag, UserRound, Building } from "lucide-react"
import { ProofModal } from "@/components/invoices/proof-modal"
import type { ValidationException, ProofData } from "@/lib/pdf-processor"
import { useState } from "react"

interface InvoiceDetailsDialogProps {
  invoice: Invoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoiceDetailsDialog({
  invoice,
  open,
  onOpenChange,
}: InvoiceDetailsDialogProps) {
  const [isProofModalOpen, setIsProofModalOpen] = useState(false)
  const [currentExceptionForProof, setCurrentExceptionForProof] = useState<ValidationException | undefined>(undefined)

  if (!invoice) return null

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleViewProof = (lineItem: InvoiceLineItem) => {
    const simulatedProofData: ProofData = {
      contractPageNumber: 0, // No contract page for a simple line item click
      contractText: "N/A",
      contractHighlight: { x: 0, y: 0, width: 0, height: 0 },
      invoicePageNumber: lineItem.fields.pageNumber || 1, // Use pageNumber from line item
      invoiceText: `Description: ${lineItem.fields.Description}\nQuantity: ${lineItem.fields.Quantity}\nUnit Price: ${lineItem.fields["Unit Price"]}\nTotal: ${lineItem.fields.Total}`,
      invoiceHighlight: { x: 0, y: 0, width: 0, height: 0 }, // Placeholder, can be improved with actual coordinates
      varianceCalculation: {
        contractPrice: 0,
        invoicePrice: lineItem.fields["Unit Price"],
        difference: 0,
        quantity: lineItem.fields.Quantity,
        totalOvercharge: 0,
      },
    }

    const simulatedException: ValidationException = {
      type: "info", // Or a more specific type if applicable
      severity: "info",
      lineItem: {
        description: lineItem.fields.Description,
        quantity: lineItem.fields.Quantity,
        unitPrice: lineItem.fields["Unit Price"],
        totalPrice: lineItem.fields.Total,
        pageNumber: lineItem.fields.pageNumber || 1,
      } as any, // Cast to any to match the InvoiceLineItem in ValidationException
      description: `Viewing proof for invoice line item: ${lineItem.fields.Description}`,
      proofData: simulatedProofData,
    }

    setCurrentExceptionForProof(simulatedException)
    setIsProofModalOpen(true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">

        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>
            Comprehensive view of Invoice #{invoice.fields['Invoice ID']}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="grow p-4 -mx-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <ReceiptText className="h-5 w-5 text-primary" /> Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <Label>Invoice ID:</Label>
                <span>{invoice.fields['Invoice ID']}</span>

                <Label>Current Status:</Label>
                <Badge
                  variant={
                    invoice.fields['Current Status'] === "Approved" ||
                    invoice.fields['Current Status'] === "Paid"
                      ? "default"
                      : invoice.fields['Current Status'] === "Rejected" ||
                        invoice.fields['Current Status'] === "Flagged"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {invoice.fields['Current Status']}
                </Badge>

                <Label>Invoice Date:</Label>
                <span>{formatDate(invoice.fields['Invoice Date'])}</span>

                <Label>Payment Date:</Label>
                <span>
                  {invoice.fields['Payment Date']
                    ? formatDate(invoice.fields['Payment Date'])
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Parties Information */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <UserRound className="h-5 w-5 text-primary" /> Parties
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <Label>Vendor:</Label>
                <span>{invoice.fields.vendor_party_id?.title || "N/A"}</span>

                <Label>Customer:</Label>
                <span>{invoice.fields.customer_party_id?.title || "N/A"}</span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Financial Overview */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" /> Financial Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
              <Label>Gross Amount:</Label>
              <span>
                {formatCurrency(invoice.fields['Gross Amount'], invoice.fields['Currency'])}
              </span>

              <Label>Currency:</Label>
              <span>{invoice.fields['Currency']}</span>
            </div>
          </div>

          {/* Line Items */}
          {invoice.fields.LineItems && invoice.fields.LineItems.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" /> Line Items
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.fields.LineItems.map((item, index) => (
                      <TableRow
                        key={index}
                        onClick={() => handleViewProof(item)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">{item.fields.Description}</TableCell>
                        <TableCell className="text-right">{item.fields.Quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.fields["Unit Price"], invoice.fields['Currency'])}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.fields.Total, invoice.fields['Currency'])}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </ScrollArea>

        {invoice && (
          <ProofModal
            invoice={invoice as any} // Cast to any because ProofModal's Invoice type is simpler
            exception={currentExceptionForProof}
            open={isProofModalOpen}
            onOpenChange={setIsProofModalOpen}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
