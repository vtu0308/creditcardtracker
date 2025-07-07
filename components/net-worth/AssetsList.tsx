'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { netWorthStorage, Asset } from '@/lib/netWorthStorage';
import { FinancialList } from './FinancialList';
import { AssetListItem } from './AssetListItem';
import { EmptyState } from './EmptyState';

interface AssetsListProps {
  onEdit: (asset: Asset) => void;
}

export default function AssetsList({ onEdit }: AssetsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => netWorthStorage.getAssets(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => netWorthStorage.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['netWorth'] });
      toast({ title: 'Asset deleted successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting asset',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Loading assets...</div>;
  }

  return (
    <FinancialList
      itemCount={assets.length}
      emptyState={
        <EmptyState
          title="No Assets Added"
          message="Start building your wealth by adding your first asset."
        />
      }
    >
      {assets.map((asset) => (
        <AssetListItem
          key={asset.id}
          asset={asset}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
      ))}
    </FinancialList>
  );
}