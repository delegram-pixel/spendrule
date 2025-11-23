'use client';

import { useState, useEffect } from 'react';
import { useTeableTable } from '@/hooks/use-teable-table';
import { INVOICES_TABLE_ID } from '@/lib/teable-constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

// Define the structure of an Invoice's fields
interface InvoiceFields {
  invoiceNumber?: string;
  amount?: number;
  // Add other invoice fields here
}

export function InvoiceList() {
  const { data: invoices, loading, error, fetchData, editRecord } = useTeableTable<InvoiceFields>(INVOICES_TABLE_ID);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [newAmount, setNewAmount] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateAmount = async (recordId: string) => {
    if (!newAmount || isNaN(parseFloat(newAmount))) {
      // Basic validation
      return;
    }
    try {
      await editRecord(recordId, { amount: parseFloat(newAmount) });
      setEditingInvoiceId(null);
      setNewAmount('');
    } catch (err) {
      // Error is already logged by the hook, you could add UI feedback here
    }
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invoices.length === 0 && !loading ? (
            <p>No invoices found.</p>
          ) : (
            invoices.map((invoice) => (
              <div key={invoice.id} className="border p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold">{invoice.fields.invoiceNumber || 'No Invoice Number'}</p>
                  <p>Amount: ${invoice.fields.amount?.toLocaleString() ?? 'N/A'}</p>
                </div>
                {editingInvoiceId === invoice.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="New amount"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="w-32"
                    />
                    <Button onClick={() => handleUpdateAmount(invoice.id)}>Save</Button>
                    <Button variant="outline" onClick={() => setEditingInvoiceId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => {
                    setEditingInvoiceId(invoice.id);
                    setNewAmount(invoice.fields.amount?.toString() || '');
                  }}>
                    Edit Amount
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
