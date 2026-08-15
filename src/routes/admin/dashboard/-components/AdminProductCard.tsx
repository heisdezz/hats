import { pb } from "#/client/pb";
import type {
  CategoryResponse,
  ProductsResponse,
  SectionResponse,
} from "pocketbase-types";
import { Pencil, Trash2, ToggleLeft, ToggleRight, Eye, EyeOff } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminProductCard({
  product,
}: {
  product: ProductsResponse<{
    category: CategoryResponse<{ parent: Partial<SectionResponse> }>;
  }>;
}) {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const imageUrl = product.preview
    ? pb.files.getURL(product, product.preview)
    : product.images?.length
      ? pb.files.getURL(product, product.images[0])
      : null;

  const category = product.expand?.category?.name;
  const section = product.expand?.category?.expand?.parent?.name;
  const isPublished = product.published ?? true;
  const mainColor = (product as any).mainColor;
  const secondaryColor = (product as any).secondaryColor;

  const togglePublishedMut = useMutation({
    mutationFn: () =>
      pb.collection("products").update(product.id, {
        published: !isPublished,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products-admin-list"] });
      queryClient.invalidateQueries({ queryKey: ["product-stats"] });
      toast.success(
        !isPublished
          ? `Published "${product.title}" to catalog`
          : `Unpublished "${product.title}" (moved to drafts)`
      );
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update status");
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => pb.collection("products").delete(product.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products-admin-list"] });
      queryClient.invalidateQueries({ queryKey: ["product-stats"] });
      toast.success(`Deleted "${product.title}"`);
      setConfirmDelete(false);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete product");
    },
  });

  return (
    <div className="card bg-base-100 border border-base-200 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden group flex flex-col justify-between">
      <div>
        <figure className="aspect-square bg-base-200/70 relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title ?? "Product"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-base-content/20 text-xs">
              No image
            </div>
          )}

          {/* Top Status & Section Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
            <span
              className={`badge badge-xs font-bold uppercase tracking-wider shadow-xs ${
                isPublished
                  ? "badge-success text-success-content"
                  : "badge-neutral text-neutral-content/70"
              }`}
            >
              {isPublished ? "Published" : "Draft"}
            </span>

            {section && (
              <span className="badge badge-neutral/80 backdrop-blur-md badge-xs text-[10px]">
                {section}
              </span>
            )}
          </div>

          {/* Color Dots Pill */}
          {(mainColor || secondaryColor) && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-base-100/90 backdrop-blur-md px-1.5 py-1 rounded-full shadow-xs">
              {mainColor && (
                <span
                  className="size-2.5 rounded-full border border-black/20"
                  style={{ backgroundColor: mainColor }}
                  title={`Primary: ${mainColor}`}
                />
              )}
              {secondaryColor && (
                <span
                  className="size-2.5 rounded-full border border-black/20"
                  style={{ backgroundColor: secondaryColor }}
                  title={`Secondary: ${secondaryColor}`}
                />
              )}
            </div>
          )}

          {/* Hover Action Floating Bar */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              onClick={() => togglePublishedMut.mutate()}
              disabled={togglePublishedMut.isPending}
              className="btn btn-xs btn-circle bg-base-100/90 backdrop-blur-md border-0 shadow-md hover:bg-base-100"
              title={isPublished ? "Hide from catalog" : "Publish to catalog"}
            >
              {isPublished ? (
                <EyeOff className="size-3 text-warning" />
              ) : (
                <Eye className="size-3 text-success" />
              )}
            </button>

            <Link
              to="/admin/dashboard/products/edit/$productId"
              params={{ productId: product.id }}
              className="btn btn-xs btn-circle bg-base-100/90 backdrop-blur-md border-0 shadow-md hover:bg-base-100"
              title="Edit product"
            >
              <Pencil className="size-3 text-primary" />
            </Link>

            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="btn btn-xs btn-circle bg-base-100/90 backdrop-blur-md border-0 shadow-md hover:bg-error/10 text-error"
              title="Delete product"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        </figure>

        <div className="p-3.5 space-y-1">
          {category && (
            <span className="text-[10px] text-base-content/40 font-bold uppercase tracking-wider">
              {category}
            </span>
          )}
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-base-content hover:text-primary transition-colors">
            <Link
              to="/admin/dashboard/products/edit/$productId"
              params={{ productId: product.id }}
            >
              {product.title ?? "Untitled"}
            </Link>
          </h3>
        </div>
      </div>

      <div className="p-3.5 pt-0 flex items-center justify-between border-t border-base-200/50 mt-1">
        <p className="text-primary font-bold text-sm">
          ₦{(product.price ?? 0).toLocaleString()}
        </p>

        {/* Quick toggle switch */}
        <button
          type="button"
          onClick={() => togglePublishedMut.mutate()}
          disabled={togglePublishedMut.isPending}
          className="btn btn-ghost btn-xs text-xs gap-1 px-1.5"
          title="Toggle published status"
        >
          {isPublished ? (
            <>
              <span className="text-[11px] text-success font-medium">Live</span>
              <ToggleRight className="size-4 text-success" />
            </>
          ) : (
            <>
              <span className="text-[11px] text-base-content/40 font-medium">Draft</span>
              <ToggleLeft className="size-4 text-base-content/30" />
            </>
          )}
        </button>
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card bg-base-100 border border-base-200 shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-error">
              <div className="size-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                <Trash2 className="size-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-base-content">Delete Product?</h4>
                <p className="text-xs text-base-content/60">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-base-content/80 font-medium bg-base-200/50 p-2.5 rounded-lg">
              "{product.title}"
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="btn btn-sm btn-ghost rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMut.mutate()}
                disabled={deleteMut.isPending}
                className="btn btn-sm btn-error rounded-lg"
              >
                {deleteMut.isPending ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
