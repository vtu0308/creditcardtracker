"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
import { storage, type Category } from "@/lib/storage"
import { PageHeader } from "@/components/page-header"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  // Load categories from storage on component mount
  useEffect(() => {
    async function fetchCategories() {
      const cats = await storage.getCategories();
      setCategories(cats);
    }
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      await storage.addCategory(newCategory.trim());
      const cats = await storage.getCategories();
      setCategories(cats);
      setNewCategory("");
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const saveEdit = async () => {
    if (editingId && editName.trim()) {
      await storage.updateCategory(editingId, editName.trim());
      const cats = await storage.getCategories();
      setCategories(cats);
      setEditingId(null);
      setEditName("");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const deleteCategory = async (id: string) => {
    await storage.deleteCategory(id);
    const cats = await storage.getCategories();
    setCategories(cats);
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="Categories"
          description="Manage expense categories to organize your transactions."
        />

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Add New Category</h3>
              <p className="text-sm text-muted-foreground">
                Create custom categories to classify your expenses
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input placeholder="e.g., Groceries" />
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Expense Categories</h3>
              <p className="text-sm text-muted-foreground">
                Your custom expense categories
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between rounded-lg border p-3">
                    {editingId === category.id ? (
                      <div className="flex flex-1 items-center gap-4">
                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="max-w-sm" />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEdit}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium">{category.name}</span>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" onClick={() => startEditing(category)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteCategory(category.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
