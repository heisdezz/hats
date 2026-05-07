import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { pb } from "#/client/pb";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
});

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

function RouteComponent() {
  const nav = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      toast.promise(
        pb.collection("admins").authWithPassword(data.email, data.password),
        {
          loading: "Authenticating...",
          success: () => {
            nav({ to: "/admin/dashboard" });
            return "Logged in successfully";
          },
          error: "Invalid credentials.",
        },
      );
      // @ts-ignore
    } catch {
      setServerError("Invalid credentials.");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-base-200 px-4">
      <div className="card bg-base-100 shadow-lg w-full max-w-sm">
        <div className="card-body gap-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <ShieldCheck className="size-7 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Login</h1>
              <p className="text-sm text-base-content/50 mt-0.5">
                Sign in to the admin dashboard
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="admin@example.com"
                className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-error text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={`input input-bordered w-full ${errors.password ? "input-error" : ""}`}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-error text-xs">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <div className="alert alert-error py-2 text-sm">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full mt-1"
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="text-sm text-center text-base-content/80">
            <Link to="/store/catalog" className="link">
              Back to store
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
