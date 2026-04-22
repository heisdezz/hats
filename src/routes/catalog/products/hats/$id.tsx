import { createFileRoute } from "@tanstack/react-router";
import Skeleton from "../-components/Skeleton";
import Aside from "../-components/Aside";
import MainInfo from "../-components/MainInfo";
import { ssr_pb } from "#/client/pb";
import Pricing from "../-components/Pricing";

export const Route = createFileRoute("/catalog/products/hats/$id")({
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
    <Skeleton>
      {/*//@ts-ignore*/}
      <MainInfo product={data}></MainInfo>
      <Aside>
        {/*//@ts-ignore*/}
        <Pricing product={data} />
      </Aside>
    </Skeleton>
  );
}
