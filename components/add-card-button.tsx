import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import React from "react";

interface AddCardButtonProps {
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function AddCardButton({ onClick, className = "", children }: AddCardButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={`bg-[#C58B9F] text-white font-medium rounded-full px-6 py-2 text-sm shadow-none hover:bg-[#b2778a] transition-colors ${className}`.trim()}
    >
      {children || "Add Card"}
    </Button>
  );
}
