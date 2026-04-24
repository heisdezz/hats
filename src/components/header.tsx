import { ClientOnly, Link } from "@tanstack/react-router";
import AuthHeader from "./AuthHeader";
import SearchBar from "./SearchBar";
import StoreButtons from "./StoreButtons";
const navLinks = [
  {
    name: "Home",
    link: {
      path: "/store",
    },
  },

  {
    name: "Catalog",
    link: {
      path: "/store/catalog",
    },
  },
  {
    name: "Hats",
    link: {
      path: "/store/catalog/hats",
    },
  },
  {
    name: "Jewelry",
    link: {
      path: "/store/catalog/jewelry",
    },
  },
] as { name: string; link: Partial<{ path: string }> }[];
export const Header = () => {
  return (
    <div>
      <div className="bg-secondary/80 text-secondary-content grid place-items-center text-sm h-10 w-full text-center text">
        FREE SHIPPING on all Lagos orders above ₦150,000 🚚
      </div>
      <ClientOnly fallback={<div className="h-10 bg-base-200"></div>}>
        <AuthHeader />
      </ClientOnly>
      <nav className="container mx-auto flex items-center gap-4 h-22">
        <Link to="/" className=" text-2xl  font-logo leading-tight">
          Destinys Concept
        </Link>
        <div className="max-w-2xl flex-1 mx-auto">
          <SearchBar />
        </div>
        <StoreButtons />
      </nav>
      <div className="h-10 bg-base-200 ">
        <nav className="container mx-auto h-10 flex items-center gap-4">
          {navLinks.map((item) => (
            // @ts-ignore
            <Link key={item.name} className="link" to={item.link.path}>
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      {/*<header className="px-4 ">
        <h2 className="text-lg font-bold tracking-tight">
          <Link to="/">Waku starter</Link>
        </h2>
      </header>*/}
    </div>
  );
};
