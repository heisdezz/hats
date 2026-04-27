import { IconHeart, IconShoppingBag } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

export default function StoreButtons() {
  return (
    <div className="flex items-center gap-4">
      <Link to="/store/cart">
        <IconShoppingBag />
      </Link>
      <IconHeart />
    </div>
  );
}
