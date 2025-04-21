"use client";

import { useState } from "react"; // Removed useEffect
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from '@tanstack/react-query'; // Added RQ hooks
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { storage, Category } from "@/lib/storage"; // Import Category type
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { Pencil, Save, Trash2, X } from "lucide-react"; // Icons

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // --- State for UI Controls ---
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState<string | null>(null); // Store ID being saved
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Store ID being deleted
  // REMOVED: useState for categories, loading, error

  // --- Fetch Categories using useQuery ---
  const {
    data: categories = [], // Default to empty array
    isLoading,
    isError,
    error,
  } = useQuery<Category[]>({
    queryKey: ['categories'], // Unique key for categories cache
    queryFn: storage.getCategories, // Fetch function
  });

  // REMOVED: useEffect for fetching categories

  // --- Add Category Handler ---
  async function handleAddCategory() {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName || isAdding) return;

    setIsAdding(true);
    try {
      await storage.addCategory(trimmedName);
      queryClient.invalidateQueries({ queryKey: ['categories'] }); // Invalidate cache
      toast({
        title: "Category Added",
        description: `Category "${trimmedName}" was successfully added.`,
      });
      setNewCategoryName(""); // Clear input on success
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error Adding Category",
        description: err instanceof Error ? err.message : "An unknown error occurred.",
      });
    } finally {
      setIsAdding(false);
    }
  }

  // --- Start Editing Handler ---
  function handleStartEdit(category: Category) {
    setEditingId(category.id);
    setEditingName(category.name); // Initialize editingName with current name
  }

  // --- Cancel Editing Handler ---
  function handleCancelEdit() {
    setEditingId(null);
    setEditingName("");
  }

  // --- Save Edit Handler ---
  async function handleSaveEdit(id: string) {
    const trimmedName = editingName.trim();
    if (!trimmedName || isSavingEdit || !editingId) return; // Check editingId too

    setIsSavingEdit(id); // Track which one is saving
    try {
       // Check if name actually changed
       const originalCategory = categories.find(cat => cat.id === id);
       if (originalCategory && originalCategory.name === trimmedName) {
          console.log("[SettingsPage] No changes detected, skipping update.");
          setEditingId(null); // Exit edit mode
          return; // Don't call API if no change
       }

      await storage.updateCategory(id, trimmedName);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Category Updated",
        description: `Category updated to "${trimmedName}".`,
      });
      handleCancelEdit(); // Reset editing state on success

    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error Updating Category",
        description: err instanceof Error ? err.message : "An unknown error occurred.",
      });
      // Optionally keep edit mode open on error? Or close? Depends on desired UX.
      // handleCancelEdit();
    } finally {
      setIsSavingEdit(null);
    }
  }

  // --- Delete Category Handler ---
  async function handleDeleteCategory(id: string, name: string) {
    if (isDeleting) return;

    setIsDeleting(id);
    try {
      await storage.deleteCategory(id);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Category Deleted",
        description: `Category \"${name}\" was successfully deleted.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error Deleting Category",
        description: err instanceof Error ? err.message : "An unknown error occurred.",
      });
    } finally {
      setIsDeleting(null);
    }
  }

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto py-8 space-y-6">
        <h1 className="text-2xl font-bold mb-6">Settings: Manage Categories</h1>
        <Skeleton className="h-10 w-full mb-6" /> {/* Add form skeleton */}
        <Skeleton className="h-10 w-full" /> {/* List item skeletons */}
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Settings: Manage Categories</h1>
        <p className="text-red-600">Error loading categories: {error?.message}</p>
        {/* Optionally add a retry button */}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Settings: Manage Categories</h1>

      {/* Add Category Form */}
      <div className="flex gap-2 mb-6">
        <Label htmlFor="new-category-name" className="sr-only">New Category Name</Label>
        <Input
          id="new-category-name"
          placeholder="New category name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
          disabled={isAdding}
        />
        <Button onClick={handleAddCategory} disabled={isAdding || !newCategoryName.trim()}>
          {isAdding ? "Adding..." : "Add"}
        </Button>
      </div>

      {/* Category List */}
      <ul className="divide-y divide-border rounded-md border"> {/* Use theme border */}
        {categories.length === 0 && !isLoading && ( // Ensure not loading before showing empty
          <li className="px-4 py-4 text-center text-muted-foreground"> {/* Use theme color */}
             No categories created yet.
          </li>
        )}
        {categories.map((cat) => (
          <li key={cat.id} className="flex items-center gap-2 px-4 py-2 hover:bg-muted/50"> {/* Use theme color */}
            {editingId === cat.id ? (
              // Edit Mode
              <>
                <Label htmlFor={`edit-cat-${cat.id}`} className="sr-only">Edit Category Name</Label>
                <Input
                  id={`edit-cat-${cat.id}`}
                  className="flex-1 h-9" // Adjust size/styling as needed
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(cat.id)}
                  disabled={isSavingEdit === cat.id} // Disable only the one being saved
                  autoFocus
                />
                <Button
                    size="sm"
                    onClick={() => handleSaveEdit(cat.id)}
                    disabled={isSavingEdit === cat.id || !editingName.trim() || editingName === cat.name} // Disable if saving, empty, or unchanged
                >
                    {isSavingEdit === cat.id ? <Save className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {/* Show icon */}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelEdit} disabled={isSavingEdit === cat.id}>
                    <X className="h-4 w-4"/> {/* Show icon */}
                </Button>
              </>
            ) : (
              // Display Mode
              <>
                <span className="flex-1 truncate">{cat.name}</span> {/* Add truncate */}
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStartEdit(cat)}
                    disabled={!!editingId || isDeleting === cat.id} // Disable if another is being edited or this is being deleted
                    aria-label={`Edit ${cat.name}`}
                 >
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button
                    size="sm"
                    variant="ghost" // Changed to ghost for less visual noise, keep destructive intent for color
                    className="text-destructive hover:text-destructive hover:bg-destructive/10" // Destructive colors
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    disabled={!!editingId || isDeleting === cat.id} // Disable if another is being edited or this is being deleted
                    aria-label={`Delete ${cat.name}`}
                 >
                    {isDeleting === cat.id ? <Save className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}