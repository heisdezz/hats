import { pb } from "#/client/pb";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/test")({
  component: RouteComponent,
});

// const get_products = async () => {
//   const products = await pb.collection("products").getList(1, 10);
//   return products;
// };
function RouteComponent() {
  return (
    <div className="bg-red-400">
      Hello "/test"!
      <div>ssasdd</div>
      asdadasda
    </div>
  );
}
