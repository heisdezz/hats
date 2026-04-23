import { Pencil } from "lucide-react";
import type { ProfileRecord } from "pocketbase-types";

function Row({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-base-200 last:border-0 text-sm">
      <span className="text-base-content/50">{label}</span>
      <span className="font-medium">{value ?? "—"}</span>
    </div>
  );
}

export default function AccountDetails({ profile }: { profile: ProfileRecord }) {
  const sexLabel = profile.sex
    ? profile.sex.charAt(0).toUpperCase() + profile.sex.slice(1)
    : undefined;

  return (
    <div className="bg-base-100 ring fade rounded-2xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-base-200">
        <h3 className="font-semibold">Account Details</h3>
        <button className="btn btn-ghost btn-xs btn-square">
          <Pencil className="size-4" />
        </button>
      </div>
      <div className="px-5">
        <Row label="First Name" value={profile.firstName} />
        <Row label="Last Name" value={profile.lastName} />
        <Row label="Username" value={profile.username} />
        <Row label="Age" value={profile.age} />
        <Row label="Gender" value={sexLabel} />
      </div>
    </div>
  );
}
