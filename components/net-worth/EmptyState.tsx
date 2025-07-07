import { PiggyBank } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto h-12 w-12 flex items-center justify-center bg-[#F3E2E7] rounded-full">
        <PiggyBank className="h-6 w-6 text-[#CE839C]" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-800">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
    </div>
  );
}