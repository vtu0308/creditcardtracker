"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { storage } from "@/lib/storage";

export default function SettingsPage() {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      setError(null);
      try {
        const cats = await storage.getCategories();
        setCategories(cats);
      } catch (err: any) {
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  async function handleAddCategory() {
    if (!newCategory.trim()) return;
    try {
      const cat = await storage.addCategory(newCategory.trim());
      setCategories((prev) => [...prev, cat]);
      setNewCategory("");
    } catch (err) {
      setError("Failed to add category");
    }
  }

  function handleEditCategory(id: string) {
    setEditingId(id);
    setEditingName(categories.find((cat) => cat.id === id)?.name || "");
  }

  async function handleSaveEdit(id: string) {
    try {
      const updated = await storage.updateCategory(id, editingName);
      setCategories((prev) => prev.map((cat) => cat.id === id ? updated : cat));
      setEditingId(null);
      setEditingName("");
    } catch (err) {
      setError("Failed to update category");
    }
  }

  async function handleDeleteCategory(id: string) {
    try {
      await storage.deleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (err) {
      setError("Failed to delete category");
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Settings: Manage Categories</h1>
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
        />
        <Button onClick={handleAddCategory}>Add</Button>
      </div>
      <ul className="divide-y divide-gray-200">
        {categories.length === 0 && (
          <li className="py-4 text-gray-400">No categories yet.</li>
        )}
        {categories.map((cat) => (
          <li key={cat.id} className="flex items-center gap-2 py-2">
            {editingId === cat.id ? (
              <>
                <Input
                  className="w-40"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(cat.id)}
                  autoFocus
                />
                <Button size="sm" onClick={() => handleSaveEdit(cat.id)}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1">{cat.name}</span>
                <Button size="sm" variant="ghost" onClick={() => handleEditCategory(cat.id)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteCategory(cat.id)}>
                  Delete
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
