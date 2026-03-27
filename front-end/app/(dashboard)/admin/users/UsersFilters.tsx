"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useEffect, useState } from "react";
import { Search, Loader2, RotateCcw } from "lucide-react";

export function UsersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") || "";
  const currentRole = searchParams.get("role") || "ALL";
  const currentStatus = searchParams.get("status") || "ALL";
  const currentLimit = searchParams.get("limit") || "25";
  const [q, setQ] = useState(currentQ);
  const [role, setRole] = useState(currentRole);
  const [status, setStatus] = useState(currentStatus);

  useEffect(() => {
    setQ(currentQ);
    setRole(currentRole);
    setStatus(currentStatus);
  }, [currentQ, currentRole, currentStatus]);

  function pushFilters(nextQ: string, nextRole: string, nextStatus: string) {
    const normalizedQ = nextQ.trim();

    const params = new URLSearchParams();
    if (normalizedQ) params.set("q", normalizedQ);
    if (nextRole !== "ALL") params.set("role", nextRole);
    if (nextStatus !== "ALL") params.set("status", nextStatus);
    if (currentLimit) params.set("limit", currentLimit);
    params.set("page", "1");

    startTransition(() => {
      const queryString = params.toString();
      router.push(queryString ? `/admin/users?${queryString}` : "/admin/users");
    });
  }

  function applyFilters() {
    pushFilters(q, role, status);
  }

  function resetFilters() {
    setQ("");
    setRole("ALL");
    setStatus("ALL");
    pushFilters("", "ALL", "ALL");
  }

  const roles = ["ALL", "MEMBER", "ESCORT", "ADMIN"];
  const statuses = ["ALL", "ACTIVE", "BANNED"];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        applyFilters();
      }}
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
          value={q}
          placeholder="Rechercher par pseudo ou email..."
          className="bg-transparent text-white text-sm w-full focus:outline-none placeholder:text-dark-500"
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* Role Filter */}
      <div className="flex gap-1 bg-dark-800 border border-white/10 rounded-xl p-1">
        {roles.map((roleOption) => (
          <button
            key={roleOption}
            type="button"
            onClick={() => setRole(roleOption)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              roleOption === role
                ? "bg-brand-500 text-white shadow-sm"
                : "text-dark-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {roleOption === "ALL" ? "Tous" : roleOption}
          </button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex gap-1 bg-dark-800 border border-white/10 rounded-xl p-1">
        {statuses.map((statusOption) => (
          <button
            key={statusOption}
            type="button"
            onClick={() => setStatus(statusOption)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusOption === status
                ? statusOption === "BANNED"
                  ? "bg-red-500 text-white"
                  : statusOption === "ACTIVE"
                  ? "bg-green-600 text-white"
                  : "bg-brand-500 text-white"
                : "text-dark-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {statusOption === "ALL" ? "Tous" : statusOption === "ACTIVE" ? "Actifs" : "Bannis"}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <button
          type="submit"
          disabled={isPending}
          className="h-10 px-4 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          Appliquer
        </button>
        <button
          type="button"
          onClick={resetFilters}
          disabled={isPending}
          className="h-10 px-3 rounded-xl border border-white/10 text-dark-300 hover:text-white hover:bg-white/5 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          title="Réinitialiser les filtres"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
