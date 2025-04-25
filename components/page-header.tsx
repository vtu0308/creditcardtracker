// No changes needed here. It uses standard text elements and text-muted-foreground,
// which will automatically adopt the new theme's colors defined in globals.css.
interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    // Adding mb-6 or mb-8 for spacing below the header, common in dashboards
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {/* These text classes will inherit colors correctly from the new theme */}
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {/* Children (e.g., buttons) will align to the right on larger screens */}
      <div className="flex items-center gap-2">
          {children}
      </div>
    </div>
  )
}