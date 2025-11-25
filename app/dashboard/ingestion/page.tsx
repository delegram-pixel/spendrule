"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle2, Loader } from "lucide-react"
import { fetchRecords } from "@/lib/teable"
import { DOCUMENT_METADATA_TABLE_ID } from "@/lib/teable-constants"
import { DocumentStatus } from "@/lib/document-types"

export default function IngestionPage() {
  const [documents, setDocuments] = useState<DocumentStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocumentStatuses = async () => {
    setLoading(true);
    try {
      const records = await fetchRecords(DOCUMENT_METADATA_TABLE_ID) as any[];
      const typedDocuments: DocumentStatus[] = records.map(record => ({
        id: record.id,
        fields: {
          'File Name': record.fields['File Name'] || 'N/A',
          'Document Type': record.fields['Document Type'] || 'Other',
          'Upload Date': record.fields['Upload Date'],
          'Status': record.fields['Status'],
          'Status Details': record.fields['Status Details'],
          'Progress': record.fields['Progress'] || 0,
        }
      })).sort((a, b) => new Date(b.fields['Upload Date']).getTime() - new Date(a.fields['Upload Date']).getTime()); // Sort by most recent
      setDocuments(typedDocuments);
    } catch (error) {
      console.error("Failed to fetch document statuses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentStatuses();
    const interval = setInterval(fetchDocumentStatuses, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: DocumentStatus['fields']['Status']) => {
    switch (status) {
      case 'Processing':
        return <Loader className="h-4 w-4 animate-spin text-blue-500" />;
      case 'Completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'Failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: DocumentStatus['fields']['Status']) => {
    switch (status) {
      case 'Processing':
        return 'secondary';
      case 'Completed':
        return 'default';
      case 'Failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Ingestion Status
        </h2>
        <p className="text-muted-foreground">
          Real-time status of all uploaded documents. The list automatically refreshes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Processing Queue</CardTitle>
          <CardDescription>
            Documents are processed in the order they are received.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[250px]">Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Loading initial data...
                  </TableCell>
                </TableRow>
              ) : documents.length > 0 ? (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.fields['File Name']}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.fields['Document Type']}</Badge>
                    </TableCell>
                    <TableCell>{new Date(doc.fields['Upload Date']).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(doc.fields.Status)}
                        <Badge variant={getStatusVariant(doc.fields.Status)}>
                          {doc.fields.Status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {doc.fields.Status === 'Processing' && (
                        <Progress value={doc.fields.Progress} />
                      )}
                      {doc.fields.Status === 'Failed' && (
                        <p className="text-xs text-red-500">{doc.fields['Status Details']}</p>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                 <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No documents are currently being processed.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
