import Link from "next/link";
import { Prisma, UserRole } from "@prisma/client";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import UserRow from "./UserRow";
import { UsersFilters } from "./UsersFilters";

export const metadata = {
  title: "Gestion des Comptes — Escorte Fatal Admin",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; role?: string; status?: string; page?: string; limit?: string };
}) {
  const query = searchParams.q || "";
  const roleFilter = searchParams.role || "ALL";
  const statusFilter = searchParams.status || "ALL";
  const page = Math.max(1, Number.parseInt(searchParams.page || "1", 10) || 1);
  const requestedLimit = Number.parseInt(searchParams.limit || "25", 10) || 25;
  const allowedLimits = [10, 25, 50, 100];
  const limit = allowedLimits.includes(requestedLimit) ? requestedLimit : 25;

  const allowedRoles = new Set(Object.values(UserRole));
  const parsedRole = allowedRoles.has(roleFilter as UserRole)
    ? (roleFilter as UserRole)
    : null;

  const where: Prisma.UserWhereInput = {
    ...(query
      ? {
          OR: [
            { username: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(parsedRole ? { role: parsedRole } : {}),
    ...(statusFilter === "ACTIVE"
      ? { isActive: true }
      : statusFilter === "BANNED"
        ? { isActive: false }
        : {}),
  };

  const totalUsers = await prisma.user.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalUsers / limit));
  const safePage = Math.min(page, totalPages);
  const skip = (safePage - 1) * limit;

  const [users, activeCount, bannedCount, escortCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where: { ...where, isActive: true } }),
    prisma.user.count({ where: { ...where, isActive: false } }),
    prisma.user.count({ where: { ...where, role: "ESCORT" } }),
  ]);

  const currentFrom = totalUsers === 0 ? 0 : (safePage - 1) * limit + 1;
  const currentTo = totalUsers === 0 ? 0 : Math.min(safePage * limit, totalUsers);

  function buildUsersHref(overrides: Record<string, string | null>) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (parsedRole) params.set("role", parsedRole);
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    params.set("limit", String(limit));

    Object.entries(overrides).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });

    const queryString = params.toString();
    return queryString ? `/admin/users?${queryString}` : "/admin/users";
  }

  const prevPageHref = safePage > 1 ? buildUsersHref({ page: String(safePage - 1) }) : null;
  const nextPageHref =
    safePage < totalPages ? buildUsersHref({ page: String(safePage + 1) }) : null;
  const pageNumbers = Array.from(
    new Set([1, safePage - 1, safePage, safePage + 1, totalPages].filter((n) => n >= 1 && n <= totalPages))
  );
  const paginationItems: Array<number | "ELLIPSIS"> = [];
  pageNumbers.forEach((pageNumber, index) => {
    const previous = pageNumbers[index - 1];
    if (index > 0 && previous && pageNumber - previous > 1) {
      paginationItems.push("ELLIPSIS");
    }
    paginationItems.push(pageNumber);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Gestion des Comptes</h1>
        <p className="text-dark-400 mt-1">
          {totalUsers} compte{totalUsers !== 1 ? "s" : ""} trouvé{totalUsers !== 1 ? "s" : ""}
          {query ? ` pour « ${query} »` : ""}.
        </p>
      </div>

      <UsersFilters />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 text-dark-300 border border-white/10">
          Total: {totalUsers}
        </span>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
          Actifs: {activeCount}
        </span>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
          Bannis: {bannedCount}
        </span>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
          Escortes: {escortCount}
        </span>
        {(query || parsedRole || statusFilter !== "ALL") && (
          <Link
            href="/admin/users"
            className="text-xs font-semibold px-3 py-1 rounded-full bg-dark-900 text-dark-300 border border-white/10 hover:text-white hover:bg-white/5 transition-colors"
          >
            Effacer les filtres
          </Link>
        )}
      </div>

      <div className="bg-dark-800 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-900/50 border-b border-white/10 text-xs uppercase tracking-wider text-dark-400">
                <th className="px-4 py-3 font-medium">Utilisateur</th>
                <th className="px-4 py-3 font-medium">Rôle</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Crédits (Monétisation)</th>
                <th className="px-4 py-3 font-medium">Inscription</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-dark-400">
                    <Users className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    Aucun compte trouvé correspondant aux critères.
                  </td>
                </tr>
              ) : (
                users.map((user) => <UserRow key={user.id} user={user} />)
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-dark-900 border border-white/5 rounded-2xl p-4">
        <p className="text-sm text-dark-400">
          Affichage {currentFrom}-{currentTo} sur {totalUsers}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-xs text-dark-500">Par page :</span>
          {allowedLimits.map((option) => (
            <Link
              key={option}
              href={buildUsersHref({ limit: String(option), page: "1" })}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                option === limit
                  ? "bg-brand-500 text-white border-brand-500"
                  : "border-white/10 text-dark-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {option}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {prevPageHref ? (
            <Link
              href={prevPageHref}
              className="text-sm px-3 py-1.5 rounded-lg border border-white/10 text-dark-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Précédent
            </Link>
          ) : (
            <span className="text-sm px-3 py-1.5 rounded-lg border border-white/5 text-dark-600 cursor-not-allowed">
              Précédent
            </span>
          )}

          {paginationItems.map((item, index) =>
            item === "ELLIPSIS" ? (
              <span
                key={`ellipsis-${index}`}
                className="text-sm min-w-9 text-center px-2.5 py-1.5 text-dark-500"
              >
                ...
              </span>
            ) : (
              <Link
                key={item}
                href={buildUsersHref({ page: String(item) })}
                className={`text-sm min-w-9 text-center px-2.5 py-1.5 rounded-lg border transition-colors ${
                  item === safePage
                    ? "bg-brand-500 text-white border-brand-500"
                    : "border-white/10 text-dark-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {item}
              </Link>
            )
          )}

          {nextPageHref ? (
            <Link
              href={nextPageHref}
              className="text-sm px-3 py-1.5 rounded-lg border border-white/10 text-dark-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Suivant
            </Link>
          ) : (
            <span className="text-sm px-3 py-1.5 rounded-lg border border-white/5 text-dark-600 cursor-not-allowed">
              Suivant
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

