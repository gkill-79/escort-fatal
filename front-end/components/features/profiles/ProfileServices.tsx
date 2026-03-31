import { formatServiceLabel } from "@/lib/utils/formatters";
import { CheckoutButton } from "@/components/features/checkout/CheckoutButton";

interface Service {
  id?: string;
  type: string;
  description?: string | null;
  price?: number | null;
}

export function ProfileServices({
  services = [],
  escortId,
  editable = false,
}: {
  services: Service[];
  escortId: string;
  editable?: boolean;
}) {
  if (services.length === 0) return <p className="text-sm text-dark-500">Aucun service renseigné.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {services.map((s, i) => (
        <div 
          key={i} 
          className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3"
        >
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white">
              {formatServiceLabel(s.type)}
            </h4>
            {s.description && (
              <p className="text-xs text-dark-500 line-clamp-2">
                {s.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-auto gap-4">
            <span className="text-sm font-bold text-brand-400 whitespace-nowrap">
              {s.price != null ? `${s.price} €` : "Sur demande"}
            </span>
            
            {!editable && s.price != null && (
              <CheckoutButton 
                serviceId={s.id || `s-${i}`} 
                escortId={escortId} 
                price={s.price} 
                title={formatServiceLabel(s.type)} 
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
