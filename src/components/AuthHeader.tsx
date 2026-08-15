import { pb } from "#/client/pb";
import { Link } from "@tanstack/react-router";
import { User, Package, LogOut, LogIn, UserPlus } from "lucide-react";

export default function AuthHeader() {
  const isAuth = pb.authStore.isValid;
  const user = pb.authStore.record;

  return (
    <div className="bg-base-200/90 backdrop-blur-md border-b border-base-300 text-xs py-1.5 px-4 transition-all">
      <div className="container mx-auto flex items-center justify-between gap-4">
        {/* Left side: store tag or contact info */}
        <div className="hidden sm:flex items-center gap-4 text-base-content/70">
          <span className="flex items-center gap-1 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Lagos Flagship Store
          </span>
          <span className="text-base-content/30">|</span>
          <a href="tel:+2348000000000" className="hover:text-primary transition-colors">
            +234 800 000 0000
          </a>
        </div>

        {/* Right side: User authentication actions */}
        <div className="flex items-center gap-4 ml-auto">
          {isAuth ? (
            <>
              <span className="hidden md:inline font-medium text-base-content/80">
                Welcome, <span className="text-primary font-semibold">{user?.username || user?.email?.split("@")[0] || "Member"}</span>
              </span>
              <span className="hidden md:inline text-base-content/30">|</span>
              <Link
                to="/profile"
                className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium"
              >
                <User size={13} />
                <span>Profile</span>
              </Link>
              <Link
                to="/profile/orders"
                search={{ page: 1, reference: undefined }}
                className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium"
              >
                <Package size={13} />
                <span>My Orders</span>
              </Link>
              <span className="text-base-content/30">|</span>
              <Link
                to="/logout"
                className="flex items-center gap-1 hover:text-error transition-colors font-medium text-base-content/70"
                preload={false}
              >
                <LogOut size={13} />
                <span>Logout</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-1 hover:text-primary transition-colors font-medium"
              >
                <LogIn size={13} />
                <span>Login</span>
              </Link>
              <span className="text-base-content/30">|</span>
              <Link
                to="/register"
                className="flex items-center gap-1 hover:text-primary transition-colors font-semibold text-primary"
              >
                <UserPlus size={13} />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
