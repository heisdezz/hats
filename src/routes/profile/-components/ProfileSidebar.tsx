import { Mail, MapPin, Phone, Wallet } from "lucide-react";
import type { DeliverySettingsRecord, ProfileRecord } from "pocketbase-types";

export default function ProfileSidebar({
  profile,
  delivery,
}: {
  profile: ProfileRecord;
  delivery: Partial<DeliverySettingsRecord>;
}) {
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "—";
  const location = [delivery.city, delivery.state].filter(Boolean).join(", ");

  return (
    <div className="flex flex-col items-center gap-5 bg-base-100 ring fade rounded-2xl p-6 text-center">
      <div className="avatar">
        <div className="w-28 rounded-2xl bg-base-200 ring fade">
          <div className="w-full h-full grid place-items-center text-4xl text-base-content/20 font-bold select-none">
            {profile.firstName?.[0]?.toUpperCase() ?? "?"}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold">{fullName}</h2>
        {profile.username && (
          <p className="text-sm text-base-content/50">@{profile.username}</p>
        )}
      </div>

      <div className="badge badge-primary gap-1.5 py-3 px-4">
        <Wallet className="size-3.5" />
        <span className="text-xs font-semibold">Balance: ₦0</span>
      </div>

      <div className="divider my-0" />

      <div className="flex flex-col gap-3 w-full text-sm text-left">
        {location && (
          <div className="flex items-center gap-2.5 text-base-content/70">
            <MapPin className="size-4 shrink-0 text-base-content/40" />
            <span>{location}</span>
          </div>
        )}
        {profile.email && (
          <div className="flex items-center gap-2.5 text-base-content/70">
            <Mail className="size-4 shrink-0 text-base-content/40" />
            <span>{profile.email}</span>
          </div>
        )}
        {profile.phoneNumber && (
          <div className="flex items-center gap-2.5 text-base-content/70">
            <Phone className="size-4 shrink-0 text-base-content/40" />
            <span>{profile.phoneNumber}</span>
          </div>
        )}
      </div>
    </div>
  );
}
