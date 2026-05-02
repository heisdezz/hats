import { createFileRoute } from "@tanstack/react-router";
import ProductStats from "./-components/ProductsStats";
import WelcomeHeader from "./-components/Welcomeheader";
import OrderStats from "./-components/OrderStats";

export const Route = createFileRoute("/admin/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="dash-wrap">
      <WelcomeHeader />
      <div className="flex flex-col gap-2 p-6 pt-0">
        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">
          Orders
        </p>
        <OrderStats />
      </div>
      <div className="flex flex-col gap-2 px-6">
        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">
          Products
        </p>
        <ProductStats />
      </div>
    </div>
  );
}
