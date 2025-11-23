import axios from 'axios';

const API_TOKEN = process.env.NEXT_PUBLIC_TEABLE_API_TOKEN!;

if (!API_TOKEN) throw new Error('NEXT_PUBLIC_TEABLE_API_TOKEN is not set');

export const teableClient = axios.create({
  baseURL: 'https://app.teable.io/api',
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
  },
  validateStatus: () => true,
  timeout: 20000,
});

export const fetchRecords = async (
  tableId: string,
  limit = 1000
): Promise<Array<{ id: string; fields: Record<string, any> }>> => {
  try {
    const response = await teableClient.get(`/table/${tableId}/record`, {
      params: { take: limit }
    });
    
    if (response.status >= 400) {
      throw new Error(`Teable error (status ${response.status}): ${JSON.stringify(response.data)}`);
    }
    
    return (response.data?.records || []) as Array<{ id: string; fields: Record<string, any> }>;
  } catch (error: any) {
    console.error('❌ Fetch error:', error.response?.data || error.message);
    throw error;
  }
};

export const createRecord = async (tableId: string, fields: Record<string, unknown>) => {
  const response = await teableClient.post(`/table/${tableId}/record`, {
    records: [{ fields }],
  });

  if (response.status >= 400 || !response.data?.records?.[0]) {
    console.error('Error creating record in Teable:', response.data);
    throw new Error(`Teable error (status ${response.status}): Failed to create a record.`);
  }

  // Return the full record object of the newly created record
  return response.data.records[0];
};

/**
 * Creates multiple records in a Teable table in a single batch request.
 * @param tableId The ID of the table to create records in.
 * @param records An array of objects, where each object represents the fields for a new record.
 * @returns The response data from the Teable API.
 */
export const createExceptionRecords = async (tableId: string, records: Record<string, unknown>[]) => {
  if (!records || records.length === 0) {
    return; // Don't send a request if there's nothing to create
  }

  const payload = {
    records: records.map(record => ({ fields: record })),
  };

  const response = await teableClient.post(`/table/${tableId}/record`, payload);

  if (response.status >= 400) {
    console.error('Error creating batch records in Teable:', response.data);
    throw new Error(`Teable error (status ${response.status}): Failed to create exception records.`);
  }

  return response.data;
};

export const updateRecord = async (tableId: string, recordId: string, fields: any) => {
  try {
    const response = await teableClient.patch(`/table/${tableId}/record/${recordId}`, {
      record: { fields }
    });
    
    if (response.status >= 400) {
      throw new Error(`Teable error (status ${response.status}): ${JSON.stringify(response.data)}`);
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Update error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteRecord = async (tableId: string, recordId: string) => {
  try {
    const response = await teableClient.delete(`/table/${tableId}/record`, {
      params: { recordIds: [recordId] }
    });
    
    if (response.status >= 400) {
      throw new Error(`Teable error (status ${response.status}): ${JSON.stringify(response.data)}`);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('❌ Delete error:', error.response?.data || error.message);
    throw error;
  }
};