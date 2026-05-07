import { ClientOnly, Link } from "@tanstack/react-router";
import AuthHeader from "./AuthHeader";
import SearchBar from "./SearchBar";
import StoreButtons from "./StoreButtons";
import { Menu } from "lucide-react";

const navLinks = [
  { name: "Home", path: "/store" },
  { name: "Catalog", path: "/store/catalog" },
  { name: "Hats", path: "/store/catalog/hats" },
  { name: "Jewelry", path: "/store/catalog/jewelry" },
] as { name: string; path: string }[];

export const Header = () => {
  return (
    <div>
      {/* Promo banner */}
      <div className="bg-secondary/80 text-secondary-content grid place-items-center text-sm h-10 w-full text-center">
        FREE SHIPPING on all Lagos orders above ₦150,000 🚚
      </div>

      {/* Auth row */}
      <ClientOnly fallback={<div className="h-10 bg-base-200" />}>
        <AuthHeader />
      </ClientOnly>

      {/* Main nav */}
      <nav className="container mx-auto flex items-center gap-3 h-16 px-4 lg:px-0">
        {/* Hamburger — mobile only */}
        <label
          htmlFor="store-drawer"
          className="btn btn-ghost btn-square lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </label>

        <Link
          to="/store"
          className="text-xl lg:text-2xl font-logo leading-tight mr-auto lg:mr-0"
        >
          Destinys Concept
        </Link>

        {/* Search — desktop only, grows to fill space */}
        <div className="hidden lg:flex max-w-2xl flex-1 mx-auto">
          <SearchBar />
        </div>

        <StoreButtons />
      </nav>

      {/* Mobile search row */}
      <div className="lg:hidden px-4 pb-3">
        <SearchBar />
      </div>

      {/* Nav links — desktop only */}
      <div className="hidden lg:block h-10 bg-base-200">
        <nav className="container mx-auto h-10 flex items-center gap-4">
          {navLinks.map((item) => (
            <Link key={item.name} className="link" to={item.path}>
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};
