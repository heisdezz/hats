import { useState } from "react";
import { pb } from "#/client/pb";
import { parseRequestBody } from "#/helpers/customRequests";
import type {
  CustomRequestsResponse,
  UsersResponse,
} from "#/../pocketbase-types";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  Palette,
  Ruler,
  DollarSign,
  User,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Edit2,
  X,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";

type RequestWithUser = CustomRequestsResponse<{
  user?: UsersResponse;
}>;

const adminResponseSchema = z.object({
  admin_response: z
    .string()
    .min(3, "Response must be at least 3 characters long"),
});

type AdminResponseFormValues = z.infer<typeof adminResponseSchema>;

export default function AdminRequestCard({
  request,
  onUpdated,
}: {
  request: RequestWithUser;
  onUpdated: () => void;
}) {
  const data = parseRequestBody(request.request_body);
  const user = request.expand?.user;

  const [isEditing, setIsEditing] = useState(false);
  const hasResponse = Boolean(request.admin_response?.trim());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminResponseFormValues>({
    resolver: zodResolver(adminResponseSchema),
    defaultValues: {
      admin_response: request.admin_response || "",
    },
  });

  const customerName =
    user?.username ||
    data.contactName ||
    user?.email?.split("@")[0] ||
    `Guest #${request.id.slice(0, 6)}`;

  const customerEmail = user?.email || data.contactEmail;
  const customerPhone = data.contactPhone;

  const onSave = async (values: AdminResponseFormValues) => {
    try {
      await pb.collection("custom_requests").update(request.id, {
        admin_response: values.admin_response.trim(),
      });
      toast.success("Response saved successfully!");
      setIsEditing(false);
      onUpdated();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to save response. Please try again.");
    }
  };

  return (
    <div className="card bg-base-100 border border-base-200 shadow-xs rounded-2xl overflow-hidden">
      {/* Top bar */}
      <div className="p-5 border-b border-base-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-base-200/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge badge-primary badge-outline text-[11px] font-semibold">
              <Sparkles className="size-3 mr-1" />
              {data.itemType}
            </span>
            <span className="text-xs font-mono text-base-content/40">
              #{request.id.slice(0, 8)}
            </span>
          </div>
          <h3 className="font-bold text-base text-base-content">
            {data.title || "Custom Request"}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {hasResponse ? (
            <span className="badge badge-success gap-1 text-xs font-semibold py-2.5 px-3">
              <CheckCircle2 className="size-3.5" />
              Responded
            </span>
          ) : (
            <span className="badge badge-warning gap-1 text-xs font-semibold py-2.5 px-3">
              <Clock className="size-3.5" />
              Pending Response
            </span>
          )}

          <span className="text-xs text-base-content/40">
            {new Date(request.created).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Customer info card */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 p-3.5 bg-base-200/50 rounded-xl text-xs">
          <div className="flex items-center gap-2 font-medium">
            <User className="size-4 text-primary shrink-0" />
            <span>{customerName}</span>
            {user ? (
              <span className="badge badge-neutral badge-xs">Registered</span>
            ) : (
              <span className="badge badge-ghost badge-xs">Guest</span>
            )}
          </div>

          {customerEmail && (
            <div className="flex items-center gap-2 text-base-content/70">
              <Mail className="size-3.5 text-base-content/40 shrink-0" />
              <a href={`mailto:${customerEmail}`} className="hover:underline">
                {customerEmail}
              </a>
            </div>
          )}

          {customerPhone && (
            <div className="flex items-center gap-2 text-base-content/70">
              <Phone className="size-3.5 text-base-content/40 shrink-0" />
              <a href={`tel:${customerPhone}`} className="hover:underline">
                {customerPhone}
              </a>
            </div>
          )}
        </div>

        {/* Request chips */}
        <div className="flex flex-wrap gap-2 text-xs">
          {data.colors && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-200 text-base-content/80">
              <Palette className="size-3.5 text-primary" />
              <span>Palette: {data.colors}</span>
            </div>
          )}
          {data.measurements && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-200 text-base-content/80">
              <Ruler className="size-3.5 text-primary" />
              <span>Measurements: {data.measurements}</span>
            </div>
          )}
          {data.eventDate && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-200 text-base-content/80">
              <Calendar className="size-3.5 text-primary" />
              <span>Event Date: {data.eventDate}</span>
            </div>
          )}
          {data.budget && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-200 text-base-content/80">
              <DollarSign className="size-3.5 text-primary" />
              <span>Budget: {data.budget}</span>
            </div>
          )}
        </div>

        {/* Request description */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/40">
            Customer Specifications & Details
          </h4>
          <p className="text-sm text-base-content/80 whitespace-pre-wrap leading-relaxed bg-base-200/30 p-4 rounded-xl border border-base-200">
            {data.description || "No description provided."}
          </p>
        </div>

        {/* Uploaded Reference Images */}
        {request.images && request.images.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/40 flex items-center gap-1.5">
              <ImageIcon className="size-3.5 text-primary" />
              Customer Reference Images ({request.images.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {request.images.map((imgName, i) => {
                const imgUrl = pb.files.getURL(request, imgName);
                return (
                  <a
                    key={i}
                    href={imgUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative rounded-xl overflow-hidden aspect-square border border-base-200 bg-base-200 block shadow-xs"
                    title="View full image"
                  >
                    <img
                      src={imgUrl}
                      alt={`Reference ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs">
                      <ExternalLink className="size-3.5" />
                      <span>View</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Admin Response section */}
        <div className="pt-2 border-t border-base-200">
          {isEditing ? (
            <form onSubmit={handleSubmit(onSave)} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-primary">
                  <MessageSquare className="size-4" />
                  {hasResponse
                    ? "Update Response"
                    : "Compose Response to Customer"}
                </label>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-ghost btn-xs text-base-content/50"
                >
                  <X className="size-3.5 mr-1" />
                  Cancel
                </button>
              </div>

              <textarea
                rows={4}
                {...register("admin_response")}
                placeholder="Write your consultation response, availability, fabric notes, price estimate, and timeline here..."
                className={`textarea textarea-bordered w-full rounded-xl text-xs leading-relaxed ${
                  errors.admin_response ? "textarea-error" : ""
                }`}
              />
              {errors.admin_response && (
                <p className="text-error text-xs">
                  {errors.admin_response.message}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-sm btn-ghost rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-sm btn-primary rounded-xl text-xs gap-1.5"
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <Send className="size-3.5" />
                  )}
                  Save & Publish Response
                </button>
              </div>
            </form>
          ) : hasResponse ? (
            <div className="rounded-xl border border-success/30 bg-success/5 p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-success font-bold text-xs">
                  <MessageSquare className="size-3.5" />
                  <span>Your Published Response:</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    reset({ admin_response: request.admin_response || "" });
                    setIsEditing(true);
                  }}
                  className="btn btn-ghost btn-xs gap-1 text-xs text-primary hover:underline"
                >
                  <Edit2 className="size-3" />
                  Edit Response
                </button>
              </div>
              <p className="text-xs text-base-content/90 whitespace-pre-wrap leading-relaxed bg-base-100 p-3.5 rounded-xl border border-success/20">
                {request.admin_response}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 bg-warning/10 border border-warning/30 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-warning-content">
                <Clock className="size-4 text-warning" />
                <span>
                  This customer request has not been responded to yet.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  reset({ admin_response: "" });
                  setIsEditing(true);
                }}
                className="btn btn-sm btn-primary rounded-xl text-xs gap-1.5"
              >
                <MessageSquare className="size-3.5" />
                Respond
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
