import { IconHeart, IconShoppingBag } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pb } from "#/client/pb";

export default function StoreButtons() {
  const isAuth = pb.authStore.isValid;
  const { data } = useQuery({
    queryKey: ["cart-total"],
    queryFn: () => pb.send<{ data: { cart_items: unknown[] } }>("/cart/breakdown", { method: "GET" }),
    enabled: isAuth,
  });
  const count = data?.data.cart_items.length ?? 0;

  return (
    <div className="flex items-center gap-4">
      <Link to="/store/cart" className="indicator">
        {count > 0 && (
          <span className="indicator-item badge badge-primary badge-xs text-[10px] font-bold">
            {count > 99 ? "99+" : count}
          </span>
        )}
        <IconShoppingBag />
      </Link>
      <IconHeart />
    </div>
  );
}
