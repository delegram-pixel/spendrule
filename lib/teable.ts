import axios from 'axios';

const API_TOKEN = process.env.NEXT_PUBLIC_TEABLE_API_TOKEN!;
console.log('Teable API Token loaded, first 10 chars:', API_TOKEN?.substring(0, 10));

const BASE_ID = process.env.NEXT_PUBLIC_TEABLE_BASE_ID!;

if (!API_TOKEN) throw new Error('NEXT_PUBLIC_TEABLE_API_TOKEN is not set');
if (!BASE_ID) throw new Error('NEXT_PUBLIC_TEABLE_BASE_ID is not set');

export const teableClient = axios.create({
  baseURL: 'https://app.teable.io',
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
  },
  validateStatus: () => true,
  timeout: 20000,
});

export const fetchRecords = async (
  tableId: string,
  limit = 1000,
  recordIds?: string[]
): Promise<Array<{ id: string; fields: Record<string, any> }>> => {
  try {
    const params: Record<string, any> = { take: limit };
    if (recordIds && recordIds.length > 0) {
      params['filter'] = JSON.stringify({
        filterSet: [{ fieldId: 'id', operator: 'isAnyOf', value: recordIds }]
      });
    }

    const response = await teableClient.get(`/api/table/${tableId}/record`, {
      params
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
  const url = `/api/table/${tableId}/record`;
  try {
    console.log('📤 Creating record with fields:', JSON.stringify(fields, null, 2));
    
    const response = await teableClient.post(url, {
      fieldKeyType: 'name',
      records: [{ fields }]  // ✅ Changed from "record" to "records" array
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', JSON.stringify(response.data, null, 2));

    if (response.status >= 400) {
      console.error(`Error creating record in Teable. URL: ${response.config.url}`, response.data); 
      throw new Error(`Teable error (status ${response.status}): ${JSON.stringify(response.data)}`);
    }

    // Return the first record from the array
    return response.data?.records?.[0] || response.data;
  } catch (error: any) { 
    console.error(`❌ Network or request error creating record. URL: ${error.config?.url || url}`);
    console.error('Error details:', error.response?.data || error.message);
    throw new Error(`Teable error (status ${error.response?.status || 'N/A'}): ${JSON.stringify(error.response?.data) || 'Network error'}`);
  }
};

export const createBatchRecords = async (tableId: string, records: Record<string, unknown>[]) => {
  if (!records || records.length === 0) {
    return;
  }

  const url = `/api/table/${tableId}/record`;
  try {
    console.log(`📤 Creating ${records.length} batch records`);
    console.log('First record sample:', JSON.stringify(records[0], null, 2));
    
    const response = await teableClient.post(url, {
      fieldKeyType: 'name',
      records: records.map(record => ({ fields: record })),
    });

    console.log('📥 Batch response status:', response.status);
    console.log('📥 Batch response data:', JSON.stringify(response.data, null, 2));

    if (response.status >= 400) {
      console.error(`Error creating batch records in Teable. URL: ${response.config.url}`, response.data);
      throw new Error(`Teable error (status ${response.status}): ${JSON.stringify(response.data)}`);
    }

    return response.data;
  } catch (error: any) { 
    console.error(`❌ Network or request error creating batch records. URL: ${error.config?.url || url}`);
    console.error('Error details:', error.response?.data || error.message);
    throw new Error(`Teable error (status ${error.response?.status || 'N/A'}): ${JSON.stringify(error.response?.data) || 'Network error'}`);
  }
};

export const updateRecord = async (tableId: string, recordId: string, fields: any) => {
  try {
    const response = await teableClient.patch(`/api/table/${tableId}/record/${recordId}`, {
      fieldKeyType: 'name',
      record: { fields }  // Update uses "record" (singular)
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
    const response = await teableClient.delete(`/api/table/${tableId}/record/${recordId}`);
    
    if (response.status >= 400) {
      throw new Error(`Teable error (status ${response.status}): ${JSON.stringify(response.data)}`);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('❌ Delete error:', error.response?.data || error.message);
    throw error;
  }
};