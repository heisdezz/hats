import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pb } from "#/client/pb";
import PageLoader from "#/components/layouts/PageLoader";
import AdminProductCard from "../-components/AdminProductCard";
import GridContainer from "#/components/GridContainer";
import ProductStats from "../-components/ProductsStats";
import RouteHeader from "../../-components/RouteHeader";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/dashboard/products/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useQuery({
    queryKey: ["products-admin-list"],
    queryFn: () =>
      pb.collection("products").getList(1, 10, {
        expand: "category.parent",
      }),
  });
  return (
    <main className="dash-wrap">
      <RouteHeader title="Products" subtitle="Manage your products here">
        <Link
          to="/admin/dashboard/products/new"
          className="btn btn-primary btn-lg"
        >
          Add Product
        </Link>
      </RouteHeader>
      <ProductStats />
      <PageLoader query={query}>
        {({ items }) => (
          <GridContainer>
            {items.map((product) => (
              //@ts-ignore
              <AdminProductCard key={product.id} product={product} />
            ))}
          </GridContainer>
        )}
      </PageLoader>
    </main>
  );
}
