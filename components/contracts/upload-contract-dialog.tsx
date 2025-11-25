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
import { createRecord, createBatchRecords } from "@/lib/teable"
import {
  CONTRACTS_TABLE_ID,
  BILLABLE_ITEMS_TABLE_ID,
  CONTRACT_PARTIES_TABLE_ID,
} from "@/lib/teable-constants"
import {
  mapContractDataToTeableFields,
  mapBillableItemToTeableFields,
  mapContractPartyToTeableFields,
} from "@/lib/teable-fields"

type UploadState = "idle" | "uploading" | "success" | "error"

interface UploadContractDialogProps {
  onContractUploaded: () => void
}

export function UploadContractDialog({ onContractUploaded }: UploadContractDialogProps) {
  const [open, setOpen] = useState(false)
  const [contractFile, setContractFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [contractName, setContractName] = useState("")

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
    if (!contractFile) return
    if (!contractName.trim()) {
      setErrorMessage("Contract name is required.")
      return
    }

    try {
      setUploadState("uploading")
      setProgress(20)
      setErrorMessage("")

      // 1. Upload file to the server for extraction
      const formData = new FormData();
      formData.append('file', contractFile);
      formData.append('documentType', 'contract');

      setProgress(50);

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
      setProgress(70);

      // 2. Map extracted data to Teable fields
      const baseContractRecord = mapContractDataToTeableFields(extractedData);
      const finalContractRecord = {
        ...baseContractRecord,
        'Contract Name': contractName.trim() ? contractName : baseContractRecord['Contract Name'],
      };

      // 3. Create the main contract record
      const createdContract = await createRecord(CONTRACTS_TABLE_ID, finalContractRecord);
      const contractId = createdContract.id;
      setProgress(80);

      // 4. Create Billable Items
      if (extractedData.billableItems && extractedData.billableItems.length > 0) {
        const billableItemRecords = extractedData.billableItems.map((item: any) => ({
          ...mapBillableItemToTeableFields(item),
          'contract_id': [ { id: contractId } ]
        }));
        await createBatchRecords(BILLABLE_ITEMS_TABLE_ID, billableItemRecords);
      }
      setProgress(90);

      // 5. Create Contract Parties
      if (extractedData.contractParties && extractedData.contractParties.length > 0) {
        const contractPartyRecords = extractedData.contractParties.map((party: any) => ({
          ...mapContractPartyToTeableFields(party),
          'contract_id': [ { id: contractId } ]
        }));
        await createBatchRecords(CONTRACT_PARTIES_TABLE_ID, contractPartyRecords);
      }

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
    setUploadState("idle")
    setProgress(0)
    setContractName("")
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload New Contract</DialogTitle>
          <DialogDescription>
            Upload a contract PDF. We'll extract key terms, billable items, and parties.
          </DialogDescription>
        </DialogHeader>

        {uploadState === "idle" && (
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="contract-name">Contract Name *</Label>
              <Input
                id="contract-name"
                placeholder="e.g., Master Services Agreement with Acme Co."
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contract-file">Contract PDF *</Label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${dragActive ? "border-primary" : "border-border"}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
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
          <div className="grid gap-4 py-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <div className="space-y-2 text-center">
              <p className="font-medium">Processing contract...</p>
              <p className="text-sm text-muted-foreground">Extracting clauses, billable items, and parties</p>
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
              <p className="text-sm text-muted-foreground">The contract and related records have been saved.</p>
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
            <Button onClick={handleUpload} disabled={!contractFile || !contractName.trim()}>
              Upload & Save
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}