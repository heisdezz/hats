import { useCallback, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { pb } from "#/client/pb";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import {
  Sparkles,
  Send,
  Calendar,
  DollarSign,
  Palette,
  Ruler,
  Phone,
  Mail,
  User,
  CheckCircle2,
  Package,
  Image as ImageIcon,
  UploadCloud,
  X,
} from "lucide-react";

export const Route = createFileRoute("/store/custom-request")({
  component: CustomRequestPage,
});

const ITEM_TYPES = [
  "Church & Royal Hat",
  "Fascinator & Headpiece",
  "Bridal Jewelry Set",
  "Custom Necklace & Earrings",
  "Bespoke Hat & Jewelry Combo",
  "Other Bespoke Accessory",
] as const;

const customRequestSchema = z
  .object({
    itemType: z.string().min(1, "Please select an item category"),
    title: z
      .string()
      .min(
        2,
        "Please enter a title or short description for your request (min 2 characters)",
      ),
    description: z
      .string()
      .min(10, "Please provide design specifications (min 10 characters)"),
    colors: z.string().optional(),
    measurements: z.string().optional(),
    eventDate: z.string().optional(),
    budget: z.string().optional(),
    contactName: z.string().optional(),
    contactEmail: z
      .string()
      .email("Please enter a valid email address")
      .or(z.literal(""))
      .optional(),
    contactPhone: z.string().optional(),
    images: z
      .array(z.custom<File>((f) => f instanceof File, "Invalid file object"))
      .max(10, "Maximum 10 images allowed")
      .optional()
      .default([]),
  })
  .refine(
    (data) =>
      Boolean(data.contactEmail?.trim()) || Boolean(data.contactPhone?.trim()),
    {
      message:
        "Please provide either an email address or a phone number so we can reach you",
      path: ["contactEmail"],
    },
  );

type CustomRequestFormValues = z.infer<typeof customRequestSchema>;

function CustomRequestPage() {
  const isAuth = pb.authStore.isValid;
  const user = pb.authStore.record;

  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const methods = useForm<CustomRequestFormValues>({
    resolver: zodResolver(customRequestSchema) as any,
    defaultValues: {
      itemType: ITEM_TYPES[0],
      title: "",
      description: "",
      colors: "",
      measurements: "",
      eventDate: "",
      budget: "",
      contactName: user?.username || "",
      contactEmail: user?.email || "",
      contactPhone: "",
      images: [],
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = methods;

  const currentItemType = watch("itemType");
  const selectedImages = watch("images") || [];

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const current = getValues("images") || [];
      setValue("images", [...current, ...acceptedFiles], {
        shouldValidate: true,
      });
    },
    [getValues, setValue],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const removeImage = (idxToRemove: number) => {
    const current = getValues("images") || [];
    setValue(
      "images",
      current.filter((_, i) => i !== idxToRemove),
      { shouldValidate: true },
    );
  };

  const onSubmit = async (values: CustomRequestFormValues) => {
    try {
      const payload = {
        title: values.title.trim(),
        itemType: values.itemType,
        description: values.description.trim(),
        colors: values.colors?.trim() || undefined,
        measurements: values.measurements?.trim() || undefined,
        eventDate: values.eventDate || undefined,
        budget: values.budget?.trim() || undefined,
        contactName: values.contactName?.trim() || undefined,
        contactEmail: values.contactEmail?.trim() || undefined,
        contactPhone: values.contactPhone?.trim() || undefined,
      };

      const formData = new FormData();
      formData.append("request_body", JSON.stringify(payload));
      if (isAuth && user?.id) {
        formData.append("user", user.id);
      }

      if (values.images && values.images.length > 0) {
        for (const file of values.images) {
          formData.append("images", file);
        }
      }

      const record = await pb.collection("custom_requests").create(formData);

      setSubmittedId(record.id);
      toast.success("Custom request submitted successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.message || "Failed to submit request. Please try again.",
      );
    }
  };

  if (submittedId) {
    return (
      <div className="page-wrap py-12 flex justify-center items-center">
        <div className="card bg-base-100 border border-base-200 shadow-md max-w-xl w-full p-8 text-center space-y-6">
          <div className="size-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto">
            <CheckCircle2 className="size-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Custom Request Received!</h2>
            <p className="text-sm text-base-content/70 max-w-md mx-auto">
              Thank you for sharing your bespoke vision with us. Our artisan
              team will review your specifications and get back to you with
              consultation details and a price estimate.
            </p>
          </div>

          <div className="p-4 bg-base-200/60 rounded-xl text-xs space-y-1 font-mono text-base-content/70">
            <p>Reference ID: #{submittedId.slice(0, 8)}</p>
            <p>Category: {currentItemType}</p>
            {selectedImages.length > 0 && (
              <p>Reference Images: {selectedImages.length} attached</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            {isAuth ? (
              <Link
                to="/profile/requests"
                className="btn btn-primary rounded-xl text-xs gap-2"
              >
                <Package className="size-4" />
                View in My Requests
              </Link>
            ) : (
              <Link
                to="/login"
                search={{ redirect: "/profile/requests" }}
                className="btn btn-primary rounded-xl text-xs gap-2"
              >
                Login to Track Requests
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                setSubmittedId(null);
                reset();
              }}
              className="btn btn-outline rounded-xl text-xs"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap py-8 max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-base-200 to-base-100 border border-base-200 p-6 sm:p-10 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="badge badge-primary gap-1.5 py-2.5 px-3 text-xs font-semibold">
            <Sparkles className="size-3.5" />
            Bespoke Atelier
          </span>
        </div>
        <div className="max-w-2xl space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold font-logo tracking-tight">
            Order a Custom Piece
          </h1>
          <p className="text-sm text-base-content/70 leading-relaxed">
            From regal church hats and statement fascinators to bridal jewelry
            sets, our artisans craft pieces tailored specifically to your
            outfit, event theme, and sizing.
          </p>
        </div>

        {!isAuth && (
          <div className="alert alert-info/10 border border-info/30 text-xs text-base-content/80 mt-2">
            <span>
              💡 <strong>Tip:</strong> Log in before submitting to automatically
              track your custom request and view admin consultation responses in
              your account profile.
            </span>
          </div>
        )}
      </div>

      {/* Form */}
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="card bg-base-100 border border-base-200 shadow-xs p-6 sm:p-8 space-y-6"
        >
          <h2 className="text-lg font-bold border-b border-base-200 pb-3">
            1. Bespoke Item Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-base-content/70">
                Item Category <span className="text-error">*</span>
              </label>
              <select
                {...register("itemType")}
                className={`select select-bordered w-full rounded-xl text-xs ${
                  errors.itemType ? "select-error" : ""
                }`}
              >
                {ITEM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.itemType && (
                <p className="text-error text-xs mt-1">
                  {errors.itemType.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-base-content/70">
                Request Title / Occasion <span className="text-error">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Royal Blue Wedding Fascinator"
                {...register("title")}
                className={`input input-bordered w-full rounded-xl text-xs ${
                  errors.title ? "input-error" : ""
                }`}
              />
              {errors.title && (
                <p className="text-error text-xs mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-base-content/70 flex items-center gap-1.5">
                <Palette className="size-3.5 text-primary" />
                Color Palette & Outfit Matching
              </label>
              <input
                type="text"
                placeholder="e.g. Emerald green with gold accents / Champagne"
                {...register("colors")}
                className="input input-bordered w-full rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-base-content/70 flex items-center gap-1.5">
                <Ruler className="size-3.5 text-primary" />
                Head Size / Wrist Sizing (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Head: 57cm (Medium), Wrist: 18cm"
                {...register("measurements")}
                className="input input-bordered w-full rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-base-content/70 flex items-center gap-1.5">
                <Calendar className="size-3.5 text-primary" />
                Event Date / Needed By
              </label>
              <input
                type="date"
                {...register("eventDate")}
                className="input input-bordered w-full rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-base-content/70 flex items-center gap-1.5">
                <DollarSign className="size-3.5 text-primary" />
                Estimated Budget Range (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. ₦60,000 - ₦90,000"
                {...register("budget")}
                className="input input-bordered w-full rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-base-content/70">
              Design Description & Specifications{" "}
              <span className="text-error">*</span>
            </label>
            <textarea
              rows={5}
              placeholder="Describe your desired style, shapes, materials, feathers, veil, beads, dress neckline, or special theme..."
              {...register("description")}
              className={`textarea textarea-bordered w-full rounded-xl text-xs leading-relaxed ${
                errors.description ? "textarea-error" : ""
              }`}
            />
            {errors.description && (
              <p className="text-error text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Reference images upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-base-content/70 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="size-3.5 text-primary" />
                Inspiration & Outfit Reference Images (Optional)
              </span>
              <span className="text-[11px] text-base-content/40 font-normal">
                Photos of outfits, fabric swatches, or hat styles
              </span>
            </label>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-base-300 hover:border-primary/50 bg-base-200/30"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="size-10 rounded-full bg-base-200 flex items-center justify-center text-base-content/50">
                  <UploadCloud className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-base-content/80">
                    Click to upload or drag and drop images
                  </p>
                  <p className="text-[11px] text-base-content/40 mt-0.5">
                    PNG, JPG, WEBP up to 10MB each (max 10 images)
                  </p>
                </div>
              </div>
            </div>

            {errors.images && (
              <p className="text-error text-xs mt-1">{errors.images.message}</p>
            )}

            {selectedImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                {selectedImages.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden aspect-square border border-base-200 bg-base-200"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="btn btn-circle btn-xs btn-error absolute top-1.5 right-1.5 opacity-90 hover:opacity-100 shadow-sm"
                      aria-label="Remove image"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <h2 className="text-lg font-bold border-b border-base-200 pb-3 pt-2">
            2. Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-base-content/70 flex items-center gap-1.5">
                <User className="size-3.5" />
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Chinelo Adeyemi"
                {...register("contactName")}
                className="input input-bordered w-full rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-base-content/70 flex items-center gap-1.5">
                <Mail className="size-3.5" />
                Email Address <span className="text-error">*</span>
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                {...register("contactEmail")}
                className={`input input-bordered w-full rounded-xl text-xs ${
                  errors.contactEmail ? "input-error" : ""
                }`}
              />
              {errors.contactEmail && (
                <p className="text-error text-xs mt-1">
                  {errors.contactEmail.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-base-content/70 flex items-center gap-1.5">
                <Phone className="size-3.5" />
                Phone / WhatsApp
              </label>
              <input
                type="tel"
                placeholder="+234 800 000 0000"
                {...register("contactPhone")}
                className="input input-bordered w-full rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary rounded-xl px-8 text-xs font-bold gap-2 shadow-sm"
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Send className="size-4" />
              )}
              Submit Custom Request
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
