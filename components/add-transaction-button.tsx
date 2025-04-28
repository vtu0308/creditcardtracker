import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import React from "react";

interface AddTransactionButtonProps {
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function AddTransactionButton({ onClick, className = "", children }: AddTransactionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={`bg-[#C58B9F] text-white font-medium rounded-full px-6 py-2 text-sm shadow-none hover:bg-[#b2778a] transition-colors ${className}`.trim()}
    >
      <PlusCircle className="w-4 h-4 mr-2 -ml-1" />
      {children || "Add Transaction"}
    </Button>
  );
}
