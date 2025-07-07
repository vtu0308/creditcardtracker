'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { netWorthStorage, Liability } from '@/lib/netWorthStorage';
import { FinancialList } from './FinancialList';
import { LiabilityListItem } from './LiabilityListItem';
import { EmptyState } from './EmptyState';

interface LiabilitiesListProps {
  onEdit: (liability: Liability) => void;
}

export default function LiabilitiesList({ onEdit }: LiabilitiesListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: liabilities = [], isLoading } = useQuery({
    queryKey: ['liabilities'],
    queryFn: () => netWorthStorage.getLiabilities(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => netWorthStorage.deleteLiability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      queryClient.invalidateQueries({ queryKey: ['netWorth'] });
      toast({ title: 'Liability deleted successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting liability',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this liability?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Loading liabilities...</div>;
  }

  return (
    <FinancialList
      itemCount={liabilities.length}
      emptyState={
        <EmptyState
          title="No Liabilities Added"
          message="Add a liability to get a clearer picture of your net worth."
        />
      }
    >
      {liabilities.map((liability) => (
        <LiabilityListItem
          key={liability.id}
          liability={liability}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
      ))}
    </FinancialList>
  );
}
