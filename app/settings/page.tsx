"use client"; // Keep this at the top

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/providers/auth-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { storage, Category } from "@/lib/storage";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Save, Trash2, X, LogOut } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  // --- Hooks ---
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const router = useRouter();

  // --- State ---
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // --- Fetch Categories ---
  const {
    data: categories = [],
    isLoading, // Renamed back for simplicity as it's the main query here
    isError,
    error,
  } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: storage.getCategories,
  });

  // --- Handlers (Keep all your handlers here as before) ---
  async function handleAddCategory() {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName || isAdding) return;
    setIsAdding(true);
    try {
      await storage.addCategory(trimmedName);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: "Category Added", description: `Category "${trimmedName}" added.` });
      setNewCategoryName("");
    } catch (err) {
      console.error("Error adding category:", err);
      toast({ variant: "destructive", title: "Error Adding Category", description: err instanceof Error ? err.message : "Unknown error." });
    } finally { setIsAdding(false); }
  }
  function handleStartEdit(category: Category) {
    setEditingId(category.id);
    setEditingName(category.name);
  }
  function handleCancelEdit() {
    setEditingId(null);
    setEditingName("");
  }
  async function handleSaveEdit(id: string) {
    const trimmedName = editingName.trim();
    if (!trimmedName || isSavingEdit || editingId !== id) return;
    const originalCategory = categories.find(cat => cat.id === id);
    if (originalCategory && originalCategory.name === trimmedName) {
      handleCancelEdit(); return;
    }
    setIsSavingEdit(id);
    try {
      await storage.updateCategory(id, trimmedName);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: "Category Updated", description: `Category updated to "${trimmedName}".` });
      handleCancelEdit();
    } catch (err) {
      console.error("Error updating category:", err);
      toast({ variant: "destructive", title: "Error Updating Category", description: err instanceof Error ? err.message : "Unknown error." });
    } finally { setIsSavingEdit(null); }
  }
  async function handleDeleteCategory(id: string, name: string) {
    if (isDeleting || editingId) return;
    setIsDeleting(id);
    try {
      await storage.deleteCategory(id);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: "Category Deleted", description: `Category "${name}" deleted.` });
    } catch (err) {
      console.error("Error deleting category:", err);
      toast({ variant: "destructive", title: "Error Deleting Category", description: err instanceof Error ? err.message : "Unknown error." });
    } finally { setIsDeleting(null); }
  }
  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
      toast({ title: "Signed Out", description: "Redirecting..." });
      router.push('/login');
    } catch (err) {
      console.error("Sign out error:", err);
      toast({ variant: "destructive", title: "Sign Out Failed", description: err instanceof Error ? err.message : "Unknown error." });
    } finally { setIsSigningOut(false); }
  }
  // --- End Handlers ---


  // --- Render Logic ---
  return (
    <ProtectedRoute>
      <div className="container py-10">
        {/* Page Header */}
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your account and preferences</p>

        {/* Tabs */}
        <Tabs defaultValue="categories" className="space-y-6">
          {/* Tab Triggers */}
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          {/* Categories Tab Content */}
          <TabsContent value="categories" className="border-none p-0 outline-none">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-1">Manage Categories</h2>
              <p className="text-sm text-muted-foreground mb-4">Add, edit, or remove transaction categories</p>

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
                  className="flex-1" // Added flex-1
                />
                <Button onClick={handleAddCategory} disabled={isAdding || !newCategoryName.trim()}>
                  {isAdding ? "Adding..." : "Add"}
                </Button>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="space-y-2 border rounded-md p-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              )}

              {/* Error State */}
              {isError && !isLoading && ( // Ensure it only shows on error AND not loading
                 <p className="text-red-600 px-4 py-4 border rounded-md border-destructive bg-destructive/10">
                    Error loading categories: {error instanceof Error ? error.message : 'Unknown error'}
                 </p>
              )}

              {/* Category List */}
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
                          <Button size="sm" onClick={() => handleSaveEdit(cat.id)} disabled={isSavingEdit === cat.id || !editingName.trim() || editingName === cat.name} aria-label="Save category name">
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
                          <Button size="sm" variant="ghost" onClick={() => handleStartEdit(cat)} disabled={!!editingId || !!isDeleting} aria-label={`Edit ${cat.name}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteCategory(cat.id, cat.name)} disabled={!!editingId || !!isDeleting} aria-label={`Delete ${cat.name}`}>
                            {isDeleting === cat.id ? <Save className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>

          {/* Account Tab Content */}
          <TabsContent value="account" className="border-none p-0 outline-none">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-1">Account Information</h2>
              <p className="text-muted-foreground mb-6">View your account details and sign out.</p>
              <div className="mb-4 space-y-4"> {/* Added space-y-4 for spacing */}
                <div> {/* Wrap Label/Input pairs */}
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" value={user?.email || ""} disabled className="mt-1" />
                </div>
                <div> {/* Wrap Label/Input pairs */}
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={"********"} disabled className="mt-1" />
                    {/* Note: Change Password button is currently non-functional */}
                    <Button variant="outline" className="mt-4" disabled>Change Password</Button>
                </div>
              </div>
              <Button
                variant="destructive" // Changed from outline to destructive for sign out
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full sm:w-auto" // Added responsive width
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isSigningOut ? "Signing Out..." : "Sign Out"}
              </Button>
            </div>
          </TabsContent>

          {/* Appearance Tab Content */}
          <TabsContent value="appearance" className="border-none p-0 outline-none">
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
    <h2 className="text-xl font-semibold mb-1">Appearance</h2>
    <p className="text-muted-foreground mb-6">Customize how CardTracker looks</p>
    <h3 className="text-md font-medium mb-4">Theme</h3>
    <div className="flex flex-col md:flex-row gap-6">
      {/* Light Theme */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full h-20 border rounded-md flex items-center justify-center bg-white text-black font-normal text-lg">Light</div>
        <button className="mt-3 px-6 py-2 rounded-md bg-[#be8c9b] text-white font-medium text-base select-none" disabled>Active</button>
      </div>
      {/* Dark Theme */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full h-20 border rounded-md flex items-center justify-center bg-[#0e1220] text-white font-normal text-lg">Dark</div>
        <button className="mt-3 px-6 py-2 rounded-md" style={{background:'#F8F2F4', color:'#000', fontWeight:'500', fontSize:'1rem'}} >Select</button>
      </div>
      {/* System Theme */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full h-20 border rounded-md flex items-center justify-center bg-gradient-to-r from-white via-gray-200 to-[#232836] text-black font-normal text-lg">System</div>
        <button className="mt-3 px-6 py-2 rounded-md" style={{background:'#F8F2F4', color:'#000', fontWeight:'500', fontSize:'1rem'}} >Select</button>
      </div>
    </div>
  </div>
</TabsContent>

        </Tabs> {/* End Tabs Component */}
      </div> {/* End container */}
    </ProtectedRoute>
  );
} // <-- Make sure this is the VERY LAST closing brace