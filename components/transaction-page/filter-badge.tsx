import { X } from "lucide-react"

interface FilterBadgeProps {
  label: string
  value: string
  onRemove: () => void
}

export function FilterBadge({ label, value, onRemove }: FilterBadgeProps) {
  return (
    <div
      className="
        inline-flex
        items-center
        gap-1
        rounded-full
        bg-muted/50
        px-3
        py-1
        text-xs
        font-medium
      "
    >
      {/* label in a softer, muted tone */}
      <span className="text-muted-foreground">{label}:</span>

      {/* value in your accent/pink color */}
      <span className="text-primary">{value}</span>

      {/* little × button */}
      <button
        onClick={onRemove}
        className="
          ml-2
          flex
          h-5
          w-5
          items-center
          justify-center
          rounded-full
          hover:bg-primary/20
          transition-colors
        "
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3 text-muted-foreground hover:text-primary" />
      </button>
    </div>
  )
}
