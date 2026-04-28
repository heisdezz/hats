import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { pb } from "#/client/pb";
import { useState } from "react";
import { useProfile } from "#/store/user";
import { useDeliverySettings } from "#/store/delivery";
import type { DeliverySettingsRecord, ProfileRecord } from "pocketbase-types";
import { Header } from "#/components/header";
import { Footer } from "#/components/footer";

export const Route = createFileRoute("/login")({
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
  const set_profile = useProfile((state) => state.setProfile);
  const update_delivery = useDeliverySettings(
    (state) => state.updateDeliverySettings,
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onBlur" });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      const user = await pb
        .collection("users")
        .authWithPassword(data.email, data.password);
      const user_id = user.record.id;
      const profile: ProfileRecord = await pb.send("profile/me", {
        method: "GET",
      });
      const delivery: DeliverySettingsRecord = await pb.send(
        "delivery/me/" + profile.id,
        {
          method: "GET",
        },
      );
      update_delivery(delivery);
      set_profile(profile);
      //@ts-ignore
      nav({ to: "/store/catalog/" });
    } catch {
      setServerError("Invalid email or password.");
    }
  };

  return (
    <>
      <Header />
      <div className="page-wrap grid place-items-center  px-4">
        <div className="card bg-base-100 shadow-lg w-full max-w-lg ring fade">
          <div className="card-body gap-5">
            <div>
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-sm text-base-content/50 mt-1">
                Sign in to your account
              </p>
            </div>

            {/*<input type="text" className="" />*/}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
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
                  <p className="text-error text-xs">
                    {errors.password.message}
                  </p>
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

            <p className="text-sm text-center text-base-content/50">
              Don't have an account?{" "}
              <Link to="/register" className="link link-primary">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
