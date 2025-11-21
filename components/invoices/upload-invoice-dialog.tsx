"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Upload, FileText, X, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import {
  extractInvoiceData,
  extractContractData,
  compareInvoiceToContract,
  type ComparisonResult,
} from "@/lib/pdf-processor"

type UploadState = "idle" | "uploading" | "validating" | "success" | "error"

interface UploadInvoiceDialogProps {
  onValidationComplete: (result: ComparisonResult) => void
}

export function UploadInvoiceDialog({ onValidationComplete }: UploadInvoiceDialogProps) {
  const [open, setOpen] = useState(false)
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)
  const [contractFile, setContractFile] = useState<File | null>(null)
  const [vendorName, setVendorName] = useState("")
  const [contractType, setContractType] = useState("")
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState<"invoice" | "contract" | null>(null)

  const handleDrag = (e: React.DragEvent, type: "invoice" | "contract") => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(type)
    } else if (e.type === "dragleave") {
      setDragActive(null)
    }
  }

  const handleDrop = (e: React.DragEvent, type: "invoice" | "contract") => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(null)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf") {
        if (type === "invoice") {
          setInvoiceFile(droppedFile)
        } else {
          setContractFile(droppedFile)
        }
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "invoice" | "contract") => {
    if (e.target.files && e.target.files[0]) {
      if (type === "invoice") {
        setInvoiceFile(e.target.files[0])
      } else {
        setContractFile(e.target.files[0])
      }
    }
  }

  const removeFile = (type: "invoice" | "contract") => {
    if (type === "invoice") {
      setInvoiceFile(null)
    } else {
      setContractFile(null)
    }
  }

  const handleUpload = async () => {
    if (!invoiceFile || !contractFile || !vendorName || !contractType) return

    try {
      setUploadState("uploading")
      setProgress(0)
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setProgress(i)
      }

      setUploadState("validating")
      setProgress(0)

      const invoiceData = await extractInvoiceData(invoiceFile, (p) => setProgress(p * 0.5))
      const contractData = await extractContractData(contractFile, (p) => setProgress(50 + p * 0.5))
      const result = await compareInvoiceToContract(invoiceData, contractData)

      console.log("[v0] Invoice validation complete:", result)
      setUploadState("success")
      onValidationComplete(result)

      setTimeout(() => {
        setOpen(false)
        resetForm()
      }, 1500)
    } catch (error) {
      console.error("[v0] Invoice validation failed:", error)
      setUploadState("error")
    }
  }

  const resetForm = () => {
    setInvoiceFile(null)
    setContractFile(null)
    setVendorName("")
    setContractType("")
    setUploadState("idle")
    setProgress(0)
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
          Validate Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Validate Invoice Against Contract</DialogTitle>
          <DialogDescription>
            Upload an invoice and its corresponding contract to automatically check for discrepancies.
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
                <Label htmlFor="contract-type">Contract Type *</Label>
                <Input
                  id="contract-type"
                  placeholder="e.g., Medical Supplies"
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="invoice-file">Invoice PDF *</Label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                  dragActive === "invoice" ? "border-primary bg-primary/5" : "border-border"
                }`}
                onDragEnter={(e) => handleDrag(e, "invoice")}
                onDragLeave={(e) => handleDrag(e, "invoice")}
                onDragOver={(e) => handleDrag(e, "invoice")}
                onDrop={(e) => handleDrop(e, "invoice")}
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
                      onChange={(e) => handleFileChange(e, "invoice")}
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
                    <Button variant="ghost" size="icon" onClick={() => removeFile("invoice")}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contract-file">Contract PDF *</Label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                  dragActive === "contract" ? "border-primary bg-primary/5" : "border-border"
                }`}
                onDragEnter={(e) => handleDrag(e, "contract")}
                onDragLeave={(e) => handleDrag(e, "contract")}
                onDragOver={(e) => handleDrag(e, "contract")}
                onDrop={(e) => handleDrop(e, "contract")}
              >
                {!contractFile ? (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-sm">
                      <label htmlFor="contract-file" className="text-primary cursor-pointer hover:underline">
                        Click to upload contract
                      </label>{" "}
                      or drag and drop
                    </div>
                    <p className="text-xs text-muted-foreground">PDF files only</p>
                    <input
                      id="contract-file"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, "contract")}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <div className="text-sm">
                        <p className="font-medium">{contractFile.name}</p>
                        <p className="text-muted-foreground">{(contractFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFile("contract")}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {(uploadState === "uploading" || uploadState === "validating") && (
          <div className="grid gap-4 py-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <div className="space-y-2 text-center">
              <p className="font-medium">
                {uploadState === "uploading" ? "Uploading files..." : "Validating invoice against contract..."}
              </p>
              <p className="text-sm text-muted-foreground">
                {uploadState === "uploading"
                  ? "Securely uploading your files"
                  : "Checking line items, rates, and terms"}
              </p>
              <Progress value={progress} className="mt-4" />
            </div>
          </div>
        )}

        {uploadState === "success" && (
          <div className="grid gap-4 py-8">
            <div className="flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <div className="text-center">
              <p className="font-medium">Validation Complete!</p>
              <p className="text-sm text-muted-foreground">The results are now displayed.</p>
            </div>
          </div>
        )}
        
        {uploadState === "error" && (
          <div className="grid gap-4 py-8">
            <div className="flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <div className="text-center">
              <p className="font-medium">Validation Failed</p>
              <p className="text-sm text-muted-foreground">
                Something went wrong. Please try again.
              </p>
            </div>
          </div>
        )}

        {uploadState === "idle" && (
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex flex-col items-end gap-1">
              <Button
                onClick={handleUpload}
                disabled={!invoiceFile || !contractFile || !vendorName || !contractType}
              >
                Upload & Validate
              </Button>
              {(!invoiceFile || !contractFile || !vendorName || !contractType) && (
                <span className="text-[10px] text-muted-foreground">Fill all fields to validate</span>
              )}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}