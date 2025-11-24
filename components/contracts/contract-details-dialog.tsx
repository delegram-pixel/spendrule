"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, CheckCircle2 } from "lucide-react"

interface ContractDetailsDialogProps {
  contract: {
    id: string;
    fields: {
      'Contract Name': string;
      'Contract ID': string;
      'Contract Number': string;
      'Contract Title': string;
      'Version': string;
      'Contract Type': "Master Service Agreement" | "Statement of Work" | "Purchase Order" | "License Agreement" | "Other";
      'Contract Status': "Draft" | "Active" | "Pending" | "Expired" | "Terminated";
      'Relationship Type': "Parent" | "Child" | "Standalone";
      'Total Contract Value': number;
      'Annual Value': number;
      'Currency': string;
      'Effective Date': string;
      'Expiration Date': string;
      'Created Date': string;
      'Updated Date': string;
      'Auto Renewal Enabled': boolean;
      'Renewal Period': string;
      'Notice Period Days': number;
      'Hierarchy Level': number;
      'Parent Contract ID': string | null;
      'billable_items': string[];
      'contract_parties': string[];
      'document_extraction_data': string; // This holds the stringified ExtractedContractData
    }
  }
  open: boolean
  onOpenChange: (open: boolean) => void;
  billableItems: { id: string; fields: { [key: string]: any } }[];
  contractParties: { id: string; fields: { [key: string]: any } }[];
}

export function ContractDetailsDialog({ contract, open, onOpenChange, billableItems, contractParties }: ContractDetailsDialogProps) {
  const contractFields = contract.fields;
  const extractedData = JSON.parse(contractFields['document_extraction_data'] || '{}');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {contractFields['Contract Name'] || "N/A"}
          </DialogTitle>
          <DialogDescription>Contract ID: {contractFields['Contract ID']}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Contract Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <Badge className={contractFields['Contract Status'] === "Active" ? "bg-green-600" : ""}>{contractFields['Contract Status']}</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Contract Type</div>
                <div className="text-lg font-semibold">{contractFields['Contract Type']}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Total Contract Value</div>
                <div className="text-lg font-semibold">{contractFields['Currency']} {contractFields['Total Contract Value']?.toFixed(2) || "0.00"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Annual Value</div>
                <div className="text-lg font-semibold">{contractFields['Currency']} {contractFields['Annual Value']?.toFixed(2) || "0.00"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Effective Date</div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {new Date(contractFields['Effective Date']).toLocaleDateString()}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Expiration Date</div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {new Date(contractFields['Expiration Date']).toLocaleDateString()}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Auto Renewal</div>
                <div className="text-sm">{contractFields['Auto Renewal Enabled'] ? "Yes" : "No"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Renewal Period</div>
                <div className="text-sm">{contractFields['Renewal Period'] || "N/A"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Notice Period</div>
                <div className="text-sm">{contractFields['Notice Period Days'] ? `${contractFields['Notice Period Days']} days` : "N/A"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Version</div>
                <div className="text-sm">{contractFields['Version'] || "N/A"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Hierarchy Level</div>
                <div className="text-sm">{contractFields['Hierarchy Level'] || "N/A"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Parent Contract ID</div>
                <div className="text-sm">{contractFields['Parent Contract ID'] || "N/A"}</div>
              </div>
            </div>

            <Separator />

            {/* AI Extracted Data */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">AI-Extracted Details</h3>
              </div>

              <div className="grid gap-4">
                 <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="text-sm font-medium mb-1">Contract Number</div>
                  <div className="text-sm text-muted-foreground">{contractFields['Contract Number'] || "N/A"}</div>
                </div>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="text-sm font-medium mb-1">Contract Title</div>
                  <div className="text-sm text-muted-foreground">{contractFields['Contract Title'] || "N/A"}</div>
                </div>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="text-sm font-medium mb-1">Payment Terms</div>
                  <div className="text-sm text-muted-foreground">{extractedData.paymentTerms || "N/A"}</div>
                </div>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="text-sm font-medium mb-1">Penalty Clauses</div>
                  <div className="text-sm text-muted-foreground">{extractedData.penaltyClauses?.join('; ') || "N/A"}</div>
                </div>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="text-sm font-medium mb-1">Compliance Requirements</div>
                  <div className="text-sm text-muted-foreground">{extractedData.complianceRequirements?.join('; ') || "N/A"}</div>
                </div>
                {/* Display Billable Items */}
                {billableItems && billableItems.length > 0 && (
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="text-sm font-medium mb-2">Billable Items</div>
                    <ul className="space-y-1">
                      {billableItems.map((item, index) => (
                        <li key={item.id || index} className="text-sm text-muted-foreground">
                          {item.fields['Item Description']}: {item.fields['Unit Price']} {item.fields['Unit']}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Display Contract Parties */}
                {contractParties && contractParties.length > 0 && (
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="text-sm font-medium mb-2">Contract Parties</div>
                    <ul className="space-y-1">
                      {contractParties.map((party, index) => (
                        <li key={party.id || index} className="text-sm text-muted-foreground">
                          {party.fields['Name']} ({party.fields['Role']})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
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
