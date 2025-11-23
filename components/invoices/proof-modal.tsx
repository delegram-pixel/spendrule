"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2, AlertTriangle, FileText } from "lucide-react"
import type { ValidationException } from "@/lib/pdf-processor"

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

interface ProofModalProps {
  invoice: Invoice | null
  exception?: ValidationException
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProofModal({ invoice, exception, open, onOpenChange }: ProofModalProps) {
  if (!invoice) return null

  const proofData = exception?.proofData

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl">Validation Proof</DialogTitle>
              <Badge variant={invoice.fields['Status'] === "Validated" ? "default" : "destructive"}>{invoice.fields['Status']}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Invoice #{invoice.fields['Invoice ID']} • {invoice.fields['Vendor Name']}
            </div>
          </div>
          <DialogDescription className="sr-only">
            Side-by-side comparison of invoice line items against contract terms.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-2 divide-x overflow-hidden">
          {/* Left Side: Invoice Data */}
          <div className="flex flex-col bg-red-50/30">
            <div className="p-4 border-b bg-red-100/50 font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-red-700" />
              <span className="text-red-900">Invoice Data</span>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                <div className="rounded-lg border border-red-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    Total Amount
                  </div>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(invoice.fields['Total Amount'])}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Right Side: Contract Evidence */}
          <div className="flex flex-col bg-green-50/30">
            <div className="p-4 border-b bg-green-100/50 font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-700" />
              <span className="text-green-900">Contract Evidence</span>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {/* Contract details can be added here once available */}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="p-4 border-t bg-muted/10 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            AI Confidence:{" "}
            <span className="font-bold text-foreground">
              {exception ? `${(exception.contractTerm?.confidence || 0.98) * 100}%` : "98%"}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {invoice.fields['Status'] === "Flagged" && (
              <>
                <Button variant="outline">Approve Anyway</Button>
                <Button variant="destructive">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Request Correction
                </Button>
              </>
            )}
            {invoice.fields['Status'] === "Validated" && (
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve for Payment
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
