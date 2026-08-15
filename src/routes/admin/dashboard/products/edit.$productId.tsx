import {
  createFileRoute,
  useNavigate,
  ClientOnly,
} from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import ColorPicker from "#/components/inputs/ColorPicker";
import TagsInput, { type Tag, parseProductTags } from "./-components/TagsInput";
import type {
  CategoryResponse,
  ProductsResponse,
  TagsResponse,
} from "pocketbase-types";
import {
  Sparkles,
  Eye,
  CheckCircle2,
  Palette,
  Layers,
  ArrowLeft,
  Sliders,
} from "lucide-react";

export const Route = createFileRoute(
  "/admin/dashboard/products/edit/$productId",
)({
  component: RouteComponent,
});

const COLOR_PRESETS = [
  { name: "Obsidian Black", hex: "#111111" },
  { name: "Pearl White", hex: "#FFFFFF" },
  { name: "Royal Gold", hex: "#D4AF37" },
  { name: "Burgundy", hex: "#800020" },
  { name: "Emerald Green", hex: "#046307" },
  { name: "Midnight Navy", hex: "#001F3F" },
  { name: "Champagne", hex: "#F7E7CE" },
  { name: "Rose Gold", hex: "#B76E79" },
  { name: "Coral Red", hex: "#FF4040" },
  { name: "Rich Purple", hex: "#4B0082" },
];

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  //@ts-ignore
  price: z.coerce.number({ invalid_type_error: "Enter a valid price" }).min(0),
  cart_space: z.coerce.number().min(1).default(1),
  description: z.string().optional(),
  category: z.string().optional(),
  mainColor: z.string().default("#111111"),
  secondaryColor: z.string().default("#FFFFFF"),
  color_selection: z.boolean().default(true),
  published: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

function RouteComponent() {
  const { productId } = Route.useParams();

  const query = useQuery({
    queryKey: ["admin-product-details", productId],
    queryFn: () =>
      pb
        .collection("products")
        .getOne<
          ProductsResponse<{ category: CategoryResponse; tags: TagsResponse[] }>
        >(productId, {
          expand: "category,tags",
        }),
  });

  return (
    <main className="dash-wrap p-6 space-y-6 max-w-6xl">
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
  const queryClient = useQueryClient();

  const initialImages =
    product.images?.map((img) => ({
      url: pb.files.getURL(product, img),
      path: img,
    })) ?? [];

  const [keptImages, setKeptImages] = useState(initialImages);
  const [newImages, setNewImages] = useState<FileList | []>([]);
  const [tags, setTags] = useState<Tag[]>(() => parseProductTags(product));

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => pb.collection("category").getFullList<CategoryResponse>({
      expand: "parent",
      sort: "name",
    }),
  });

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      title: product.title ?? "",
      price: product.price ?? 0,
      cart_space: (product as any).cart_space || 1,
      description: product.description ?? "",
      category: product.category ?? "",
      mainColor: (product as any).mainColor || "#111111",
      secondaryColor: (product as any).secondaryColor || "#FFFFFF",
      color_selection: (product as any).color_selection ?? true,
      published: product.published ?? true,
    },
  });

  useEffect(() => {
    if (categoriesQuery.data && product.category) {
      methods.setValue("category", product.category);
    }
  }, [categoriesQuery.data, product.category]);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = methods;

  const watchedTitle = watch("title");
  const watchedPrice = watch("price");
  const watchedMainColor = watch("mainColor");
  const watchedSecondaryColor = watch("secondaryColor");
  const watchedColorSelection = watch("color_selection");
  const watchedPublished = watch("published");
  const watchedCategory = watch("category");

  const updateProductMut = useMutation({
    mutationFn: async (values: FormValues) => {
      const fd = new FormData();
      fd.append("title", values.title);
      fd.append("price", String(values.price));
      fd.append("cart_space", String(values.cart_space || 1));
      if (values.description !== undefined) fd.append("description", values.description);
      if (values.category !== undefined) fd.append("category", values.category);
      fd.append("mainColor", values.mainColor || "#111111");
      fd.append("secondaryColor", values.secondaryColor || "#FFFFFF");
      fd.append("color_selection", String(values.color_selection));
      fd.append("published", String(values.published));

      if (tags.length > 0) {
        fd.append("tags", JSON.stringify(tags));
      } else {
        fd.append("tags", "[]");
      }

      if (newImages && newImages.length > 0) {
        for (let i = 0; i < newImages.length; i++) {
          fd.append("images", newImages[i]);
        }
      }

      if (keptImages.length > 0) {
        for (const img of keptImages) {
          fd.append("images", img.path);
        }
      }

      return await pb.collection("products").update(productId, fd);
    },
    onSuccess: () => {
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product-details", productId] });
      nav({ to: "/admin/dashboard/products" });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update product.");
    },
  });

  const onSubmit = (data: FormValues) => {
    updateProductMut.mutate(data);
  };

  const selectedCategoryObj = categoriesQuery.data?.find(
    (c) => c.id === watchedCategory
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => nav({ to: "/admin/dashboard/products" })}
            className="btn btn-circle btn-ghost btn-sm"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
            <p className="text-xs text-base-content/60 mt-0.5">
              Updating details for <span className="font-semibold text-base-content">{product.title}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => nav({ to: "/admin/dashboard/products" })}
            className="btn btn-ghost btn-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={updateProductMut.isPending}
            className="btn btn-primary btn-sm px-5"
          >
            {updateProductMut.isPending ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Core Product Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Details Card */}
              <div className="card bg-base-100 border border-base-200 shadow-xs">
                <div className="card-body p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-base-200 font-bold text-sm">
                    <Sparkles className="size-4 text-primary" />
                    <span>Product Overview</span>
                  </div>

                  <SimpleInput
                    label="Product Title *"
                    placeholder="e.g. Royal Emerald Fascinator with Silk Veil"
                    {...register("title")}
                    name="title"
                  />
                  {errors.title && (
                    <p className="text-xs text-error -mt-2">{errors.title.message}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SimpleInput
                      label="Price (₦) *"
                      type="number"
                      placeholder="0"
                      min={0}
                      {...register("price")}
                      name="price"
                    />
                    <SimpleInput
                      label="Cart Space (Units)"
                      type="number"
                      placeholder="1"
                      min={1}
                      max={20}
                      {...register("cart_space")}
                      name="cart_space"
                    />
                    <LocalSelect
                      label="Category"
                      {...register("category")}
                      name="category"
                    >
                      <option value="">No category selected</option>
                      {categoriesQuery.data?.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} {cat.expand?.parent ? `(${cat.expand.parent.name})` : ""}
                        </option>
                      ))}
                    </LocalSelect>
                  </div>

                  <TagsInput value={tags} onChange={setTags} />
                </div>
              </div>

              {/* Color Selection Card */}
              <div className="card bg-base-100 border border-base-200 shadow-xs">
                <div className="card-body p-6 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-base-200">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Palette className="size-4 text-primary" />
                      <span>Product Color Settings</span>
                    </div>
                    <span className="text-xs text-base-content/50">
                      Default & custom options
                    </span>
                  </div>

                  {/* Customer Custom Color Selection Toggle */}
                  <label className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-base-200/50 hover:bg-base-200 transition-colors border border-base-200 cursor-pointer">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <Sliders className="size-3.5 text-primary" />
                        <span>Allow Customer Color Customization</span>
                      </div>
                      <p className="text-[11px] text-base-content/60 leading-relaxed">
                        When enabled, shoppers can pick custom colors during purchase. When disabled, the product will be ordered in its default colors.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary toggle-sm mt-1 shrink-0"
                      {...register("color_selection")}
                    />
                  </label>

                  {/* Preset quick pills */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-semibold text-base-content/60">
                      Default Preset Swatches
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setValue("mainColor", preset.hex);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-200/70 hover:bg-base-200 text-xs transition-colors border border-base-300"
                        >
                          <span
                            className="size-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span className="text-[11px] font-medium">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <Controller
                      name="mainColor"
                      control={control}
                      render={({ field }) => (
                        <ColorPicker
                          label="Default Primary Color (Base)"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    <Controller
                      name="secondaryColor"
                      control={control}
                      render={({ field }) => (
                        <ColorPicker
                          label="Default Secondary Color (Accent)"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Rich Description */}
              <div className="card bg-base-100 border border-base-200 shadow-xs">
                <div className="card-body p-6 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-base-200 font-bold text-sm">
                    <Layers className="size-4 text-primary" />
                    <span>Story, Fit & Material Description</span>
                  </div>
                  <div data-color-mode="light">
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <ClientOnly
                          fallback={<div className="h-56 skeleton rounded-xl" />}
                        >
                          <MDEditor
                            value={field.value}
                            onChange={field.onChange}
                            height={240}
                            preview="edit"
                          />
                        </ClientOnly>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Media, Visibility, and Preview Card */}
            <div className="space-y-6">
              {/* Visibility & Status Card */}
              <div className="card bg-base-100 border border-base-200 shadow-xs">
                <div className="card-body p-6 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-base-200">
                    <span className="font-bold text-sm">Publishing Status</span>
                    <span
                      className={`badge badge-sm font-semibold ${
                        watchedPublished ? "badge-success text-success-content" : "badge-neutral"
                      }`}
                    >
                      {watchedPublished ? "Active & Published" : "Draft / Hidden"}
                    </span>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-base-200/50 hover:bg-base-200 transition-colors border border-base-200">
                    <input
                      type="checkbox"
                      className="toggle toggle-primary toggle-sm mt-0.5"
                      {...register("published")}
                    />
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-base-content">Publish to Catalog</p>
                      <p className="text-base-content/60">
                        When enabled, customers can view and order this item in the store.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Product Images Upload */}
              <div className="card bg-base-100 border border-base-200 shadow-xs">
                <div className="card-body p-6 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-base-200">
                    <span className="font-bold text-sm">Product Gallery</span>
                    <span className="text-xs text-base-content/50">Multi-image management</span>
                  </div>
                  <UpdateImages
                    images={initialImages}
                    setNew={setNewImages}
                    setPrev={setKeptImages}
                  />
                </div>
              </div>

              {/* Live Catalog Preview */}
              <div className="card bg-base-100 border border-base-200 shadow-xs">
                <div className="card-body p-6 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-base-200 font-bold text-sm">
                    <Eye className="size-4 text-primary" />
                    <span>Live Preview</span>
                  </div>

                  <div className="border border-base-200 rounded-2xl overflow-hidden bg-base-100 shadow-xs">
                    <div className="aspect-square bg-base-200/70 relative">
                      {keptImages.length > 0 ? (
                        <img
                          src={keptImages[0].url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-base-content/30 gap-1">
                          <Palette className="size-8 opacity-30" />
                          <span className="text-xs">No image selected</span>
                        </div>
                      )}

                      {/* Top status indicator */}
                      <span
                        className={`badge badge-xs absolute top-2 right-2 ${
                          watchedPublished ? "badge-success" : "badge-neutral"
                        }`}
                      >
                        {watchedPublished ? "Published" : "Draft"}
                      </span>

                      {/* Colors indicator */}
                      <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-base-100/90 backdrop-blur-md px-2 py-1 rounded-full shadow-xs">
                        <span
                          className="size-3 rounded-full border border-black/20"
                          style={{ backgroundColor: watchedMainColor }}
                        />
                        <span
                          className="size-3 rounded-full border border-black/20"
                          style={{ backgroundColor: watchedSecondaryColor }}
                        />
                        {watchedColorSelection && (
                          <span className="text-[9px] uppercase font-bold text-primary">Custom</span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 space-y-1">
                      {selectedCategoryObj && (
                        <p className="text-[10px] uppercase font-bold text-base-content/50">
                          {selectedCategoryObj.name}
                        </p>
                      )}
                      <p className="font-semibold text-sm line-clamp-1">
                        {watchedTitle || "Untitled Luxury Item"}
                      </p>
                      <p className="text-primary font-bold text-sm">
                        ₦{(Number(watchedPrice) || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => nav({ to: "/admin/dashboard/products" })}
                  className="btn btn-ghost rounded-xl flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="btn btn-primary rounded-xl flex-1 gap-2"
                >
                  {mutation.isPending ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
