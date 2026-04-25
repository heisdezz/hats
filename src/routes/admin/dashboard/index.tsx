import { createFileRoute } from "@tanstack/react-router";
import ProductStats from "./-components/ProductsStats";
import WelcomeHeader from "./-components/Welcomeheader";

export const Route = createFileRoute("/admin/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="dash-wrap">
      <WelcomeHeader />
      <ProductStats />
    </div>
  );
}
