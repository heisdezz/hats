import { MapPin, Building2, Map } from "lucide-react";
import { useDeliverySettings } from "#/store/delivery";
import { Link } from "@tanstack/react-router";

export default function DeliverySettings() {
  const { delivery_settings: d, isValid } = useDeliverySettings((s) => s);

  return (
    <div className="ring-accent/20 ring rounded-xl bg-base-100">
      <h2 className="p-4 border-b fade text-sm font-semibold">Delivery info</h2>

      <div className="p-4">
        {isValid ? (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-start gap-2.5">
              <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-base-content/50 text-xs">Address</p>
                <p className="font-medium">{d.fullAddress}</p>
              </div>
            </div>

            {d.city && (
              <div className="flex items-start gap-2.5">
                <Building2 className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-base-content/50 text-xs">City</p>
                  <p className="font-medium">{d.city}</p>
                </div>
              </div>
            )}

            {d.state && (
              <div className="flex items-start gap-2.5">
                <Map className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-base-content/50 text-xs">State</p>
                  <p className="font-medium">{d.state}</p>
                </div>
              </div>
            )}

            <Link to="/profile" className="btn btn-outline btn-sm mt-1">
              Update delivery setting
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <MapPin className="size-8 text-base-content/20" />
            <p className="text-sm text-base-content/50">
              No delivery address set
            </p>
            <Link to="/profile" className="btn btn-primary ">
              Update delivery settings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
