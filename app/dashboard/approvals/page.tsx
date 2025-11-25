"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { fetchRecords, updateRecord } from "@/lib/teable"
import { INVOICE_APPROVAL_REQUESTS_TABLE_ID } from "@/lib/teable-constants"
import { ApprovalRequest } from "@/lib/approval-types"

export default function ApprovalsPage() {
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovalRequests = async () => {
    setLoading(true);
    try {
      const records = await fetchRecords(INVOICE_APPROVAL_REQUESTS_TABLE_ID) as any[];
      const typedRequests: ApprovalRequest[] = records.map(record => ({
        id: record.id,
        fields: {
          'Request ID': record.fields['Request ID'],
          'Invoice ID': record.fields['Invoice ID']?.[0]?.title || 'N/A',
          'Vendor Name': record.fields['Vendor Name']?.[0]?.title || 'N/A',
          'Request Date': record.fields['Request Date'],
          'Status': record.fields['Status'],
          'Amount': record.fields['Amount'],
          'Exception Type': record.fields['Exception Type'],
        }
      }));
      setApprovalRequests(typedRequests);
    } catch (error) {
      console.error("Failed to fetch approval requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalRequests();
  }, []);

  const handleStatusChange = async (requestId: string, status: 'Approved' | 'Rejected') => {
    // Optimistic UI update
    setApprovalRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === requestId ? { ...req, fields: { ...req.fields, Status: status } } : req
      )
    );

    try {
      await updateRecord(INVOICE_APPROVAL_REQUESTS_TABLE_ID, requestId, { fields: { Status: status } });
    } catch (error) {
      console.error(`Failed to ${status.toLowerCase()} request:`, error);
      // Revert UI on failure
      fetchApprovalRequests();
    }
  };

  const handleApprove = (requestId: string) => {
    handleStatusChange(requestId, "Approved");
  };

  const handleReject = (requestId: string) => {
    handleStatusChange(requestId, "Rejected");
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Approved":
        return "default";
      case "Pending":
        return "secondary";
      case "Rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Approval Queue
          </h2>
          <p className="text-muted-foreground">
            Review and act on validation exceptions that require your approval.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {approvalRequests.filter(r => r.fields.Status === 'Pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting your review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvalRequests.filter(r => {
                const isApproved = r.fields.Status === 'Approved';
                // This is a simplified check. A real implementation would check a "last modified" date.
                // For now, we count all approved items as "today" for demonstration.
                return isApproved;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Approvals recorded
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
             {approvalRequests.filter(r => {
                const isRejected = r.fields.Status === 'Rejected';
                return isRejected;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Rejections recorded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Approvals Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Approval Requests</CardTitle>
          <CardDescription>
            Review each request and take action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Exception Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                approvalRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.fields['Invoice ID']}</TableCell>
                    <TableCell>{request.fields['Vendor Name']}</TableCell>
                    <TableCell>{request.fields['Exception Type'].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(request.fields.Amount)}
                    </TableCell>
                    <TableCell>{new Date(request.fields['Request Date']).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(request.fields.Status)}>
                        {request.fields.Status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {request.fields.Status === 'Pending' && (
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleApprove(request.id)}>
                            Approve
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleReject(request.id)}>
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
