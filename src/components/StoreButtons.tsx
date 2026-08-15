import { IconHeart, IconShoppingBag } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "#/client/pb";
import { useEffect } from "react";

export default function StoreButtons() {
  const queryClient = useQueryClient();
  const isAuth = pb.authStore.isValid;

  // Real-time subscription to PocketBase cart collection changes
  useEffect(() => {
    if (!isAuth) return;

    let unsub: (() => void) | undefined;

    pb.collection("cart")
      .subscribe("*", () => {
        queryClient.invalidateQueries({ queryKey: ["cart-total"] });
      })
      .then((u) => {
        unsub = u;
      })
      .catch((err) => console.log("Cart realtime sub error:", err));

    return () => {
      if (unsub) {
        unsub();
      } else {
        pb.collection("cart").unsubscribe("*").catch(() => {});
      }
    };
  }, [isAuth, queryClient]);

  const { data } = useQuery({
    queryKey: ["cart-total"],
    queryFn: () =>
      pb.send<{ data: { cart_items: unknown[] } }>("/cart/breakdown", {
        method: "GET",
      }),
    enabled: isAuth,
    refetchOnWindowFocus: true,
  });

  const count = data?.data?.cart_items?.length ?? 0;

  return (
    <div className="flex items-center gap-3">
      {/* Wishlist Link */}
      <Link
        to="/store/catalog"
        className="btn btn-circle btn-ghost btn-sm text-base-content/70 hover:text-primary transition-colors"
        title="Wishlist"
      >
        <IconHeart size={20} />
      </Link>

      {/* Cart Link with Badge */}
      <Link
        to="/store/cart"
        className="btn btn-ghost btn-circle btn-sm relative text-base-content/80 hover:text-primary transition-colors group"
        title="Shopping Bag"
      >
        <IconShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-content text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50 duration-300">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>
    </div>
  );
}

