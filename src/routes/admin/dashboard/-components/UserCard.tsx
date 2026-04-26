import type { ProfileResponse } from "pocketbase-types";
import { Mail, Phone, User } from "lucide-react";
import { Link } from "@tanstack/react-router";

export default function UserCard({ profile }: { profile: ProfileResponse }) {
  const fullName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") || null;
  const initials =
    [profile.firstName?.[0], profile.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  return (
    <Link
      to={`/admin/dashboard/users/${profile.id}`}
      className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="card-body p-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="avatar avatar-placeholder shrink-0">
            <div className="bg-primary/10 text-primary rounded-full w-12 h-12 font-bold text-sm">
              <span>{initials}</span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-tight truncate">
              {fullName ?? (
                <span className="text-base-content/30 italic">No name</span>
              )}
            </p>
            {profile.username && (
              <p className="text-xs text-base-content/50 truncate">
                @{profile.username}
              </p>
            )}
          </div>
        </div>

        <div className="divider my-0" />

        <div className="flex flex-col gap-1.5 text-xs text-base-content/60">
          {profile.email && (
            <div className="flex items-center gap-2 min-w-0">
              <Mail size={12} className="shrink-0" />
              <span className="truncate">{profile.email}</span>
            </div>
          )}
          {profile.phoneNumber ? (
            <div className="flex items-center gap-2">
              <Phone size={12} className="shrink-0" />
              <span>{profile.phoneNumber}</span>
            </div>
          ) : null}
          {(profile.age || profile.sex) && (
            <div className="flex items-center gap-2">
              <User size={12} className="shrink-0" />
              <span>
                {[profile.sex, profile.age ? `${profile.age} yrs` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
