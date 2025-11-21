"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, CheckCircle2 } from "lucide-react"

interface ContractDetailsDialogProps {
  contract: {
    id: string
    vendor: string
    type: string
    status: string
    startDate: string
    endDate: string
    value: string
    terms: string[]
    extractedData: {
      discount: string
      paymentTerms: string
      penaltyClause: string
    }
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContractDetailsDialog({ contract, open, onOpenChange }: ContractDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {contract.vendor} - {contract.type}
          </DialogTitle>
          <DialogDescription>Contract ID: {contract.id}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Contract Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <Badge className={contract.status === "Active" ? "bg-green-600" : ""}>{contract.status}</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Contract Value</div>
                <div className="text-lg font-semibold">{contract.value}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Start Date</div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {contract.startDate}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">End Date</div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {contract.endDate}
                </div>
              </div>
            </div>

            <Separator />

            {/* AI Extracted Data */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">AI-Extracted Terms</h3>
              </div>

              <div className="grid gap-4">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="text-sm font-medium mb-1">Volume Discount</div>
                  <div className="text-sm text-muted-foreground">{contract.extractedData.discount}</div>
                </div>

                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="text-sm font-medium mb-1">Payment Terms</div>
                  <div className="text-sm text-muted-foreground">{contract.extractedData.paymentTerms}</div>
                </div>

                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="text-sm font-medium mb-1">Penalty Clause</div>
                  <div className="text-sm text-muted-foreground">{contract.extractedData.penaltyClause}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Key Terms */}
            <div className="space-y-4">
              <h3 className="font-semibold">Key Terms & Conditions</h3>
              <ul className="space-y-2">
                {contract.terms.map((term, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{term}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>View Full PDF</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
