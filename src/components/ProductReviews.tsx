import { pb } from "#/client/pb";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReviewsResponse, UsersResponse } from "#/../pocketbase-types";
import { Star, BadgeCheck, PenLine, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useProfile } from "#/store/user";

type ReviewWithUser = ReviewsResponse<{ user?: UsersResponse }>;

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={
            n <= rating
              ? "text-warning fill-warning"
              : "text-base-content/20 fill-base-content/10"
          }
        />
      ))}
    </div>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="p-0.5"
        >
          <Star
            size={24}
            className={
              n <= (hovered || value)
                ? "text-warning fill-warning"
                : "text-base-content/20 fill-base-content/10"
            }
          />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({
  productId,
  initial,
  onSuccess,
  onCancel,
}: {
  productId: string;
  initial?: { stars: number; message: string };
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const qc = useQueryClient();
  const [stars, setStars] = useState(initial?.stars ?? 0);
  const [message, setMessage] = useState(initial?.message ?? "");
  const isEdit = !!initial;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["reviews", productId] });
    qc.invalidateQueries({ queryKey: ["my-review", productId] });
  };

  const mut = useMutation({
    mutationFn: () =>
      isEdit
        ? pb.send(`/review/${productId}`, {
            method: "PATCH",
            body: { review_stars: stars, review_message: message },
          })
        : pb.send("/review", {
            method: "POST",
            body: {
              product: productId,
              review_message: message,
              review_stars: stars,
            },
          }),
    onSuccess: () => {
      invalidate();
      onSuccess();
    },
  });

  return (
    <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 flex flex-col gap-4">
      <p className="text-sm font-semibold">
        {isEdit ? "Edit your review" : "Write a review"}
      </p>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-base-content/50">Your rating</p>
        <StarPicker value={stars} onChange={setStars} />
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-base-content/50">Your review (optional)</p>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your thoughts about this product…"
          className="textarea textarea-bordered w-full resize-none text-sm focus:textarea-primary"
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={stars === 0 || mut.isPending}
          onClick={() =>
            toast.promise(mut.mutateAsync(), {
              loading: isEdit ? "Saving…" : "Submitting…",
              success: isEdit ? "Review updated!" : "Review submitted!",
              error: "Something went wrong.",
            })
          }
        >
          {isEdit ? "Save changes" : "Submit review"}
        </button>
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  highlight,
  onEdit,
  onDelete,
  displayName: displayNameProp,
}: {
  review: ReviewWithUser;
  highlight?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  displayName?: string;
}) {
  const user = (review.expand as any)?.user as UsersResponse | undefined;
  const initial =
    displayNameProp?.[0]?.toUpperCase() ??
    user?.username?.[0]?.toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    "?";
  const displayName =
    displayNameProp ??
    user?.username ??
    user?.email?.split("@")[0] ??
    "Anonymous";

  return (
    <div
      className={`rounded-2xl p-5 flex flex-col gap-3 ${
        highlight
          ? "border-2 border-primary/30 bg-primary/5"
          : "border border-base-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="avatar avatar-placeholder shrink-0">
            <div
              className={`rounded-full size-9 text-sm font-bold ${
                highlight
                  ? "bg-primary text-primary-content"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <span>{initial}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold leading-tight">
                {displayName}
              </p>
              {highlight && (
                <BadgeCheck size={14} className="text-primary shrink-0" />
              )}
            </div>
            <p className="text-xs text-base-content/40">
              {new Date(review.created).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Stars rating={review.review_stars ?? 0} size={13} />
          {highlight && (
            <div className="flex items-center gap-1 ml-1">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="btn btn-ghost btn-xs"
                  title="Edit review"
                >
                  <Pencil size={13} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="btn btn-ghost btn-xs text-error"
                  title="Delete review"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {review.review_message && (
        <p className="text-sm text-base-content/80 leading-relaxed">
          {review.review_message}
        </p>
      )}
    </div>
  );
}

export default function ProductReviews({ productId }: { productId: string }) {
  const userId = pb.authStore.record?.id;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const qc = useQueryClient();

  const reviewsQuery = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () =>
      pb.collection("reviews").getFullList<ReviewWithUser>({
        filter: pb.filter("product = {:id}", { id: productId }),
        expand: "user",
        sort: "-created",
      }),
    enabled: !!productId,
  });

  const profile = useProfile((s) => s.profile);

  const myReviewQuery = useQuery({
    queryKey: ["my-review", productId],
    queryFn: () =>
      pb.send<{ data: ReviewWithUser | null; message: string }>(
        `/review/${productId}`,
        { method: "GET" },
      ),
    enabled: !!userId && !!productId,
  });

  const myReview = myReviewQuery.data?.data ?? undefined;
  const hasReviewed = !!myReview;

  const deleteMut = useMutation({
    mutationFn: () => pb.send(`/review/${productId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", productId] });
      qc.invalidateQueries({ queryKey: ["my-review", productId] });
    },
  });

  const reviews = reviewsQuery.data ?? [];
  const otherReviews = reviews.filter((r) => r.user !== userId);
  const total = reviews.length;
  const average =
    total > 0
      ? reviews.reduce((sum, r) => sum + (r.review_stars ?? 0), 0) / total
      : 0;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.review_stars === star).length,
  }));
  const canReview = !!userId && !hasReviewed && !myReviewQuery.isLoading;

  if (reviewsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="skeleton h-6 w-32" />
        <div className="skeleton h-28 w-full rounded-2xl" />
        {[1, 2].map((i) => (
          <div key={i} className="skeleton h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">
          Reviews
          {total > 0 && (
            <span className="text-base-content/40 font-normal ml-2">
              ({total})
            </span>
          )}
        </h2>
        {canReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-ghost gap-1.5"
          >
            <PenLine size={15} />
            Write a review
          </button>
        )}
      </div>

      {showForm && (
        <ReviewForm
          productId={productId}
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {total === 0 && !showForm ? (
        <div className="rounded-2xl border border-base-200 p-8 flex flex-col items-center gap-3 text-base-content/40">
          <Star size={28} strokeWidth={1.5} />
          <p className="text-sm">No reviews yet.</p>
          {canReview && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              Be the first to review
            </button>
          )}
        </div>
      ) : (
        total > 0 && (
          <>
            <div className="rounded-2xl border border-base-200 p-5 flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col items-center justify-center gap-1 shrink-0 sm:w-32">
                <p className="text-5xl font-black tabular-nums">
                  {average.toFixed(1)}
                </p>
                <Stars rating={Math.round(average)} size={16} />
                <p className="text-xs text-base-content/40 mt-1">
                  {total} review{total !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex-1 flex flex-col gap-1.5 justify-center">
                {distribution.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-base-content/50 text-right">
                      {star}
                    </span>
                    <Star
                      size={10}
                      className="text-warning fill-warning shrink-0"
                    />
                    <div className="flex-1 rounded-full bg-base-200 h-2 overflow-hidden">
                      <div
                        className="h-full bg-warning rounded-full transition-all"
                        style={{
                          width: total ? `${(count / total) * 100}%` : "0%",
                        }}
                      />
                    </div>
                    <span className="w-4 text-base-content/40 text-right">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {myReview && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-primary uppercase tracking-widest">
                  Your review
                </p>
                {editing ? (
                  <ReviewForm
                    productId={productId}
                    initial={{
                      stars: myReview.review_stars ?? 0,
                      message: myReview.review_message ?? "",
                    }}
                    onSuccess={() => setEditing(false)}
                    onCancel={() => setEditing(false)}
                  />
                ) : (
                  <ReviewCard
                    review={myReview}
                    highlight
                    displayName={
                      [profile?.firstName, profile?.lastName]
                        .filter(Boolean)
                        .join(" ") ||
                      profile?.username ||
                      profile?.email ||
                      undefined
                    }
                    onEdit={() => setEditing(true)}
                    onDelete={() =>
                      toast.promise(deleteMut.mutateAsync(), {
                        loading: "Deleting…",
                        success: "Review deleted.",
                        error: "Failed to delete.",
                      })
                    }
                  />
                )}
              </div>
            )}

            {otherReviews.length > 0 && (
              <div className="flex flex-col gap-3">
                {myReview && (
                  <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest">
                    Other reviews
                  </p>
                )}
                {otherReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </>
        )
      )}
    </section>
  );
}
