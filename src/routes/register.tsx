import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { pb } from "#/client/pb";

export const Route = createFileRoute("/register")({ component: RegisterPage });

const schema = z
  .object({
    email: z.string().email("Invalid email address"),
    username: z.string().min(3, "At least 3 characters"),
    password: z.string().min(8, "At least 8 characters"),
    passwordConfirm: z.string(),
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    sex: z.enum(["male", "female", "unspecified"]),
    age: z.coerce.number().min(13, "Must be at least 13").max(120),
    phoneNumber: z.string().min(1, "Required"),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

type FormValues = z.infer<typeof schema>;

function RegisterPage() {
  const nav = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    //@ts-ignore
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      passwordConfirm: "",
      firstName: "",
      lastName: "",
      sex: "unspecified",
      age: 18,
      phoneNumber: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      pb.send("/register", {
        method: "POST",
        body: {
          email: data.email,
          username: data.username,
          password: data.password,
          passwordConfirm: data.passwordConfirm,
          firstName: data.firstName,
          lastName: data.lastName,
          sex: data.sex,
          age: data.age,
          phoneNumber: data.phoneNumber,
        },
      }),
  });

  const onSubmit = (data: FormValues) => {
    toast.promise(mutation.mutateAsync(data), {
      loading: "Creating your account…",
      success: () => {
        nav({ to: "/login" });
        return "Account created! Please sign in.";
      },
      error: (err) => err?.message ?? "Registration failed.",
    });
  };

  const field = (
    label: string,
    name: keyof FormValues,
    props?: React.InputHTMLAttributes<HTMLInputElement>,
  ) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      <input
        {...register(name)}
        {...props}
        className={`input input-bordered w-full ${errors[name] ? "input-error" : ""}`}
      />
      {errors[name] && (
        <p className="text-error text-xs">{errors[name]?.message as string}</p>
      )}
    </div>
  );

  return (
    <div className="page-wrap grid place-items-center px-4 py-10">
      <div className="card bg-base-100 shadow-lg w-full max-w-lg ring fade">
        <div className="card-body gap-5">
          <div>
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="text-sm text-base-content/50 mt-1">
              Fill in your details to get started
            </p>
          </div>

          <form
            //@ts-ignore
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-2 gap-3">
              {field("First Name", "firstName", { placeholder: "John" })}
              {field("Last Name", "lastName", { placeholder: "Doe" })}
            </div>

            {field("Username", "username", { placeholder: "johndoe" })}
            {field("Email", "email", {
              type: "email",
              placeholder: "you@example.com",
            })}
            {field("Phone Number", "phoneNumber", {
              type: "tel",
              placeholder: "+234 800 000 0000",
            })}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Sex</label>
                <select
                  {...register("sex")}
                  className="select select-bordered w-full"
                >
                  <option value="unspecified">Unspecified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              {field("Age", "age", { type: "number", min: 13, max: 120 })}
            </div>

            {field("Password", "password", {
              type: "password",
              placeholder: "••••••••",
            })}
            {field("Confirm Password", "passwordConfirm", {
              type: "password",
              placeholder: "••••••••",
            })}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn btn-primary w-full mt-1"
            >
              {mutation.isPending ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="text-sm text-center text-base-content/50">
            Already have an account?{" "}
            <Link to="/login" className="link link-primary">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
