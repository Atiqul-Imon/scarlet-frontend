import { useEffect, useRef, useCallback } from 'react';

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
  interval?: number; // in milliseconds
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export function useAutoSave({
  data,
  onSave,
  interval = 30000, // 30 seconds
  enabled = true,
  onError
}: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<any>();
  const isSavingRef = useRef(false);

  const save = useCallback(async () => {
    if (isSavingRef.current || !enabled) return;
    
    try {
      isSavingRef.current = true;
      await onSave(data);
      lastSavedRef.current = data;
    } catch (error) {
      console.error('Auto-save failed:', error);
      onError?.(error as Error);
    } finally {
      isSavingRef.current = false;
    }
  }, [data, onSave, enabled, onError]);

  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only auto-save if data has changed
    if (JSON.stringify(data) !== JSON.stringify(lastSavedRef.current)) {
      timeoutRef.current = setTimeout(save, interval);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, save, interval, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    save,
    isSaving: isSavingRef.current
  };
}
