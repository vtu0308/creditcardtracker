import { cn } from "@/lib/utils"

export type TimeFilterPeriod = "week" | "month" | "year" | "all"

interface TimeFilterProps {
  selected: TimeFilterPeriod
  onChange: (period: TimeFilterPeriod) => void
  className?: string
}

export function TimeFilter({ selected, onChange, className }: TimeFilterProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <button
        onClick={() => onChange("week")}
        className={cn(
          "px-2.5 py-0.5 text-xs transition-colors",
          selected === "week"
            ? "bg-[#FDF0F4] text-[#CE839C]"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Week
      </button>
      <button
        onClick={() => onChange("month")}
        className={cn(
          "px-2.5 py-0.5 text-xs transition-colors",
          selected === "month"
            ? "bg-[#FDF0F4] text-[#CE839C]"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Month
      </button>
      <button
        onClick={() => onChange("year")}
        className={cn(
          "px-2.5 py-0.5 text-xs transition-colors",
          selected === "year"
            ? "bg-[#FDF0F4] text-[#CE839C]"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Year
      </button>
      <button
        onClick={() => onChange("all")}
        className={cn(
          "px-2.5 py-0.5 text-xs transition-colors",
          selected === "all"
            ? "bg-[#FDF0F4] text-[#CE839C]"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        All Time
      </button>
    </div>
  )
}
