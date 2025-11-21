"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2, AlertTriangle, FileText } from "lucide-react"
import type { ValidationException } from "@/lib/pdf-processor"

interface ProofModalProps {
  invoice: any
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
              <Badge variant={invoice.status === "Validated" ? "default" : "destructive"}>{invoice.status}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Invoice #{invoice.id} • {invoice.vendor}
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
                    Line Item
                  </div>
                  <div className="font-medium text-lg">{invoice.lineItem}</div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Quantity</div>
                      <div className="font-mono">{invoice.quantity}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Unit Price</div>
                      <div className={`font-mono text-lg font-bold ${exception ? "text-red-600" : ""}`}>
                        {invoice.unitPrice}
                      </div>
                    </div>
                  </div>
                </div>

                {proofData && (
                  <div className="rounded-lg border border-red-200 bg-white p-4 shadow-sm">
                    <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                      Invoice Text (Page {proofData.invoicePageNumber})
                    </div>
                    <div className="p-3 bg-red-50 rounded text-sm font-mono whitespace-pre-line text-red-900 border border-red-200">
                      {proofData.invoiceText}
                    </div>
                  </div>
                )}

                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    Total Amount
                  </div>
                  <div className="text-2xl font-bold">{invoice.totalAmount}</div>
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
                <div className="rounded-lg border border-green-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium text-green-700 uppercase tracking-wider">Matched Term</div>
                    <Badge variant="outline" className="border-green-600 text-green-700">
                      {exception ? `${(exception.contractTerm?.confidence || 0) * 100}%` : "100%"} Match
                    </Badge>
                  </div>
                  <div className="font-medium text-lg">{invoice.contractTerm}</div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Agreed Rate</div>
                      <div className="font-mono text-lg font-bold text-green-600">{invoice.contractRate}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Variance</div>
                      <div
                        className={
                          invoice.variance === "$0.00" ? "text-green-600 font-bold" : "text-destructive font-bold"
                        }
                      >
                        {invoice.variance}
                      </div>
                    </div>
                  </div>
                </div>

                {proofData && (
                  <div className="rounded-lg border border-green-200 bg-white p-4 shadow-sm">
                    <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                      Contract Text (Page {proofData.contractPageNumber})
                    </div>
                    <div className="p-3 bg-green-50 rounded text-sm font-mono whitespace-pre-line text-green-900 border border-green-200">
                      {proofData.contractText}
                    </div>
                  </div>
                )}

                {proofData?.varianceCalculation && (
                  <div className="rounded-lg border-2 border-amber-500 bg-amber-50 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Variance Calculation
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contract Price:</span>
                        <span className="font-mono font-medium">
                          ${proofData.varianceCalculation.contractPrice.toFixed(2)}/unit
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Invoice Price:</span>
                        <span className="font-mono font-medium">
                          ${proofData.varianceCalculation.invoicePrice.toFixed(2)}/unit
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-muted-foreground">Difference:</span>
                        <span className="font-mono font-bold text-red-600">
                          ${proofData.varianceCalculation.difference.toFixed(2)}/unit
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="font-mono">× {proofData.varianceCalculation.quantity} units</span>
                      </div>
                      <div className="flex justify-between border-t-2 border-amber-600 pt-2 mt-2">
                        <span className="font-bold text-amber-900">Total Overcharge:</span>
                        <span className="font-mono font-bold text-lg text-red-600">
                          ${proofData.varianceCalculation.totalOvercharge.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    Source Document
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary underline cursor-pointer">
                    <FileText className="h-4 w-4" />
                    Master Service Agreement 2024 (Page {proofData?.contractPageNumber || 14})
                  </div>
                </div>
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
            {invoice.status === "Flagged" && (
              <>
                <Button variant="outline">Approve Anyway</Button>
                <Button variant="destructive">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Request Correction
                </Button>
              </>
            )}
            {invoice.status === "Validated" && (
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
