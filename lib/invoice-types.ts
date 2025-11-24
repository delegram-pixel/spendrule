export type Invoice = {
  id: string;
  fields: {
    'Invoice ID': string;
    'Invoice Number 2': string;
    'Invoice Date': string;
    'Payment Date'?: string;
    'Gross Amount': number;
    'Currency': string;
    'Current Status': string;
    'vendor_party_id': { id: string; title: string };
    'customer_party_id': { id: string; title: string };
  };
};