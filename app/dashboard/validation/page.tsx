"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from 'next/dynamic'
import { ComparisonResultDisplay } from "@/components/validation/comparison-result-display"
import { fetchRecords } from "@/lib/teable"
import { 
  VALIDATION_EXCEPTIONS_TABLE_ID,
  INVOICE_VALIDATIONS_TABLE_ID
} from "@/lib/teable-constants"
import type { ComparisonResult, ValidationException, InvoiceLineItem } from "@/lib/pdf-processor"
import axios from "axios"

const UploadInvoiceDialog = dynamic(
  () => import('@/components/invoices/upload-invoice-dialog').then(mod => mod.UploadInvoiceDialog),
  { ssr: false }
)

// This function needs to be updated to also pass the original invoice line items
async function getLatestComparisonResult(): Promise<ComparisonResult | null> {
  try {
    const validationSummaries = (await fetchRecords(INVOICE_VALIDATIONS_TABLE_ID)).reverse();
    if (!validationSummaries || validationSummaries.length === 0) return null;
    const latestSummary = validationSummaries[0];
    const summaryFields = latestSummary.fields;
    
    const allExceptions = await fetchRecords(VALIDATION_EXCEPTIONS_TABLE_ID);

    const relatedExceptions = allExceptions.filter(e => e.fields.validation_id === summaryFields.validation_id);

    // This is a limitation: we don't have the original line items stored.
    // For the new design, we have to reconstruct them from the exceptions.
    // This means compliant items won't be shown until we store them.
    // We will simulate the `allInvoiceLineItems` from the exceptions for now.
    const allLineItemsFromExceptions = relatedExceptions.map((record: any) => record.fields.lineItem);

    const exceptions: ValidationException[] = relatedExceptions.map((record: any): ValidationException => {
        const fields = record.fields;
        return {
            type: fields.exception_type,
            severity: fields.severity,
            description: fields.message || '',
            variance: fields.variance_amount || 0,
            lineItem: {
                description: fields.field_name || 'N/A',
                quantity: 0, 
                unitPrice: parseFloat(fields.actual_value) || 0,
                totalPrice: 0,
                pageNumber: fields.line_number || 0,
            },
            contractTerm: fields.expected_value !== "N/A" ? {
                itemDescription: fields.field_name || 'N/A',
                unitPrice: parseFloat(fields.expected_value) || 0,
                unit: 'N/A',
                pageNumber: 0,
                confidence: 0,
            } : undefined,
            proofData: {} as any,
        };
    });

    return {
      id: latestSummary.id,
      invoiceId: summaryFields.invoiceId || 'N/A',
      contractId: summaryFields.contractId || 'N/A',
      vendorName: summaryFields.vendor_name as string || 'N/A',
      overallMatch: summaryFields.overall_status === 'Approved',
      confidence: summaryFields.confidence_score || 0,
      totalVariance: summaryFields.variance_amount || 0,
      potentialSavings: summaryFields.potential_savings || 0,
      validationDate: summaryFields.validation_date,
      exceptions: exceptions,
      // Temporarily reconstruct allInvoiceLineItems from exceptions
      // This is not ideal, but required for the UI to render.
      allInvoiceLineItems: allLineItemsFromExceptions, 
      totalLineItems: summaryFields.total_line_items || exceptions.length,
      compliantLineItems: summaryFields.compliant_line_items || 0,
    };

  } catch (error) {
    console.error("Error reconstructing latest result:", error);
    return null;
  }
}


export default function ValidationPage() {
  const [latestResult, setLatestResult] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = () => {
    setIsLoading(true);
    getLatestComparisonResult().then(result => {
      setLatestResult(result);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleValidationComplete = () => {
    fetchData();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        <UploadInvoiceDialog onInvoiceUploaded={handleValidationComplete} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <p>Loading latest validation result...</p>
        </div>
      ) : latestResult ? (
        <ComparisonResultDisplay result={latestResult} />
      ) : (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center text-muted-foreground p-4">
          <h3 className="text-lg font-semibold">No validation results found.</h3>
          <p>Upload an invoice and contract to start the validation process.</p>
        </div>
      )}
    </div>
  );
}
