import { createFileRoute } from "@tanstack/react-router";
import MainInfo from "../-components/MainInfo";
import { ssr_pb } from "#/client/pb.ts";
import Skeleton from "../-components/Skeleton";
import Aside from "../-components/Aside";
import DeliverySettings from "#/components/DeliverySettings";
import JewelryPricing from "../-components/JewelryPricing";
export const Route = createFileRoute("/store/catalog/products/jewelry/$id")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const pb = ssr_pb();
    return await pb.collection("products").getOne(params.id, {
      expand: "category.parent",
    });
  },
});

function RouteComponent() {
  const data = Route.useLoaderData();
  return (
    <Skeleton className="page-wrap">
      <MainInfo product={data}></MainInfo>
      <Aside>
        <JewelryPricing product={data} />
        <DeliverySettings />
      </Aside>
    </Skeleton>
  );
}
