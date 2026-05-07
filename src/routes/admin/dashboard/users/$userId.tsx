import { pb } from "#/client/pb";
import PageLoader from "#/components/layouts/PageLoader";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type {
  ProductsResponse,
  ProfileResponse,
  UserOrdersResponse,
} from "pocketbase-types";
import { Mail, Phone, User, ArrowLeft, Package } from "lucide-react";
import CustomTable, { type columnType } from "#/components/tables/CustomTable";

export const Route = createFileRoute("/admin/dashboard/users/$userId")({
  component: RouteComponent,
});

const STATUS_STYLES: Record<string, string> = {
  pending: "badge-warning",
  processing: "badge-info",
  "in-transit": "badge-primary",
  delivered: "badge-success",
};

const orderColumns: columnType<
  OrdersResponse<{ product: ProductsResponse }>
>[] = [
  {
    key: "id",
    label: "Order ID",
    render: (val) => (
      <span className="font-mono text-xs text-base-content/40">
        #{(val as string).slice(0, 10)}
      </span>
    ),
  },
  {
    key: "product",
    label: "Product",
    render: (_, item) =>
      item.expand?.product?.title ?? (
        <span className="text-base-content/30 italic">Unknown</span>
      ),
  },
  {
    key: "price",
    label: "Price",
    render: (val) =>
      val != null ? `₦${(val as number).toLocaleString()}` : "—",
  },
  {
    key: "deliveryFee",
    label: "Delivery",
    render: (val) =>
      val != null ? `₦${(val as number).toLocaleString()}` : "—",
  },
  {
    key: "status",
    label: "Status",
    render: (val) =>
      val ? (
        <span
          className={`badge ${STATUS_STYLES[val as string] ?? "badge-neutral"} capitalize`}
        >
          {val as string}
        </span>
      ) : (
        "—"
      ),
  },
  {
    key: "created",
    label: "Date",
    render: (val) => (
      <span className="text-xs text-base-content/50">
        {new Date(val as string).toLocaleDateString()}
      </span>
    ),
  },
];

function RouteComponent() {
  const { userId } = Route.useParams();

  const profileQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => pb.collection("profile").getOne<ProfileResponse>(userId),
  });

  const ordersQuery = useQuery({
    queryKey: ["user-orders", userId],
    queryFn: () =>
      pb
        .collection("orders")
        .getList<UserOrdersResponse<{ product: ProductsResponse }>>(1, 50, {
          // filter: pb.filter("user = {:id}", { id: userId }),
          expand: "product",
          sort: "-created",
        }),
    enabled: !!userId,
  });

  return (
    <main className="dash-wrap p-6 space-y-6">
      <Link
        to="/admin/dashboard/users"
        className="inline-flex items-center gap-1.5 text-sm text-base-content/50 hover:text-base-content transition-colors"
      >
        <ArrowLeft size={14} />
        Back to users
      </Link>

      <PageLoader query={profileQuery}>
        {(profile) => <ProfileCard profile={profile} />}
      </PageLoader>

      <section>
        <h2 className="text-lg font-semibold mb-3">Orders</h2>
        <PageLoader query={ordersQuery}>
          {({ items }) =>
            items.length === 0 ? (
              <div className="card bg-base-100 border border-base-200">
                <div className="card-body items-center py-10 text-base-content/40">
                  <Package size={32} strokeWidth={1.5} />
                  <p className="text-sm mt-2">No orders yet</p>
                </div>
              </div>
            ) : (
              <CustomTable data={items} columns={orderColumns} />
            )
          }
        </PageLoader>
      </section>
    </main>
  );
}

function ProfileCard({ profile }: { profile: ProfileResponse }) {
  const fullName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") || null;
  const initials =
    [profile.firstName?.[0], profile.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">
      <div className="card-body p-6 flex-row flex-wrap gap-5 items-center">
        <div className="avatar avatar-placeholder shrink-0">
          <div className="bg-primary/10 text-primary rounded-full w-16 h-16 text-xl font-bold">
            <span>{initials}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">
            {fullName ?? (
              <span className="text-base-content/30 italic">No name</span>
            )}
          </h1>
          {profile.username && (
            <p className="text-sm text-base-content/50">@{profile.username}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-base-content/60">
          {profile.email && (
            <div className="flex items-center gap-2">
              <Mail size={14} />
              {profile.email}
            </div>
          )}
          {profile.phoneNumber ? (
            <div className="flex items-center gap-2">
              <Phone size={14} />
              {profile.phoneNumber}
            </div>
          ) : null}
          {(profile.age || profile.sex) && (
            <div className="flex items-center gap-2">
              <User size={14} />
              {[profile.sex, profile.age ? `${profile.age} yrs` : null]
                .filter(Boolean)
                .join(" · ")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
