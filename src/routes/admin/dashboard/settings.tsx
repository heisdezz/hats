import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/dashboard/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div className="dash-wrap">Hello "/admin/dashboard/settings"!</div>;
}
