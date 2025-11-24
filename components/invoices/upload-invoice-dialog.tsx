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
import { createRecord, fetchRecords } from "@/lib/teable"
import { INVOICES_TABLE_ID, PARTIES_TABLE_ID } from "@/lib/teable-constants"

type UploadState = "idle" | "uploading" | "success" | "error"

interface UploadInvoiceDialogProps {
  onInvoiceUploaded: () => void
}

interface Party {
  id: string;
  fields: {
    legal_name: string;
    trading_name?: string;
    party_type: string;
  };
}

export function UploadInvoiceDialog({ onInvoiceUploaded }: UploadInvoiceDialogProps) {
  const [open, setOpen] = useState(false)
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)
  const [selectedVendorId, setSelectedVendorId] = useState<string>("")
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const [parties, setParties] = useState<Party[]>([])
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [invoiceNumber, setInvoiceNumber] = useState<string>("")
  const [invoiceDate, setInvoiceDate] = useState<string>("")
  const [grossAmount, setGrossAmount] = useState<string>("")
  const [currency, setCurrency] = useState<string>("USD")

  useEffect(() => {
    const loadParties = async () => {
      if (open) {
        try {
          const fetchedParties = await fetchRecords(PARTIES_TABLE_ID);
          const validParties = (fetchedParties as any[]).map(p => ({
            id: p.id,
            fields: {
              legal_name: p.fields.legal_name || "Unknown",
              trading_name: p.fields.trading_name,
              party_type: p.fields.party_type || "Other"
            }
          }))
          setParties(validParties as Party[]);
        } catch (error) {
          console.error("Failed to fetch parties:", error);
          setErrorMessage("Failed to load vendors and customers.");
        }
      }
    };
    loadParties();
  }, [open])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInvoiceFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setInvoiceFile(null)
  }

  const handleUpload = async () => {
    if (!invoiceFile || !selectedVendorId || !selectedCustomerId || !invoiceNumber || !invoiceDate || !grossAmount || !currency) {
      setErrorMessage("All required fields must be filled.")
      return
    }

    try {
      setUploadState("uploading")
      setErrorMessage("")

      const selectedVendor = parties.find(p => p.id === selectedVendorId);
      const selectedCustomer = parties.find(p => p.id === selectedCustomerId);

      if (!selectedVendor || !selectedCustomer) {
        setErrorMessage("Selected vendor or customer not found.");
        setUploadState("error");
        return;
      }
      
      const invoiceRecord = {
        'Invoice Number 2': invoiceNumber,
        'Invoice Date': invoiceDate,
        'Gross Amount': parseFloat(grossAmount),
        'Currency': currency,
        'vendor_party_id': {
          id: selectedVendor.id,
          title: selectedVendor.fields.legal_name || selectedVendor.fields.trading_name || "",
        },
        'customer_party_id': {
          id: selectedCustomer.id,
          title: selectedCustomer.fields.legal_name || selectedCustomer.fields.trading_name || "",
        },
        'Current Status': "Pending",
      };

      console.log("Creating invoice with data:", invoiceRecord)
      await createRecord(INVOICES_TABLE_ID, invoiceRecord)
      
      setUploadState("success")
      onInvoiceUploaded()

      setTimeout(() => {
        setOpen(false)
        resetForm()
      }, 1500)
    } catch (error: any)
     {
      console.error("Invoice upload failed:", error)
      setErrorMessage(error.message || "An unexpected error occurred.")
      setUploadState("error")
    }
  }

  const resetForm = () => {
    setInvoiceFile(null)
    setSelectedVendorId("")
    setSelectedCustomerId("")
    setInvoiceNumber("")
    setInvoiceDate("")
    setGrossAmount("")
    setCurrency("USD")
    setUploadState("idle")
    setErrorMessage("")
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="invoice-number">Invoice Number *</Label>
                                <Input
                                    id="invoice-number"
                                    placeholder="e.g., 12345"
                                    value={invoiceNumber}
                                    onChange={(e) => setInvoiceNumber(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="invoice-date">Invoice Date *</Label>
                                <Input
                                    id="invoice-date"
                                    type="date"
                                    value={invoiceDate}
                                    onChange={(e) => setInvoiceDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="vendor">Vendor *</Label>
                                <Select onValueChange={setSelectedVendorId} value={selectedVendorId} required>
                                    <SelectTrigger id="vendor">
                                        <SelectValue placeholder="Select a vendor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {parties.filter(p => p.fields.party_type === "Vendor").map((party) => (
                                            <SelectItem key={party.id} value={party.id}>
                                                {party.fields.legal_name || party.fields.trading_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="customer">Customer *</Label>
                                <Select onValueChange={setSelectedCustomerId} value={selectedCustomerId} required>
                                    <SelectTrigger id="customer">
                                        <SelectValue placeholder="Select a customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {parties.filter(p => p.fields.party_type === "Customer").map((party) => (
                                            <SelectItem key={party.id} value={party.id}>
                                                {party.fields.legal_name || party.fields.trading_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="gross-amount">Gross Amount *</Label>
                                <Input
                                    id="gross-amount"
                                    type="number"
                                    placeholder="e.g., 123.45"
                                    value={grossAmount}
                                    onChange={(e) => setGrossAmount(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="currency">Currency *</Label>
                                <Input
                                    id="currency"
                                    placeholder="e.g., USD"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    required
                                />
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
                          disabled={!invoiceFile || !selectedVendorId || !selectedCustomerId || !invoiceNumber || !invoiceDate || !grossAmount}
                        >
                          Upload & Save
                        </Button>
                      </DialogFooter>
                    )}
                  </DialogContent>
                </Dialog>
              )
            }