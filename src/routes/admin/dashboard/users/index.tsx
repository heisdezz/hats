import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pb } from "#/client/pb";
import PageLoader from "#/components/layouts/PageLoader";
import GridContainer from "#/components/GridContainer";
import UserCard from "../-components/UserCard";
import type { ProfileResponse } from "pocketbase-types";

export const Route = createFileRoute("/admin/dashboard/users/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => pb.collection("profile").getList<ProfileResponse>(1, 50),
  });

  return (
    <main className="dash-wrap p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-base-content/50 mt-1">
          All registered customer profiles.
        </p>
      </div>
      <PageLoader query={query}>
        {({ items }) => (
          <GridContainer>
            {items.map((profile) => (
              <UserCard key={profile.id} profile={profile} />
            ))}
          </GridContainer>
        )}
      </PageLoader>
    </main>
  );
}
