import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/orders/$orderId")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className="page-wrap">
        <Outlet />
      </div>
    </>
  );
}
