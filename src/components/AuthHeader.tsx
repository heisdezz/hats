import { pb } from "#/client/pb";
import { Link } from "@tanstack/react-router";

export default function AuthHeader() {
  if (pb.authStore.isValid) {
    return (
      <div className="flex h-10  bg-base-200 ">
        <div className="container mx-auto flex items-center justify-end gap-2">
          <Link to="/profile" className="link">
            Profile
          </Link>
          <Link to="/profile/orders" className="link">
            Orders
          </Link>
          <Link to="/logout" className="link" preload={false}>
            Logout
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-10  bg-base-200 ">
      <div className="container mx-auto flex items-center justify-end gap-2">
        <Link to="/login" className="link">
          Login
        </Link>
        <Link to="/register" className="link">
          Register
        </Link>
      </div>
    </div>
  );
}
