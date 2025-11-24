
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
import {
  CONTRACTS_TABLE_ID,
  BILLABLE_ITEMS_TABLE_ID,
  CONTRACT_PARTIES_TABLE_ID,
} from "@/lib/teable-constants"
import { ContractDetailsDialog } from "@/components/contracts/contract-details-dialog"

interface Contract {
  id: string;
  fields: {
    // Basic Information
    'Contract Name': string;
    'Contract ID': string;
    'Contract Number': string;
    'Contract Title': string;
    'Version': string;
    // Classification & Status
    'Contract Type': "Master Service Agreement" | "Statement of Work" | "Purchase Order" | "License Agreement" | "Other";
    'Contract Status': "Draft" | "Active" | "Pending" | "Expired" | "Terminated";
    'Relationship Type': "Parent" | "Child" | "Standalone";
    // Financial Fields
    'Total Contract Value': number;
    'Annual Value': number;
    'Currency': string;
    // Date Fields
    'Effective Date': string;
    'Expiration Date': string;
    'Created Date': string;
    'Updated Date': string;
    // Renewal & Terms
    'Auto Renewal Enabled': boolean;
    'Renewal Period': string;
    'Notice Period Days': number;
    // Hierarchy
    'Hierarchy Level': number;
    'Parent Contract ID': string | null;
    // Relationship Fields (Teable links are arrays of record IDs)
    'billable_items': string[];
    'contract_parties': string[];
    'document_extraction_data': string;
  }
}

// Add interfaces for fetched linked data
interface BillableItemRecord {
  id: string;
  fields: {
    'Item Description': string;
    'Unit Price': number;
    'Unit': string;
    'Quantity'?: number;
    'Conditions'?: string;
    'Page Number': number;
    'Confidence': number;
  };
}

interface ContractPartyRecord {
  id: string;
  fields: {
    'Name': string;
    'Role': "Vendor" | "Client" | "Other";
  };
}

async function getContracts(): Promise<Contract[]> {
  try {
    const records = await fetchRecords(CONTRACTS_TABLE_ID);
    return records as Contract[];
  } catch (error) {
    console.error("Failed to fetch contracts:", error);
    return []; // Return an empty array on error
  }
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [billableItemsData, setBillableItemsData] = useState<BillableItemRecord[] | null>(null)
  const [contractPartiesData, setContractPartiesData] = useState<ContractPartyRecord[] | null>(null)

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

  // Determine contract status - now directly use the AI-extracted status
  const getStatus = (
    contractStatus: Contract['fields']['Contract Status'],
    expirationDate: string,
  ): "Active" | "Expired" | "Pending" | "Draft" | "Terminated" => {
    if (contractStatus) return contractStatus;
    
    const now = new Date();
    const contractEndDate = new Date(expirationDate);
    if (contractEndDate < now) return "Expired";
    return "Active"; // Default to Active if no specific status or not expired
  }

  const handleViewDetails = async (contract: Contract) => {
    setSelectedContract(contract);
    setIsDetailsDialogOpen(true);

    // Fetch linked billable items
    if (contract.fields['billable_items'] && contract.fields['billable_items'].length > 0) {
      try {
        const items = await fetchRecords(BILLABLE_ITEMS_TABLE_ID, 1000, contract.fields['billable_items']); // Assuming fetchRecords can take an array of IDs
        setBillableItemsData(items as BillableItemRecord[]);
      } catch (error) {
        console.error("Failed to fetch billable items:", error);
        setBillableItemsData([]);
      }
    } else {
      setBillableItemsData([]);
    }

    // Fetch linked contract parties
    if (contract.fields['contract_parties'] && contract.fields['contract_parties'].length > 0) {
      try {
        const parties = await fetchRecords(CONTRACT_PARTIES_TABLE_ID, 1000, contract.fields['contract_parties']); // Assuming fetchRecords can take an array of IDs
        setContractPartiesData(parties as ContractPartyRecord[]);
      } catch (error) {
        console.error("Failed to fetch contract parties:", error);
        setContractPartiesData([]);
      }
    } else {
      setContractPartiesData([]);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between z-10">
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
                  (c) => getStatus(c.fields['Contract Status'], c.fields['Expiration Date']) === "Active",
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {contracts.length > 0
                ? `${Math.round(
                    (contracts.filter(
                      (c) => getStatus(c.fields['Contract Status'], c.fields['Expiration Date']) === "Active",
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
                  const endDate = new Date(c.fields['Expiration Date'])
                  const diff = endDate.getTime() - now.getTime()
                  const days = diff / (1000 * 3600 * 24)
                  return days > 0 && days <= (c.fields['Notice Period Days'] || 90) // Use notice period or default to 90
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Within next {contracts.length > 0 ? (contracts[0].fields['Notice Period Days'] || 90) : 90} days
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
                <TableHead>Contract Name</TableHead>
                <TableHead>Contract ID</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Expiration Date</TableHead>
                <TableHead>Renewal</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">
                    {contract.fields['Contract Name']}
                  </TableCell>
                  <TableCell>{contract.fields['Contract ID']}</TableCell>
                  <TableCell>{contract.fields['contract_parties'] ? "See Details" : "N/A"}</TableCell>
                  <TableCell>{contract.fields['Contract Type']}</TableCell>
                  <TableCell>
                    <ContractStatusBadge
                      status={getStatus(
                        contract.fields['Contract Status'],
                        contract.fields['Expiration Date'],
                      )}
                    />
                  </TableCell>
                  <TableCell>${contract.fields['Total Contract Value']?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell>{new Date(contract.fields['Effective Date']).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(contract.fields['Expiration Date']).toLocaleDateString()}</TableCell>
                  <TableCell>{contract.fields['Auto Renewal Enabled'] ? contract.fields['Renewal Period'] : "No Auto-Renewal"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(contract)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedContract && (
        <ContractDetailsDialog
          contract={selectedContract}
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          billableItems={billableItemsData || []}
          contractParties={contractPartiesData || []}
        />
      )}
    </div>
  )
}
