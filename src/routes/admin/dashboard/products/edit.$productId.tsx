import { createFileRoute, useNavigate, ClientOnly } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { pb } from "#/client/pb";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import PageLoader from "#/components/layouts/PageLoader";
import SimpleInput from "#/components/inputs/SimpleInput";
import LocalSelect from "#/components/inputs/LocalSelect";
import MDEditor from "@uiw/react-md-editor";
import UpdateImages from "#/components/inputs/UpdateImages";
import TagsInput, { type Tag } from "./-components/TagsInput";
import type {
  CategoryResponse,
  ProductsResponse,
  TagsResponse,
} from "pocketbase-types";

export const Route = createFileRoute(
  "/admin/dashboard/products/edit/$productId",
)({
  component: RouteComponent,
});

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  //@ts-ignore
  price: z.coerce.number({ invalid_type_error: "Enter a valid price" }).min(0),
  description: z.string().optional(),
  category: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function RouteComponent() {
  const { productId } = Route.useParams();

  const query = useQuery({
    queryKey: ["admin-product-details", productId],
    queryFn: () =>
      pb
        .collection("products")
        .getOne<ProductsResponse<{ category: CategoryResponse; tags: TagsResponse[] }>>(productId, {
          expand: "category,tags",
        }),
  });

  return (
    <main className="dash-wrap p-6">
      <PageLoader query={query}>
        {(product) => <UpdateForm product={product} />}
      </PageLoader>
    </main>
  );
}

type ExpandedProduct = ProductsResponse<{
  category: CategoryResponse;
  tags: TagsResponse[];
}>;

function UpdateForm({ product }: { product: ExpandedProduct }) {
  const { productId } = Route.useParams();
  const nav = useNavigate();

  const initialImages =
    product.images?.map((img) => ({
      url: pb.files.getURL(product, img),
      path: img,
    })) ?? [];

  const [keptImages, setKeptImages] = useState(initialImages);
  const [newImages, setNewImages] = useState<FileList | []>([]);
  const expandedTags = (product.expand as any)?.tags as TagsResponse[] | undefined;
  const [tags, setTags] = useState<Tag[]>(
    expandedTags?.map((t) => ({ tagName: t.name ?? "", tagId: t.id })) ?? [],
  );

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => pb.collection("category").getFullList<CategoryResponse>(),
  });

  //@ts-ignore
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: product.title ?? "",
      price: product.price ?? 0,
      description: product.description ?? "",
      category: "",
    },
  });

  // Set category after options load — the <select> can't match an ID value
  // against options that don't exist yet in the DOM.
  useEffect(() => {
    if (categoriesQuery.data && product.category) {
      methods.setValue("category", product.category);
    }
  }, [categoriesQuery.data]);

  const { register, handleSubmit, formState: { errors } } = methods;

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const fd = new FormData();
      fd.append("title", values.title);
      fd.append("price", String(values.price));
      if (values.description) fd.append("description", values.description);
      if (values.category) fd.append("category", values.category);
      fd.append("tags", JSON.stringify(tags));
      // Remove images that were deleted
      const removedImages = initialImages.filter(
        (img) => !keptImages.some((k) => k.path === img.path),
      );
      removedImages.forEach((img) => fd.append("images-", img.path));
      Array.from(newImages).forEach((file) => fd.append("images", file));
      return pb.collection("products").update(productId, fd);
    },
    onSuccess: () => nav({ to: "/admin/dashboard/products" }),
  });

  const onSubmit = (values: FormValues) => {
    toast.promise(mutation.mutateAsync(values), {
      loading: "Saving changes...",
      success: "Product updated!",
      error: "Failed to update product",
    });
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <p className="text-sm text-base-content/50 mt-1">
          Update the details below.
        </p>
      </div>

      <FormProvider {...methods}>
        <form
          //@ts-ignore
          onSubmit={handleSubmit(onSubmit)}
          className="card bg-base-100 border border-base-200 shadow-sm"
        >
          <div className="card-body gap-5">
            <SimpleInput
              label="Title"
              placeholder="e.g. Handwoven Straw Hat"
              {...register("title")}
              name="title"
            />

            <SimpleInput
              label="Price (₦)"
              type="number"
              placeholder="0"
              min={0}
              {...register("price")}
              name="price"
            />

            <LocalSelect
              label="Category"
              {...register("category")}
              name="category"
            >
              <option value="">No category</option>
              {categoriesQuery.data?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </LocalSelect>

            <TagsInput value={tags} onChange={setTags} />

            <div className="space-y-2" data-color-mode="light">
              <div className="fieldset-label font-semibold">
                <span className="text-sm">Description</span>
              </div>
              <Controller
                name="description"
                control={methods.control}
                render={({ field }) => (
                  <ClientOnly fallback={<div className="h-56 skeleton rounded-lg" />}>
                    <MDEditor
                      value={field.value}
                      onChange={field.onChange}
                      height={220}
                      preview="edit"
                    />
                  </ClientOnly>
                )}
              />
            </div>

            <div className="space-y-2">
              <div className="fieldset-label font-semibold">
                <span className="text-sm">Images</span>
              </div>
              <UpdateImages
                images={initialImages}
                setNew={setNewImages}
                setPrev={setKeptImages}
              />
            </div>

            {errors.root && (
              <div className="alert alert-error text-sm py-2">
                {errors.root.message}
              </div>
            )}

            <div className="card-actions justify-end pt-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => nav({ to: "/admin/dashboard/products" })}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
