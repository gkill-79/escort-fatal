import { prisma } from "@/lib/prisma";
import UserRow from "./UserRow";
import { UsersFilters } from "./UsersFilters";
import { Users } from "lucide-react";

export const metadata = {
  title: "Gestion des Comptes — Escorte Fatal Admin",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; role?: string; status?: string };
}) {
  const query = searchParams.q || "";
  const roleFilter = searchParams.role || "ALL";
  const statusFilter = searchParams.status || "ALL";

  const users = await prisma.user.findMany({
    where: {
      ...(query ? {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ]
      } : {}),
      ...(roleFilter !== "ALL" ? { role: roleFilter as any } : {}),
      ...(statusFilter === "ACTIVE" ? { isActive: true } : statusFilter === "BANNED" ? { isActive: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Gestion des Comptes</h1>
        <p className="text-dark-400 mt-1">
          {users.length} compte{users.length !== 1 ? "s" : ""} trouvé{users.length !== 1 ? "s" : ""}
          {query ? ` pour « ${query} »` : ""}.
        </p>
      </div>

      <UsersFilters />

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
                users.map(user => <UserRow key={user.id} user={user} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

