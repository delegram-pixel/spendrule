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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Upload, FileText, X, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { extractContractData } from "@/lib/pdf-processor"
import { contractTypes } from "@/lib/contract-types"
import { createRecord } from "@/lib/teable"
import { CONTRACTS_TABLE_ID } from "@/lib/teable-constants"

type UploadState = "idle" | "uploading" | "success" | "error"

interface UploadContractDialogProps {
  onContractUploaded: () => void
}

export function UploadContractDialog({ onContractUploaded }: UploadContractDialogProps) {
  const [open, setOpen] = useState(false)
  const [contractFile, setContractFile] = useState<File | null>(null)
  const [vendorName, setVendorName] = useState("")
  const [contractType, setContractType] = useState("")
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf") {
        setContractFile(droppedFile)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setContractFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setContractFile(null)
  }

  const handleUpload = async () => {
    if (!contractFile || !vendorName || !contractType) return

    try {
      setUploadState("uploading")
      setProgress(50) 
      setErrorMessage("")

      // Extract both structured contract data and text items
      const { extractedData, items: contractItems } = await extractContractData(contractFile)
      
      const contractRecord = {
        'Contract Name': vendorName,
        'Contract Type': contractType,
        'Contract Status': 'Active', // Set a default status
        // Store text items for proof highlights
        'Validation Config': JSON.stringify(contractItems),
        // Store full extracted contract data for validation logic
        'Extracted Data': JSON.stringify(extractedData),
      };

      await createRecord(CONTRACTS_TABLE_ID, contractRecord)
      
      setProgress(100)
      setUploadState("success")
      onContractUploaded()

      setTimeout(() => {
        setOpen(false)
        resetForm()
      }, 1500)
    } catch (error: any) {
      console.error("Contract upload failed:", error)
      setErrorMessage(error.message || "An unexpected error occurred.")
      setUploadState("error")
    }
  }

  const resetForm = () => {
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
          Upload Contract
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload New Contract</DialogTitle>
          <DialogDescription>
            Upload a contract PDF to add it to the system.
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
                <Select onValueChange={setContractType} value={contractType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contract-file">Contract PDF *</Label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                  dragActive ? "border-primary bg-primary/5" : "border-border"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
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
                      onChange={handleFileChange}
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
              <p className="font-medium">Uploading contract...</p>
              <p className="text-sm text-muted-foreground">This may take a moment.</p>
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
              <p className="font-medium">Upload Complete!</p>
              <p className="text-sm text-muted-foreground">The contract has been added.</p>
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
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!contractFile || !vendorName || !contractType}
            >
              Upload & Save
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
