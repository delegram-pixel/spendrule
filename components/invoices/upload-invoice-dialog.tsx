"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, X, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { createRecord, createBatchRecords } from "@/lib/teable"
import { INVOICES_TABLE_ID, INVOICE_LINE_ITEMS_TABLE_ID } from "@/lib/teable-constants"
import { mapInvoiceDataToTeableFields, mapInvoiceLineItemToTeableFields } from "@/lib/teable-fields"

type UploadState = "idle" | "uploading" | "success" | "error"
type UploadStep = "Uploading" | "Scanning" | "Extracting" | "Saving" | "Complete"

interface UploadInvoiceDialogProps {
  onInvoiceUploaded: () => void
}

export function UploadInvoiceDialog({ onInvoiceUploaded }: UploadInvoiceDialogProps) {
  const [open, setOpen] = useState(false)
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [uploadStep, setUploadStep] = useState<UploadStep>("Uploading")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [progress, setProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInvoiceFile(e.target.files[0]);
    }
  }

  const removeFile = () => {
    setInvoiceFile(null)
    resetForm();
  }

  const handleUpload = async () => {
    if (!invoiceFile) {
      setErrorMessage("A PDF file is required.")
      return
    }

    try {
      setUploadState("uploading")
      setUploadStep("Uploading")
      setProgress(10)
      setErrorMessage("")

      // 1. Upload file to the server for extraction
      const formData = new FormData();
      formData.append('file', invoiceFile);
      formData.append('documentType', 'invoice');
      
      setProgress(30);
      setUploadStep("Scanning");

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to extract data from the server.');
      }

      const result = await response.json();
      const extractedData = result.data;
      
      setUploadStep("Saving");
      setProgress(70);
      
      // 2. Map extracted data to Teable fields
      const finalInvoiceRecord = mapInvoiceDataToTeableFields(extractedData);
      setProgress(80);

      // 3. Create the main invoice record
      const createdInvoice = await createRecord(INVOICES_TABLE_ID, finalInvoiceRecord);
      const invoiceId = createdInvoice.id;
      setProgress(90);

      // 4. Create Invoice Line Items
      if (extractedData.lineItems && extractedData.lineItems.length > 0) {
        const invoiceLineItemRecords = extractedData.lineItems.map((item: any) => ({
          ...mapInvoiceLineItemToTeableFields(item),
          'invoice_id': [ { id: invoiceId } ]
        }));
        await createBatchRecords(INVOICE_LINE_ITEMS_TABLE_ID, invoiceLineItemRecords);
      }

      setProgress(100);
      setUploadStep("Complete");
      setUploadState("success")
      onInvoiceUploaded()

      setTimeout(() => {
        setOpen(false)
        resetForm()
      }, 1500)
    } catch (error: any) {
      console.error("Invoice upload failed:", error)
      setErrorMessage(error.message || "An unexpected error occurred.")
      setUploadState("error")
    }
  }

  const resetForm = () => {
    setInvoiceFile(null)
    setUploadState("idle")
    setErrorMessage("")
    setProgress(0)
    setUploadStep("Uploading")
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload New Invoice</DialogTitle>
          <DialogDescription>
            Upload an invoice PDF and fill in the details to add it to the system.
          </DialogDescription>
        </DialogHeader>

        {uploadState === "idle" && (
          <div className="grid gap-6 py-4">
            
            <div className="grid gap-2">
              <Label htmlFor="invoice-file">Invoice PDF *</Label>
              <div className="relative border-2 border-dashed rounded-lg p-6 transition-colors border-border">
                {!invoiceFile ? (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-sm">
                      <label htmlFor="invoice-file" className="text-primary cursor-pointer hover:underline">
                        Click to upload invoice
                      </label>{" "}
                      or drag and drop
                    </div>
                    <p className="text-xs text-muted-foreground">PDF files only</p>
                    <input
                      id="invoice-file"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <div className="text-sm">
                        <p className="font-medium">{invoiceFile.name}</p>
                        <p className="text-muted-foreground">{(invoiceFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={removeFile}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {uploadState === "uploading" && (
          <div className="grid gap-4 py-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <div className="space-y-2 text-center">
              <p className="font-medium">{uploadStep}...</p>
              <p className="text-sm text-muted-foreground">
                {uploadStep === "Scanning" 
                  ? "Scanning document with OCR, this may take a moment..."
                  : "Extracting details, please wait..."}
              </p>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {uploadState === "success" && (
          <div className="grid gap-4 py-8">
            <div className="flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <div className="text-center">
              <p className="font-medium">Upload Complete!</p>
              <p className="text-sm text-muted-foreground">The invoice and its line items have been added.</p>
            </div>
          </div>
        )}
        
        {uploadState === "error" && (
          <div className="grid gap-4 py-8">
            <div className="flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <div className="text-center">
              <p className="font-medium">Upload Failed</p>
              <p className="text-sm text-muted-foreground">
                {errorMessage ? errorMessage : "Something went wrong. Please try again."}
              </p>
            </div>
          </div>
        )}

        {uploadState === "idle" && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!invoiceFile}
            >
              Upload & Process
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
                </Dialog>
              )
            }