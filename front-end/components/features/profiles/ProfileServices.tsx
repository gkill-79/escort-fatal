import { formatServiceLabel } from "@/lib/utils/formatters";

interface Service {
  type: string;
  description?: string | null;
  price?: number | null;
}

export function ProfileServices({
  services = [],
  editable = false,
}: {
  services: Service[];
  editable?: boolean;
}) {
  if (services.length === 0) return <p className="text-sm text-dark-500">Aucun service renseigné.</p>;
  return (
    <ul className="space-y-2">
      {services.map((s, i) => (
        <li key={i} className="flex justify-between text-sm text-dark-300">
          <span>{formatServiceLabel(s.type)}</span>
          {s.price != null && <span>{s.price} €</span>}
        </li>
      ))}
    </ul>
  );
}
