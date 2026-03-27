"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useRef } from "react";
import { Search, Loader2 } from "lucide-react";

export function UsersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const currentQ = searchParams.get("q") || "";
  const currentRole = searchParams.get("role") || "ALL";
  const currentStatus = searchParams.get("status") || "ALL";

  function applyFilters(data: FormData) {
    const q = (data.get("q") as string) || "";
    const role = (data.get("role") as string) || "ALL";
    const status = (data.get("status") as string) || "ALL";

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (role !== "ALL") params.set("role", role);
    if (status !== "ALL") params.set("status", status);

    startTransition(() => {
      router.push(`/admin/users?${params.toString()}`);
    });
  }

  const roles = ["ALL", "MEMBER", "ESCORT", "ADMIN"];
  const statuses = ["ALL", "ACTIVE", "BANNED"];

  return (
    <form
      ref={formRef}
      action={applyFilters}
      className="bg-dark-900 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center"
    >
      {/* Search Input */}
      <div className="flex bg-dark-800 border border-white/10 rounded-xl px-4 py-2 flex-1 items-center gap-2 focus-within:border-brand-500/50 transition-colors">
        {isPending ? (
          <Loader2 className="w-4 h-4 text-brand-400 animate-spin shrink-0" />
        ) : (
          <Search className="w-4 h-4 text-dark-400 shrink-0" />
        )}
        <input
          name="q"
          type="text"
          defaultValue={currentQ}
          placeholder="Rechercher par pseudo ou email..."
          className="bg-transparent text-white text-sm w-full focus:outline-none placeholder:text-dark-500"
          onChange={(e) => {
            if (e.target.value === "") {
              formRef.current?.requestSubmit();
            }
          }}
        />
      </div>

      {/* Role Filter */}
      <div className="flex gap-1 bg-dark-800 border border-white/10 rounded-xl p-1">
        {roles.map((role) => (
          <button
            key={role}
            type="submit"
            name="role"
            value={role}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              currentRole === role
                ? "bg-brand-500 text-white shadow-sm"
                : "text-dark-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {role === "ALL" ? "Tous" : role}
          </button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex gap-1 bg-dark-800 border border-white/10 rounded-xl p-1">
        {statuses.map((status) => (
          <button
            key={status}
            type="submit"
            name="status"
            value={status}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              currentStatus === status
                ? status === "BANNED"
                  ? "bg-red-500 text-white"
                  : status === "ACTIVE"
                  ? "bg-green-600 text-white"
                  : "bg-brand-500 text-white"
                : "text-dark-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {status === "ALL" ? "Tous" : status === "ACTIVE" ? "Actifs" : "Bannis"}
          </button>
        ))}
      </div>

      {/* Submit on Enter */}
      <button type="submit" className="sr-only" aria-hidden>
        Rechercher
      </button>
    </form>
  );
}
