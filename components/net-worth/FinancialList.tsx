import { Card, CardContent } from '@/components/ui/card';

interface FinancialListProps {
  children: React.ReactNode;
  itemCount: number;
  emptyState: React.ReactNode;
}

export function FinancialList({ children, itemCount, emptyState }: FinancialListProps) {
  return (
    <Card className="bg-[#FBF6F7] border-none rounded-t-none">
      <CardContent className="p-4 space-y-4">
        {itemCount > 0 ? <div className="space-y-2">{children}</div> : emptyState}
      </CardContent>
    </Card>
  );
}