import { Pencil, X } from "lucide-react";
import { useState } from "react";
import type { DeliverySettingsRecord } from "pocketbase-types";
import DeliveryForm from "./DeliveryForm";

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-base-200 last:border-0 text-sm">
      <span className="text-base-content/50">{label}</span>
      <span className="font-medium">{value ?? "—"}</span>
    </div>
  );
}

export default function ShippingAddress({
  delivery,
}: {
  delivery: Partial<DeliverySettingsRecord>;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="bg-base-100 ring fade rounded-2xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-base-200">
        <h3 className="font-semibold">Shipping Address</h3>
        <button
          className="btn btn-ghost btn-xs btn-square"
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? <X className="size-4" /> : <Pencil className="size-4" />}
        </button>
      </div>

      {editing ? (
        <div className="p-5">
          <DeliveryForm onSuccess={() => setEditing(false)} />
        </div>
      ) : (
        <div className="px-5">
          <Row label="Address" value={delivery.fullAdress} />
          <Row label="City" value={delivery.city} />
          <Row label="State" value={delivery.state} />
        </div>
      )}
    </div>
  );
}
