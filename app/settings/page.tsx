"use client"; // Keep this at the top

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
// Ensure the path to useToast is correct for your setup
// If you placed it directly in components/ui, use that path
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/providers/auth-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { storage, Category } from "@/lib/storage";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Save, Trash2, X, LogOut } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route"; // Import ProtectedRoute

// The default export is the page component Next.js renders
export default function SettingsPage() {

  // --- Hooks needed for Auth/Routing/Toast/QueryClient are called here ---
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, signOut } = useAuth(); // Get user info and signOut function
  const router = useRouter(); // For redirection after sign out

  // --- State for UI Controls (Category CRUD + Sign Out) ---
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState<string | null>(null); // Store ID being saved
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Store ID being deleted
  const [isSigningOut, setIsSigningOut] = useState(false); // State for sign out button

  // --- Fetch Categories using useQuery ---
  const {
    data: categories = [], // Default to empty array
    isLoading,
    isError,
    error, // Catch the error object
  } = useQuery<Category[]>({
    queryKey: ['categories'], // Unique key for categories cache
    queryFn: storage.getCategories, // Fetch function
  });

  // --- Add Category Handler ---
  async function handleAddCategory() {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName || isAdding) return;

    setIsAdding(true);
    try {
      await storage.addCategory(trimmedName);
      // Invalidate cache AFTER successful operation
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Category Added",
        description: `Category "${trimmedName}" was successfully added.`,
      });
      setNewCategoryName(""); // Clear input on success
    } catch (err) {
      console.error("Error adding category:", err);
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
    // Ensure editingId matches the id being saved, prevents potential race conditions
    if (!trimmedName || isSavingEdit || editingId !== id) return;

    const originalCategory = categories.find(cat => cat.id === id);
    // Avoid API call if name hasn't changed
    if (originalCategory && originalCategory.name === trimmedName) {
      console.log("[SettingsPage] No changes detected, skipping update.");
      handleCancelEdit(); // Exit edit mode
      return;
    }

    setIsSavingEdit(id); // Track which one is saving
    try {
      await storage.updateCategory(id, trimmedName);
      // Invalidate cache AFTER successful operation
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Category Updated",
        description: `Category updated to "${trimmedName}".`,
      });
      handleCancelEdit(); // Reset editing state on success

    } catch (err) {
      console.error("Error updating category:", err);
      toast({
        variant: "destructive",
        title: "Error Updating Category",
        description: err instanceof Error ? err.message : "An unknown error occurred.",
      });
      // Decide on UX: Maybe don't cancel edit on error?
      // handleCancelEdit();
    } finally {
      setIsSavingEdit(null);
    }
  }

  // --- Delete Category Handler ---
  async function handleDeleteCategory(id: string, name: string) {
    // Prevent delete if currently editing another or deleting this one
    if (isDeleting || editingId) return;

    setIsDeleting(id); // Track which one is deleting
    try {
      await storage.deleteCategory(id);
       // Invalidate cache AFTER successful operation
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      // Consider if transactions should also be invalidated if deleting a category impacts them
      // queryClient.invalidateQueries({ queryKey: ['transactions'] });

      toast({
        title: "Category Deleted",
        description: `Category "${name}" was successfully deleted.`,
      });
      // State updates automatically via useQuery refetch

    } catch (err) {
      console.error("Error deleting category:", err);
      toast({
        variant: "destructive",
        title: "Error Deleting Category",
        description: err instanceof Error ? err.message : "An unknown error occurred.",
      });
    } finally {
      setIsDeleting(null);
    }
  }

  // --- Sign Out Handler ---
  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut(); // Call the signOut function from useAuth context
      toast({ title: "Signed Out", description: "Redirecting to login..." });
      router.push('/login'); // Redirect to login page
    } catch (err) {
      console.error("Sign out error:", err);
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: err instanceof Error ? err.message : "An unknown error occurred.",
      });
    } finally {
      setIsSigningOut(false);
    }
  }

  // --- Render Logic ---

  // Use ProtectedRoute to wrap the entire content
  // It will handle the loading/redirect logic based on auth state
  return (
    <ProtectedRoute>
      <div className="max-w-xl mx-auto py-8 space-y-8">

        {/* Manage Categories Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Manage Categories</h2>

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

          {/* Loading State for Category List */}
          {isLoading && (
            <div className="space-y-2 border rounded-md p-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          )}

          {/* Error State for Category List */}
          {isError && !isLoading && (
             <p className="text-red-600 px-4 py-4 border rounded-md border-destructive bg-destructive/10">
                Error loading categories: {error instanceof Error ? error.message : 'Unknown error'}
             </p>
          )}

          {/* Category List (Render only if not loading and no error) */}
          {!isLoading && !isError && (
            <ul className="divide-y divide-border rounded-md border">
              {categories.length === 0 && (
                <li className="px-4 py-4 text-center text-muted-foreground">
                   No categories created yet.
                </li>
              )}
              {categories.map((cat) => (
                <li key={cat.id} className="flex items-center gap-2 px-4 py-2 hover:bg-muted/50">
                  {editingId === cat.id ? (
                    // Edit Mode
                    <>
                      <Label htmlFor={`edit-cat-${cat.id}`} className="sr-only">Edit Category Name</Label>
                      <Input
                        id={`edit-cat-${cat.id}`}
                        className="flex-1 h-9"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(cat.id)}
                        disabled={isSavingEdit === cat.id}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(cat.id)}
                        disabled={isSavingEdit === cat.id || !editingName.trim() || editingName === cat.name}
                        aria-label="Save category name"
                      >
                        {isSavingEdit === cat.id ? <Save className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit} disabled={isSavingEdit === cat.id} aria-label="Cancel edit">
                        <X className="h-4 w-4"/>
                      </Button>
                    </>
                  ) : (
                    // Display Mode
                    <>
                      <span className="flex-1 truncate" title={cat.name}>{cat.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(cat)}
                        disabled={!!editingId || !!isDeleting} // Disable if any item is being edited or deleted
                        aria-label={`Edit ${cat.name}`}
                       >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        disabled={!!editingId || !!isDeleting} // Disable if any item is being edited or deleted
                        aria-label={`Delete ${cat.name}`}
                       >
                        {isDeleting === cat.id ? <Save className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div> {/* End Manage Categories Section */}


        {/* Account Section */}
        <div>
           <h2 className="text-xl font-semibold mb-4">Account</h2>
           {/* Display logged in user info if user object exists */}
           {user && (
              <div className="mb-4 p-4 border rounded-md bg-muted/50">
                  <p className="text-sm text-muted-foreground">Logged in as:</p>
                  <p className="font-medium break-all">{user.email}</p> {/* Use break-all for long emails */}
              </div>
           )}
           {/* Sign Out Button */}
           <Button
             variant="outline"
             onClick={handleSignOut}
             disabled={isSigningOut}
             className="w-full sm:w-auto"
           >
             <LogOut className="mr-2 h-4 w-4" />
             {isSigningOut ? "Signing Out..." : "Sign Out"}
           </Button>
        </div> {/* End Account Section */}

      </div> {/* End main content wrapper */}
    </ProtectedRoute> // End ProtectedRoute Wrapper
  );
}