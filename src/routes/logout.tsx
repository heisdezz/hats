import { pb } from "#/client/pb";
import { useProfile } from "#/store/user";
import { createFileRoute } from "@tanstack/react-router";
import { createClientOnlyFn, createIsomorphicFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { toast } from "sonner";

const logout = createIsomorphicFn().client(() => {
  pb.authStore.clear();
  useProfile.getState().clearProfile();
  useProfile.persist.clearStorage();
  toast.success("Logged out successfully");
  return (window.location.href = "/");
  return redirect({ to: "/" });
});
export const Route = createFileRoute("/logout")({
  component: RouteComponent,
  loader: () => logout(),
});

function RouteComponent() {
  return <div>Hello "/logout"!</div>;
}
