"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// For now, use localStorage-based storage logic for categories
function getCategories() {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("categories") || "[]");
}
function saveCategories(categories: { id: string; name: string }[]) {
  localStorage.setItem("categories", JSON.stringify(categories));
}

export default function SettingsPage() {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    setCategories(getCategories());
  }, []);

  function handleAddCategory() {
    if (!newCategory.trim()) return;
    const newCat = { id: Date.now().toString(), name: newCategory.trim() };
    const updated = [...categories, newCat];
    setCategories(updated);
    saveCategories(updated);
    setNewCategory("");
  }

  function handleEditCategory(id: string) {
    setEditingId(id);
    setEditingName(categories.find((cat) => cat.id === id)?.name || "");
  }

  function handleSaveEdit(id: string) {
    const updated = categories.map((cat) =>
      cat.id === id ? { ...cat, name: editingName } : cat
    );
    setCategories(updated);
    saveCategories(updated);
    setEditingId(null);
    setEditingName("");
  }

  function handleDeleteCategory(id: string) {
    const updated = categories.filter((cat) => cat.id !== id);
    setCategories(updated);
    saveCategories(updated);
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
