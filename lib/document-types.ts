export type DocumentStatus = {
  id: string;
  fields: {
    'File Name': string;
    'Document Type': 'Contract' | 'Invoice' | 'Other';
    'Upload Date': string;
    'Status': 'Processing' | 'Completed' | 'Failed';
    'Status Details'?: string;
    'Progress'?: number; // A value between 0 and 100
  };
};
