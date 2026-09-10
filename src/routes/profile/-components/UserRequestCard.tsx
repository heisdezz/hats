import { useState } from "react";
import { pb } from "#/client/pb";
import type { CustomRequestsResponse } from "#/../pocketbase-types";
import { parseRequestBody } from "#/helpers/customRequests";
import {
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  Palette,
  Ruler,
  DollarSign,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";

export default function UserRequestCard({
  request,
}: {
  request: CustomRequestsResponse;
}) {
  const [expanded, setExpanded] = useState(true);
  const data = parseRequestBody(request.request_body);
  const hasResponse = Boolean(request.admin_response?.trim());

  return (
    <div className="card bg-base-100 border border-base-200 shadow-xs rounded-2xl overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-base-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-base-200/30">
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

        <div className="flex items-center gap-2">
          {hasResponse ? (
            <span className="badge badge-success gap-1 text-xs font-semibold py-3 px-3">
              <CheckCircle2 className="size-3.5" />
              Responded
            </span>
          ) : (
            <span className="badge badge-warning gap-1 text-xs font-semibold py-3 px-3">
              <Clock className="size-3.5" />
              Pending Review
            </span>
          )}

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="Toggle details"
          >
            {expanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-5 space-y-5">
          {/* Metadata chips */}
          <div className="flex flex-wrap gap-2 text-xs">
            {data.colors && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-200 text-base-content/80">
                <Palette className="size-3.5 text-primary" />
                <span>{data.colors}</span>
              </div>
            )}
            {data.measurements && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-200 text-base-content/80">
                <Ruler className="size-3.5 text-primary" />
                <span>{data.measurements}</span>
              </div>
            )}
            {data.eventDate && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-200 text-base-content/80">
                <Calendar className="size-3.5 text-primary" />
                <span>Needed by: {data.eventDate}</span>
              </div>
            )}
            {data.budget && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-200 text-base-content/80">
                <DollarSign className="size-3.5 text-primary" />
                <span>Budget: {data.budget}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/40">
              Request Details & Specifications
            </h4>
            <p className="text-sm text-base-content/80 whitespace-pre-wrap leading-relaxed bg-base-200/40 p-3.5 rounded-xl">
              {data.description || "No specific details provided."}
            </p>
          </div>

          {/* Uploaded Reference Images */}
          {request.images && request.images.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/40 flex items-center gap-1.5">
                <ImageIcon className="size-3.5 text-primary" />
                Inspiration & Reference Images ({request.images.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
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

          {/* Admin Response Box */}
          <div className="pt-1">
            {hasResponse ? (
              <div className="rounded-xl border border-success/30 bg-success/5 p-4 sm:p-5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-success font-bold text-sm">
                    <MessageSquare className="size-4" />
                    <span>Response from Destinys Concept</span>
                  </div>
                  <span className="text-[11px] text-base-content/40">
                    Updated:{" "}
                    {new Date(request.updated).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="text-sm text-base-content/90 whitespace-pre-wrap leading-relaxed bg-base-100 p-4 rounded-xl border border-success/20">
                  {request.admin_response}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-base-300 bg-base-200/30 p-4 text-xs text-base-content/60 flex items-center gap-2.5">
                <Clock className="size-4 text-warning shrink-0" />
                <span>
                  Our atelier team is currently reviewing your custom order
                  specifications. We will post consultation notes and quotes
                  here shortly.
                </span>
              </div>
            )}
          </div>

          {/* Footer timestamp */}
          <div className="pt-2 border-t border-base-200 text-[11px] text-base-content/40 flex items-center justify-between">
            <span>
              Submitted on{" "}
              {new Date(request.created).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
