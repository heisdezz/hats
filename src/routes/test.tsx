import { pb } from "#/client/pb";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

export const Route = createFileRoute("/test")({
  component: RouteComponent,
});

// const get_products = async () => {
//   const products = await pb.collection("products").getList(1, 10);
//   return products;
// };
//

import { usePlacesWidget } from "react-google-autocomplete";

export const PlacesInput = () => {
  const { ref } = usePlacesWidget({
    apiKey: import.meta.env.VITE_TEST_GOOGLE_MAPS_API_KEY as string,
    onPlaceSelected: (place) => {
      console.log(place);
    },
    options: {
      // types: ["(regions)"],
      componentRestrictions: { country: "ng" },
    },
  });

  return <input ref={ref} style={{ width: "90%" }} defaultValue="Amsterdam" />;
};
function RouteComponent() {
  return (
    <div className="bg-red-400 page-wrap">
      Hello "/test"!
      <div>ssasdd</div>
      <button
        className="btn btn-primary"
        onClick={() => {
          try {
            const call_api = pb.send("/register", {
              method: "POST",
            });
            toast.promise(call_api, {
              success: "success",
            });
          } catch (error) {
            console.error(error);
          }
        }}
      >
        Click me
      </button>
      <PlacesInput />
    </div>
  );
}
