import { createFileRoute } from "@tanstack/react-router";
import { useProfile } from "#/store/user";
import { useDeliverySettings } from "#/store/delivery";
import ProfileSidebar from "./-components/ProfileSidebar";
import AccountDetails from "./-components/AccountDetails";
import ShippingAddress from "./-components/ShippingAddress";
import { pb } from "#/client/pb";
import { useEffect } from "react";

export const Route = createFileRoute("/profile/")({
  component: RouteComponent,
});

const get_profile = async () => {
  let resp = await pb.send("profile/me", {
    method: "GET",
  });

  return resp.data;
};
function RouteComponent() {
  const user = pb.authStore.record;

  const profile = useProfile((s) => s.profile);
  const delivery = useDeliverySettings((s) => s.delivery_settings);
  useEffect(() => {
    if (!profile || user?.collectionName != "admins") {
      const fetch_profile = async () => {
        const profile = await get_profile();
      };
      fetch_profile();
    }
  }, [profile]);
  if (user?.collectionName == "admins") {
    return (
      <div className="page-wrap grid place-items-center text-base-content/40 text-sm">
        You are an admin.
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-wrap grid place-items-center text-base-content/40 text-sm">
        Not logged in.
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="page-wrap grid place-items-center text-base-content/40 text-sm">
        Loading...
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
