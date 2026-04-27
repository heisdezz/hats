import { pb } from "#/client/pb";
import CompLoader from "#/components/layouts/ComponentLoader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartResponse, ProductsResponse } from "pocketbase-types";
import { toast } from "sonner";

type CartItem = CartResponse<{ product: ProductsResponse }>;

export default function CartItems() {
  const cart_query = useQuery({
    queryKey: ["cart"],
    queryFn: () =>
      pb
        .collection("cart")
        .getFullList<CartResponse<{ product: ProductsResponse }>>({
          expand: "product",
        }),
  });

  return (
    <CompLoader query={cart_query}>
      {(data) =>
        data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-base-content/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
            <p className="text-sm font-medium">Your cart is empty</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {data.map((item) => (
              <CartItemCard key={item.id} item={item} />
            ))}
          </div>
        )
      }
    </CompLoader>
  );
}

function CartItemCard({ item }: { item: CartItem }) {
  const queryClient = useQueryClient();
  const product = item.expand?.product;

  const imageUrl = product?.images?.[0]
    ? pb.files.getURL(product, product.images[0])
    : product?.preview
      ? pb.files.getURL(product, product.preview)
      : null;

  const removeMutation = useMutation({
    mutationFn: () => pb.collection("cart").delete(item.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["in-cart", item.product] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (amount: number) =>
      pb.collection("cart").update(item.id, { amount }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const handleRemove = () => {
    toast.promise(removeMutation.mutateAsync(), {
      loading: "Removing...",
      success: "Removed from cart",
      error: "Failed to remove",
    });
  };

  const handleAmount = (delta: number) => {
    const next = Math.max(1, (item.amount ?? 1) + delta);
    updateMutation.mutate(next);
  };

  const sizeLabel =
    item.type === "HATS"
      ? item.headSize
        ? `${item.headSize} cm`
        : null
      : item.wristSize
        ? `${item.wristSize} cm`
        : null;

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">
      <div className="card-body p-4 flex-row gap-4 items-start">
        <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-base-200">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product?.title ?? "Product"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-base-content/20 text-xs">
              No image
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight truncate">
                {product?.title ?? "Unknown product"}
              </p>
              {item.type && (
                <span className="badge badge-sm badge-soft badge-neutral mt-1">
                  {item.type}
                </span>
              )}
            </div>
            <button
              onClick={handleRemove}
              disabled={removeMutation.isPending}
              className="btn btn-ghost btn-sm btn-square text-error/60 hover:text-error hover:bg-error/10 shrink-0"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          {product?.price != null && (
            <p className="text-base font-bold">
              <span className="text-sm text-base-content/40 font-medium">
                ₦
              </span>
              {product.price.toLocaleString()}
            </p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {(item.mainColor || item.secondaryColor) && (
              <div className="flex items-center gap-1.5">
                {item.mainColor && (
                  <span
                    title={`Main: ${item.mainColor}`}
                    className="w-5 h-5 rounded-full border border-base-300 shadow-sm"
                    style={{ backgroundColor: item.mainColor }}
                  />
                )}
                {item.secondaryColor && (
                  <span
                    title={`Secondary: ${item.secondaryColor}`}
                    className="w-5 h-5 rounded-full border border-base-300 shadow-sm"
                    style={{ backgroundColor: item.secondaryColor }}
                  />
                )}
              </div>
            )}

            {sizeLabel && (
              <span className="text-xs text-base-content/50">{sizeLabel}</span>
            )}

            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => handleAmount(-1)}
                disabled={updateMutation.isPending || (item.amount ?? 1) <= 1}
                className="btn btn-ghost btn-xs btn-square"
              >
                <Minus className="size-3" />
              </button>
              <span className="w-6 text-center text-sm font-semibold tabular-nums">
                {item.amount ?? 1}
              </span>
              <button
                onClick={() => handleAmount(1)}
                disabled={updateMutation.isPending}
                className="btn btn-ghost btn-xs btn-square"
              >
                <Plus className="size-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
