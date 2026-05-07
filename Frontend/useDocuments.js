import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import socket from '../utils/socket';

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/documents');
      if (data.success) setDocuments(data.data);
    } catch (err) {
      console.error('Failed to fetch documents:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Listen for new uploads via socket
  useEffect(() => {
    const handleComplete = ({ files }) => {
      setDocuments((prev) => {
        const newIds = new Set(files.map((f) => f._id));
        const filtered = prev.filter((d) => !newIds.has(d._id));
        return [...files, ...filtered];
      });
    };

    socket.on('upload:complete', handleComplete);
    socket.on('upload:bulk-complete', handleComplete);
    return () => {
      socket.off('upload:complete', handleComplete);
      socket.off('upload:bulk-complete', handleComplete);
    };
  }, []);

  const deleteDocument = useCallback(async (id) => {
    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
      return true;
    } catch (err) {
      throw err;
    }
  }, []);

  return { documents, loading, fetchDocuments, deleteDocument };
}
