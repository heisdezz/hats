import { pb, ssr_pb } from "#/client/pb";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import PageLoader from "#/components/layouts/PageLoader";
import Pagination from "#/components/Pagination";
import type { UsersResponse } from "#/../pocketbase-types";
import { ShieldCheck, ShieldOff } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard/users")({
  validateSearch: (s: Record<string, unknown>) => ({
    page: Number(s.page) || 1,
  }),
  component: RouteComponent,
  loader: () =>
    ssr_pb().collection("users").getList(1, 20, { sort: "-created" }),
});

function RouteComponent() {
  const loaderData = Route.useLoaderData();
  const { page } = Route.useSearch();

  const query = useQuery({
    queryKey: ["admin-users", page],
    queryFn: () =>
      pb.collection("users").getList<UsersResponse>(page, 20, {
        sort: "-created",
      }),
    initialData: page === 1 ? loaderData : undefined,
  });

  return (
    <section className="page-wrap flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Users</h2>
          {query.data && (
            <p className="text-sm text-base-content/40 mt-0.5">
              {query.data.totalItems} registered
            </p>
          )}
        </div>
      </div>

      <PageLoader query={query}>
        {(data) =>
          data.items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-base-content/40">
              <p className="text-sm">No users found.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="overflow-x-auto rounded-xl border border-base-200">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-base-200/60 text-xs uppercase tracking-wider text-base-content/50">
                      <th>User</th>
                      <th>Username</th>
                      <th className="text-center">Verified</th>
                      <th className="text-right">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((user) => {
                      const avatarUrl = user.avatar
                        ? pb.files.getURL(user, user.avatar)
                        : null;
                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-base-200/40 transition-colors"
                        >
                          <td>
                            <div className="flex items-center gap-3">
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={user.username}
                                  className="size-8 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <div className="size-8 rounded-full bg-base-300 flex items-center justify-center text-xs font-bold text-base-content/40 shrink-0">
                                  {user.email?.[0]?.toUpperCase() ?? "?"}
                                </div>
                              )}
                              <span className="text-sm">{user.email}</span>
                            </div>
                          </td>
                          <td className="text-sm text-base-content/60">
                            {user.username || (
                              <span className="text-base-content/30">—</span>
                            )}
                          </td>
                          <td className="text-center">
                            {user.verified ? (
                              <ShieldCheck
                                size={16}
                                className="text-success mx-auto"
                              />
                            ) : (
                              <ShieldOff
                                size={16}
                                className="text-base-content/30 mx-auto"
                              />
                            )}
                          </td>
                          <td className="text-right text-xs text-base-content/50 whitespace-nowrap">
                            {new Date(user.created).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <Pagination page={page} totalPages={data.totalPages} />
            </div>
          )
        }
      </PageLoader>
    </section>
  );
}
