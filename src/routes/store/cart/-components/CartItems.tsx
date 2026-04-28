import { pb } from "#/client/pb";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItemData } from "../index";
import { toast } from "sonner";

interface Props {
  items: CartItemData[];
  isLoading: boolean;
}

export default function CartItems({ items, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="card bg-base-100 border border-base-200">
            <div className="card-body p-4 flex-row gap-4">
              <div className="skeleton w-20 h-20 rounded-xl shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-4 w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
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
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <CartItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function CartItemCard({ item }: { item: CartItemData }) {
  const queryClient = useQueryClient();
  const product = item.product_details;

  const imageUrl = product.images?.[0]
    ? pb.files.getURL(product as any, product.images[0])
    : product.preview
      ? pb.files.getURL(product as any, product.preview)
      : null;

  const removeMutation = useMutation({
    mutationFn: () => pb.collection("cart").delete(item.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-total"] });
      queryClient.invalidateQueries({ queryKey: ["in-cart", product.id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (amount: number) =>
      pb.collection("cart").update(item.id, { amount }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["cart-total"] }),
  });

  const handleRemove = () => {
    toast.promise(removeMutation.mutateAsync(), {
      loading: "Removing...",
      success: "Removed from cart",
      error: "Failed to remove",
    });
  };

  const handleAmount = (delta: number) => {
    const next = Math.max(1, item.amount + delta);
    updateMutation.mutate(next);
  };

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">
      <div className="card-body p-4 flex-row gap-4 items-start">
        <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-base-200">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
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
            <p className="font-semibold text-sm leading-tight truncate">
              {product.title}
            </p>
            <button
              onClick={handleRemove}
              disabled={removeMutation.isPending}
              className="btn btn-ghost btn-sm btn-square text-error/60 hover:text-error hover:bg-error/10 shrink-0"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          <p className="text-base font-bold">
            <span className="text-sm text-base-content/40 font-medium">₦</span>
            {item.price.toLocaleString()}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            {(product.mainColor || product.secondaryColor) && (
              <div className="flex items-center gap-1.5">
                {product.mainColor && (
                  <span
                    title={`Main: ${product.mainColor}`}
                    className="w-5 h-5 rounded-full border border-base-300 shadow-sm"
                    style={{ backgroundColor: product.mainColor }}
                  />
                )}
                {product.secondaryColor && (
                  <span
                    title={`Secondary: ${product.secondaryColor}`}
                    className="w-5 h-5 rounded-full border border-base-300 shadow-sm"
                    style={{ backgroundColor: product.secondaryColor }}
                  />
                )}
              </div>
            )}

            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => handleAmount(-1)}
                disabled={updateMutation.isPending || item.amount <= 1}
                className="btn btn-ghost btn-xs btn-square"
              >
                <Minus className="size-3" />
              </button>
              <span className="w-6 text-center text-sm font-semibold tabular-nums">
                {item.amount}
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
