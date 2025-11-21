"use client"

import { useState } from "react"
import { UploadInvoiceDialog } from "@/components/invoices/upload-invoice-dialog"
import { ComparisonResultDisplay } from "@/components/validation/comparison-result-display"
import type { ComparisonResult } from "@/lib/pdf-processor"

export default function ValidationPage() {
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null)

  const handleValidationComplete = (result: ComparisonResult) => {
    setComparisonResult(result)
  }

  const handleClearResult = () => {
    setComparisonResult(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Document Validation</h2>
          <p className="text-muted-foreground">
            Upload invoices and contracts for AI-powered comparison.
          </p>
        </div>
        <UploadInvoiceDialog onValidationComplete={handleValidationComplete} />
      </div>

      {comparisonResult && (
        <ComparisonResultDisplay result={comparisonResult} onClear={handleClearResult} />
      )}

      {!comparisonResult && (
        <div className="flex items-center justify-center h-[calc(100vh-200px)] text-muted-foreground text-lg">
          Upload an invoice and contract to see validation results here.
        </div>
      )}
    </div>
  )
}
