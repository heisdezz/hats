import { Footer } from "#/components/footer.tsx";
import { Header } from "#/components/header.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/store")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Header></Header>
      <Outlet />
      <Footer />
    </>
  );
}
