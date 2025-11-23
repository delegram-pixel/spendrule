"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
const UploadContractDialog = dynamic(() => import("@/components/contracts/upload-contract-dialog").then(m => m.UploadContractDialog), { ssr: false })
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ContractStatusBadge } from "@/components/contracts/contract-status-badge"
import { Search, Filter, FileText } from "lucide-react"

import { fetchRecords } from "@/lib/teable"
import { CONTRACTS_TABLE_ID } from "@/lib/teable-constants"

// ... (imports and component definition remain the same)

interface Contract {
  id: string;
  // All fields from Teable are in a 'fields' object
  fields: {
    contractId: string;
    vendorName: string;
    effectiveDate: string;
    expirationDate: string;
    // ... add any other fields you expect from your Teable 'contracts' table
  }
}

async function getContracts(): Promise<Contract[]> {
  try {
    const records = await fetchRecords(CONTRACTS_TABLE_ID);
    // We need to cast the response since fetchRecords returns a generic type
    return records as Contract[];
  } catch (error) {
    console.error("Failed to fetch contracts:", error);
    return []; // Return an empty array on error
  }
}

// ... (rest of the component, but needs to be updated to use contract.fields.fieldName)


export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])

  const fetchContracts = async () => {
    const fetchedContracts = await getContracts()
    setContracts(fetchedContracts)
  }

  useEffect(() => {
    fetchContracts()
  }, [])

  const handleContractUploaded = () => {
    fetchContracts();
  };

  // Determine contract status
  const getStatus = (
    endDate: string,
  ): "Active" | "Expired" | "Pending" => {
    const now = new Date()
    const contractEndDate = new Date(endDate)
    if (contractEndDate < now) return "Expired"
    // Assuming a contract is pending if it has not started. This logic might need adjustment.
    // For now, let's just default to Active if not expired.
    return "Active"
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Contract Intelligence
          </h2>
          <p className="text-muted-foreground">
            Manage and analyze your service contracts with AI-powered insights.
          </p>
        </div>
        <UploadContractDialog onContractUploaded={handleContractUploaded} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Contracts
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.length}</div>
            <p className="text-xs text-muted-foreground">
              {contracts.length > 0 ? "+4 new this month" : "No new contracts"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Contracts
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {
                contracts.filter(
                  (c) => getStatus(c.fields.expirationDate) === "Active",
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {contracts.length > 0
                ? `${Math.round(
                    (contracts.filter(
                      (c) => getStatus(c.fields.expirationDate) === "Active",
                    ).length /
                      contracts.length) *
                      100,
                  )}% of total`
                : "No active contracts"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <FileText className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {
                contracts.filter((c) => {
                  const now = new Date()
                  const endDate = new Date(c.fields.expirationDate)
                  const diff = endDate.getTime() - now.getTime()
                  const days = diff / (1000 * 3600 * 24)
                  return days > 0 && days <= 90
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Within next 90 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Contracts</CardTitle>
              <CardDescription>
                View and manage all your vendor contracts.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search contracts..."
                  className="pl-8 w-[250px]"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract ID</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">
                    {contract.fields.contractId}
                  </TableCell>
                  <TableCell>{contract.fields.vendorName}</TableCell>
                  <TableCell>
                    <ContractStatusBadge
                      status={getStatus(contract.fields.expirationDate)}
                    />
                  </TableCell>
                  <TableCell>{contract.fields.expirationDate}</TableCell>
                  <TableCell className="text-right">
                    {/* The details dialog will need to be adapted to handle the new data structure */}
                    {/* <Button variant="ghost" size="sm" onClick={() => handleViewDetails(contract)}>
                      View Details
                    </Button> */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
