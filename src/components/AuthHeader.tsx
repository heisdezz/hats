import { Link } from "@tanstack/react-router";

export default function AuthHeader() {
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
