'use client';

import { useState, useCallback, useMemo } from 'react';
import { fetchRecords, createRecord, updateRecord, deleteRecord } from '@/lib/teable';

interface TeableRecord<T> {
  id: string;
  fields: T;
}

export function useTeableTable<T extends { [key: string]: any }>(tableId: string | null) {
  const [data, setData] = useState<TeableRecord<T>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!tableId) return;
    try {
      setLoading(true);
      setError(null);
      const records = await fetchRecords(tableId);
      setData(records as TeableRecord<T>[]);
    } catch (err) {
      console.error(`Failed to fetch records for table ${tableId}:`, err);
      setError('Failed to load data from the table.');
    } finally {
      setLoading(false);
    }
  }, [tableId]);

  const addRecord = useCallback(async (fields: T) => {
    if (!tableId) return;
    try {
      setLoading(true);
      setError(null);
      await createRecord(tableId, fields);
      await fetchData(); // Refresh data after creation
    } catch (err) {
      console.error(`Failed to create record for table ${tableId}:`, err);
      setError('Failed to create the new record.');
      throw err; // Re-throw error for component-level handling
    } finally {
      setLoading(false);
    }
  }, [tableId, fetchData]);

  const editRecord = useCallback(async (recordId: string, fields: Partial<T>) => {
    if (!tableId) return;
    
    // Optimistic update
    const previousData = data;
    setData(prev => prev.map(rec => rec.id === recordId ? { ...rec, fields: { ...rec.fields, ...fields } } : rec));
    
    try {
      await updateRecord(tableId, recordId, fields);
    } catch (err) {
      console.error(`Failed to update record ${recordId} for table ${tableId}:`, err);
      setError('Failed to update the record. Reverting changes.');
      setData(previousData); // Revert on error
      throw err;
    }
  }, [tableId, data]);

  const removeRecord = useCallback(async (recordId: string) => {
    if (!tableId) return;
    
    // Optimistic update
    const previousData = data;
    setData(prev => prev.filter(rec => rec.id !== recordId));
    
    try {
      await deleteRecord(tableId, recordId);
    } catch (err) {
      console.error(`Failed to delete record ${recordId} for table ${tableId}:`, err);
      setError('Failed to delete the record. Reverting changes.');
      setData(previousData); // Revert on error
      throw err;
    }
  }, [tableId, data]);

  // Memoize the return value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    data,
    loading,
    error,
    fetchData,
    addRecord,
    editRecord,
    removeRecord,
  }), [data, loading, error, fetchData, addRecord, editRecord, removeRecord]);

  return value;
}
