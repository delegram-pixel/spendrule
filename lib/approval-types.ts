export type ApprovalRequest = {
  id: string;
  fields: {
    'Request ID': string;
    'Invoice ID': string;
    'Vendor Name': string;
    'Request Date': string;
    'Status': 'Pending' | 'Approved' | 'Rejected';
    'Amount': number;
    'Exception Type': string;
    // Optional: Link to the full invoice record
    'Invoice Record'?: { id: string; title: string }[];
    // Optional: Link to the specific exception
    'Exception Record'?: { id: string; title: string }[];
  };
};
