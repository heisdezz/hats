import { pb } from "#/client/pb";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";

const check_user = createIsomorphicFn().client(() => {
  const user = pb.authStore.record;
  if (!user)
    return redirect({
      to: "/",
    });

  if (user.collectionName != "admins") {
    return redirect({
      to: "/",
    });
  }
});
export const Route = createFileRoute("/admin")({
  component: RouteComponent,
  loader: check_user,
});

function RouteComponent() {
  return <Outlet />;
}
