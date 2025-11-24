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
import { Upload, FileText, X, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { createRecord } from "@/lib/teable"
import { INVOICES_TABLE_ID } from "@/lib/teable-constants"
import { invoiceTypes } from "@/lib/invoice-types"
import { extractInvoiceData } from "@/lib/pdf-processor"

type UploadState = "idle" | "uploading" | "success" | "error"


interface UploadInvoiceDialogProps {
  onInvoiceUploaded: () => void
}

export function UploadInvoiceDialog({ onInvoiceUploaded }: UploadInvoiceDialogProps) {
  const [open, setOpen] = useState(false)
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)
  const [vendorName, setVendorName] = useState("")
  const [invoiceType, setInvoiceType] = useState("")
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")



  useEffect(() => {
    // no-op: keep client effect placeholder
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInvoiceFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setInvoiceFile(null)
  }


  const handleUpload = async () => {
    if (!invoiceFile) return

    try {
      setUploadState("uploading")
      setErrorMessage("")

      // For this demo, we'll just extract the data and save the metadata.
      const { extractedData: invoiceData, items: invoiceItems } = await extractInvoiceData(invoiceFile)
      
      const invoiceRecord = {
        'Invoice Number 2': invoiceData.invoiceNumber || "N/A",
        'Invoice Date': invoiceData.invoiceDate?.toISOString().split('T')[0] || "N/A",
        'Gross Amount': invoiceData.totalAmount || 0,
      };

      await createRecord(INVOICES_TABLE_ID, invoiceRecord)
      
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
    setVendorName("")
    setInvoiceType("")
    setUploadState("idle")
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
            Upload an invoice PDF to add it to the system.
          </DialogDescription>
        </DialogHeader>

        {uploadState === "idle" && (
          <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="vendor">Vendor Name *</Label>
                            <Input
                              id="vendor"
                              placeholder="e.g., MediSupply Corp"
                              value={vendorName}
                              onChange={(e) => setVendorName(e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="invoice-type">Invoice Type *</Label>
                            <Select onValueChange={setInvoiceType} value={invoiceType}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an invoice type" />
                              </SelectTrigger>
                              <SelectContent>
                                {invoiceTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
            
                        
                        
                        <div className="grid gap-2">
                          <Label htmlFor="invoice-file">Invoice PDF *</Label>
                          <div
                            className="relative border-2 border-dashed rounded-lg p-6 transition-colors border-border"
                          >
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
                      <div className="grid gap-4 py-8">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        </div>
                        <div className="space-y-2 text-center">
                          <p className="font-medium">
                            Uploading invoice...
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Securely uploading your file
                          </p>
                        </div>
                      </div>
                    )}
            
                    {uploadState === "success" && (
                      <div className="grid gap-4 py-8">
                        <div className="flex items-center justify-center">
                          <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium">Upload Complete!</p>
                          <p className="text-sm text-muted-foreground">The invoice has been added.</p>
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
                          Upload & Save
                        </Button>
                      </DialogFooter>
                    )}
                  </DialogContent>
                </Dialog>
              )
            }