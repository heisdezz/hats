import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pb } from "#/client/pb";
import PageLoader from "#/components/layouts/PageLoader";
import CustomTable, { type columnType } from "#/components/tables/CustomTable";
import type { Actions } from "#/components/tables/pop-up";
import type { ProfileResponse } from "pocketbase-types";

export const Route = createFileRoute("/admin/dashboard/users/")({
  component: RouteComponent,
});

const columns: columnType<ProfileResponse>[] = [
  {
    key: "firstName",
    label: "Name",
    render: (_, item) => {
      const fullName =
        [item.firstName, item.lastName].filter(Boolean).join(" ") || null;
      const initials =
        [item.firstName?.[0], item.lastName?.[0]]
          .filter(Boolean)
          .join("")
          .toUpperCase() || "?";
      return (
        <div className="flex items-center gap-3">
          <div className="avatar avatar-placeholder shrink-0">
            <div className="bg-primary/10 text-primary rounded-full w-9 h-9 font-bold text-xs">
              <span>{initials}</span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm leading-tight">
              {fullName ?? (
                <span className="text-base-content/30 italic">No name</span>
              )}
            </p>
            {item.username && (
              <p className="text-xs text-base-content/40">@{item.username}</p>
            )}
          </div>
        </div>
      );
    },
  },
  { key: "email", label: "Email" },
  {
    key: "phoneNumber",
    label: "Phone",
    render: (val) =>
      val ? (
        <span>{val}</span>
      ) : (
        <span className="text-base-content/30">—</span>
      ),
  },
  {
    key: "sex",
    label: "Sex",
    render: (val) => val || <span className="text-base-content/30">—</span>,
  },
  {
    key: "age",
    label: "Age",
    render: (val) =>
      val ? `${val} yrs` : <span className="text-base-content/30">—</span>,
  },
];

function RouteComponent() {
  const nav = useNavigate();

  const query = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => pb.collection("profile").getList<ProfileResponse>(1, 50),
  });

  const actions: Actions<ProfileResponse>[] = [
    {
      key: "view",
      label: "View profile",
      action: (item) => {
        nav({
          to: "/admin/dashboard/users/$userId",
          params: { userId: item.id as string },
        });

        // nav({
        //   to: "/admin/dashboard/users/$userId",
        //   params: { userId: item.id as string },
        // });
      },
    },
  ];

  return (
    <main className="dash-wrap p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        {query.data && (
          <p className="text-sm text-base-content/50 mt-1">
            {query.data.totalItems} registered profiles
          </p>
        )}
      </div>
      <PageLoader query={query}>
        {({ items }) => (
          <CustomTable data={items} columns={columns} actions={actions} />
        )}
      </PageLoader>
    </main>
  );
}
