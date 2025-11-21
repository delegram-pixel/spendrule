"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, CheckCircle2, XCircle, MessageSquare, History } from "lucide-react"

interface ExceptionDetailsSheetProps {
  exception: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExceptionDetailsSheet({ exception, open, onOpenChange }: ExceptionDetailsSheetProps) {
  if (!exception) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] flex flex-col gap-0">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Price Variance Detected</span>
          </div>
          <SheetTitle>{exception.invoiceId}</SheetTitle>
          <SheetDescription>
            {exception.vendor} • {exception.date}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 py-6">
          <div className="space-y-6">
            {/* Variance Summary */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">Invoice Amount</div>
                <div className="font-mono font-bold">{exception.invoiceAmount}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">Contract Rate</div>
                <div className="font-mono font-bold text-primary">{exception.contractRate}</div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-destructive">Variance</div>
                <div className="font-mono font-bold text-destructive">{exception.variance}</div>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">AI Analysis</h3>
              <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-950/20 text-sm text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                The invoiced unit price of {exception.invoiceAmount} exceeds the contracted rate of{" "}
                {exception.contractRate} by 12%. This appears to be a pricing error as no recent amendments were found.
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <History className="h-4 w-4" />
                Activity Log
              </h3>
              <div className="space-y-4 border-l-2 border-muted pl-4 ml-1">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-destructive ring-4 ring-background" />
                  <div className="text-sm font-medium">Flagged by System</div>
                  <div className="text-xs text-muted-foreground">Nov 20, 2023 • 10:42 AM</div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-muted-foreground ring-4 ring-background" />
                  <div className="text-sm font-medium">Assigned to Finance Team</div>
                  <div className="text-xs text-muted-foreground">Nov 20, 2023 • 10:45 AM</div>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Add Note
              </h3>
              <Textarea placeholder="Add a note for the vendor or internal team..." />
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t bg-muted/10 sm:justify-between gap-2">
          <Button
            variant="outline"
            className="flex-1 border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject Invoice
          </Button>
          <Button className="flex-1">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Approve Exception
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
