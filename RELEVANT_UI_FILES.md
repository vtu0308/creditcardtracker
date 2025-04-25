# Relevant UI Files for Modifying Text or Components

This document lists files in the project that are likely to contain UI text, headings, button labels, or other visible components. These files are important when updating or customizing the user interface.

**Explanation:** Identifying UI component and page files (such as .tsx files in `app/` and `components/`) that are likely to contain or control visible UI text or layout, as well as routing/layout files that may affect displayed text.

## Potentially Relevant Files

```
app/cards/layout.tsx
app/cards/page.tsx
app/client-layout.tsx
app/layout.tsx
app/login/page.tsx
app/page.tsx
app/settings/page.tsx
app/transactions/layout.tsx
app/transactions/loading.tsx
app/transactions/page.tsx
components/add-card-dialog.tsx
components/add-transaction-dialog.tsx
components/auth/protected-route.tsx
components/card-item.tsx
components/card-list.tsx
components/dashboard-analytics.tsx
components/dashboard-header.tsx
components/dashboard-metrics.tsx
components/edit-card-dialog.tsx
components/edit-transaction-dialog.tsx
components/error-boundary.tsx
components/main-nav.tsx
components/page-header.tsx
components/providers/auth-provider.tsx
components/react-query-provider.tsx
components/recent-transactions.tsx
components/spending-analytics.tsx
components/storage-migrator.tsx
components/theme-provider.tsx
components/transaction-item.tsx
components/ui/accordion.tsx
components/ui/alert-dialog.tsx
components/ui/alert.tsx
components/ui/aspect-ratio.tsx
components/ui/avatar.tsx
components/ui/badge.tsx
components/ui/breadcrumb.tsx
components/ui/button.tsx
components/ui/calendar.tsx
components/ui/card.tsx
components/ui/carousel.tsx
components/ui/chart.tsx
components/ui/checkbox.tsx
components/ui/collapsible.tsx
components/ui/command.tsx
components/ui/context-menu.tsx
components/ui/dialog.tsx
components/ui/drawer.tsx
components/ui/dropdown-menu.tsx
components/ui/form.tsx
components/ui/hover-card.tsx
components/ui/input-otp.tsx
components/ui/input.tsx
components/ui/label.tsx
components/ui/menubar.tsx
components/ui/navigation-menu.tsx
components/ui/pagination.tsx
components/ui/popover.tsx
components/ui/progress.tsx
components/ui/radio-group.tsx
```

> *It is better to include a file that might be relevant than to miss the correct one. Review these files for any UI text or component changes.*
