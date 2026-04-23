import { createFileRoute } from "@tanstack/react-router";
import { useProfile } from "#/store/user";
import { useDeliverySettings } from "#/store/delivery";
import ProfileSidebar from "./-components/ProfileSidebar";
import AccountDetails from "./-components/AccountDetails";
import ShippingAddress from "./-components/ShippingAddress";

export const Route = createFileRoute("/profile/")({
  component: RouteComponent,
});

function RouteComponent() {
  const profile = useProfile((s) => s.profile);
  const delivery = useDeliverySettings((s) => s.delivery_settings);

  if (!profile) {
    return (
      <div className="page-wrap grid place-items-center text-base-content/40 text-sm">
        Not logged in.
      </div>
    );
  }

  return (
    <div className="page-wrap flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start">
        <ProfileSidebar profile={profile} delivery={delivery} />

        <div className="flex flex-col gap-4">
          <AccountDetails profile={profile} />
          <ShippingAddress delivery={delivery} />
        </div>
      </div>
    </div>
  );
}
