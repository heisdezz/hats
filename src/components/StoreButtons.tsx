import { IconHeart, IconShoppingBag } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useCartStore } from "#/store/cart";

export default function StoreButtons() {
  const count = useCartStore((s) => Object.keys(s.cartItems).length);

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
