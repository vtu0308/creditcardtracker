import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseDeleteDialogOptions {
  onDelete: () => Promise<void>;
  onSuccess?: () => void;
  itemName?: string;
}

export function useDeleteDialog({ onDelete, onSuccess, itemName = 'item' }: UseDeleteDialogOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isMounted = useRef(true);
  const { toast } = useToast();

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    isMounted.current = false;
  }, []);

  const handleDelete = useCallback(async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    
    try {
      await onDelete();
      
      if (isMounted.current) {
        toast({
          title: "Deleted Successfully",
          description: `The ${itemName} has been deleted.`,
        });
        
        setIsOpen(false);
        onSuccess?.();
      }
    } catch (error) {
      if (isMounted.current) {
        toast({
          variant: "destructive",
          title: "Deletion Failed",
          description: error instanceof Error ? error.message : `Failed to delete ${itemName}.`,
        });
      }
    } finally {
      if (isMounted.current) {
        setIsDeleting(false);
      }
    }
  }, [onDelete, onSuccess, itemName, isDeleting, toast]);

  const openDialog = useCallback(() => {
    if (!isDeleting) {
      setIsOpen(true);
    }
  }, [isDeleting]);

  const closeDialog = useCallback(() => {
    if (!isDeleting) {
      setIsOpen(false);
    }
  }, [isDeleting]);

  return {
    isOpen,
    isDeleting,
    openDialog,
    closeDialog,
    handleDelete,
    cleanup,
  };
}
