import { ClientOnly, Link } from "@tanstack/react-router";
import AuthHeader from "./AuthHeader";
import SearchBar from "./SearchBar";
import StoreButtons from "./StoreButtons";
import { Menu, Sparkles } from "lucide-react";

const navLinks = [
  { name: "Home", path: "/store" },
  { name: "Catalog", path: "/store/catalog" },
  { name: "Hats", path: "/store/catalog/hats" },
  { name: "Jewelry", path: "/store/catalog/jewelry" },
] as { name: string; path: string }[];

export const Header = () => {
  return (
    <header className="sticky top-0 z-40 bg-base-100/95 backdrop-blur-md border-b border-base-200/80 shadow-xs">
      {/* Top Announcement Banner */}
      <div className="bg-gradient-to-r from-primary/90 via-secondary/80 to-primary/90 text-primary-content text-xs font-semibold h-9 w-full flex items-center justify-center gap-2 px-4 text-center">
        <Sparkles size={14} className="animate-pulse" />
        <span>FREE SHIPPING on all Lagos orders above ₦150,000 🚚</span>
      </div>

      {/* Auth bar */}
      <ClientOnly fallback={<div className="h-8 bg-base-200/50" />}>
        <AuthHeader />
      </ClientOnly>

      {/* Main Nav Bar */}
      <div className="container mx-auto flex items-center justify-between gap-4 h-16 px-4">
        {/* Mobile menu drawer button */}
        <label
          htmlFor="store-drawer"
          className="btn btn-ghost btn-square btn-sm lg:hidden text-base-content/80 hover:bg-base-200"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </label>

        {/* Brand Logo */}
        <Link
          to="/store"
          className="text-2xl lg:text-3xl font-logo tracking-wide text-primary hover:opacity-90 transition-opacity mr-auto lg:mr-0"
        >
          Destinys Concept
        </Link>

        {/* Search Bar — desktop fill */}
        <div className="hidden lg:flex container mx-auto flex-1 ">
          <SearchBar />
        </div>

        {/* Store actions (Cart, Wishlist) */}
        <StoreButtons />
      </div>

      {/* Mobile search bar row */}
      <div className="lg:hidden pb-3 container mx-auto">
        <SearchBar />
      </div>

      {/* Desktop sub-navigation bar */}
      <div className="hidden lg:block bg-base-200/50 border-t border-base-200/60 h-10">
        <nav className="container mx-auto h-10 flex items-center gap-6 px-4">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="text-xs font-semibold tracking-wide text-base-content/70 hover:text-primary transition-colors [&.active]:text-primary [&.active]:font-bold"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};
