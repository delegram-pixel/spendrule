export type InvoiceLineItem = {
  id: string;
  fields: {
    Description: string;
    Quantity: number;
    "Unit Price": number;
    Total: number;
    "pageNumber"?: number; // Consistent with pdf-processor.ts
  };
};

export type Invoice = {
  id: string;
  fields: {
    'Invoice ID': string;
    'Invoice Name'?: string;
    'Invoice Number 2': string;
    'Invoice Date': string;
    'Payment Date'?: string;
    'Gross Amount': number;
    'Currency': string;
    'Current Status': string;
    'Vendor Address'?: string;
    'Customer Name'?: string;
    'Customer Address'?: string;
    'Subtotal'?: number;
    'Tax Amount'?: number;
    'Payment Terms'?: string;
    'vendor_party_id': { id: string; title: string };
    'customer_party_id': { id: string; title: string };
    LineItems?: InvoiceLineItem[]; // Added field for invoice line items
  };
};