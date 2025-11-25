// app/api/extract/route.ts
import { NextResponse } from 'next/server';
import { extractInvoiceDataServer, extractContractDataServer } from '@/lib/server/document-processor';
import { createRecord } from '@/lib/teable';
import { DOCUMENT_METADATA_TABLE_ID } from '@/lib/teable-constants';

export async function POST(request: Request) {
  let fileName: string | null = null;
  let documentType: 'invoice' | 'contract' | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    documentType = formData.get('documentType') as 'invoice' | 'contract';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json({ error: 'No document type provided' }, { status: 400 });
    }

    fileName = file.name;
    const fileBuffer = await file.arrayBuffer();
    
    // Create an initial record in the metadata table to track processing
    const metadataRecord = await createRecord(DOCUMENT_METADATA_TABLE_ID, {
        'File Name': fileName,
        'Document Type': documentType === 'invoice' ? 'Invoice' : 'Contract',
        'Upload Date': new Date().toISOString(),
        'Status': 'Processing',
        'Progress': 10,
    });

    let extractedData;
    if (documentType === 'invoice') {
      const result = await extractInvoiceDataServer(fileBuffer);
      extractedData = result.extractedData;
      // TODO: Add record to invoices table
    } else {
      const result = await extractContractDataServer(fileBuffer);
      extractedData = result.extractedData;
      // TODO: Add record to contracts table
    }
    
    // Update metadata record to 'Completed'
    await createRecord(DOCUMENT_METADATA_TABLE_ID, {
        'File Name': fileName,
        'Document Type': documentType === 'invoice' ? 'Invoice' : 'Contract',
        'Upload Date': new Date().toISOString(),
        'Status': 'Completed',
        'Progress': 100,
    });

    return NextResponse.json({ data: extractedData });

  } catch (error) {
    console.error('[API/EXTRACT] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    // Update metadata record to 'Failed' using the fileName captured in the try block
    if (fileName) {
        await createRecord(DOCUMENT_METADATA_TABLE_ID, {
            'File Name': fileName,
            'Status': 'Failed',
            'Status Details': errorMessage,
        });
    }

    return NextResponse.json({ error: 'Failed to process document', details: errorMessage }, { status: 500 });
  }
}
