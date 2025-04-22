"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { signIn, isLoading, session } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await signIn(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  }

  if (session) {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="p-8 bg-card rounded shadow-md w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold mb-4">Sign In</h1>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-destructive text-sm">{error}</div>}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
