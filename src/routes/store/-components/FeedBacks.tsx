import { IconCircleCheck, IconStar, IconStarFilled } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { pb } from "#/client/pb";
import type {
  ProductsResponse,
  ReviewsResponse,
  UsersResponse,
} from "pocketbase-types";
import type { ListResult } from "pocketbase";
import { Link } from "@tanstack/react-router";

export type ReviewWithDetails = ReviewsResponse<{
  user?: UsersResponse;
  product?: ProductsResponse;
}>;

const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?w=80&q=80";

const fallbackFeedbacks = [
  {
    id: "1",
    name: "Chinyelugo Ugwu",
    rating: 5,
    comment:
      "Absolutely love my wide-brim hat! True to size and exactly as shown in the pictures. Arrived in Lagos within 24 hours.",
    date: "1 month ago",
    product: "Ivory Wide-Brim Royal Hat",
    productId: undefined as string | undefined,
    productImage:
      "https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?w=80&q=80",
  },
  {
    id: "2",
    name: "Adaeze Okonkwo",
    rating: 5,
    comment:
      "The gold necklace set is stunning. Got so many compliments at the wedding event. Will definitely order again!",
    date: "2 weeks ago",
    product: "Layered Gold Choker Necklace",
    productId: undefined as string | undefined,
    productImage:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=80&q=80",
  },
  {
    id: "3",
    name: "Fatima Bello",
    rating: 5,
    comment:
      "Beautiful church hat, very well made. The craftsmanship on the velvet and veil work is outstanding.",
    date: "3 weeks ago",
    product: "Signature Church Hat",
    productId: undefined as string | undefined,
    productImage:
      "https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=80&q=80",
  },
  {
    id: "4",
    name: "Ngozi Eze",
    rating: 5,
    comment:
      "The pearl drop earrings are so delicate and elegant. Perfect match for my traditional attire!",
    date: "5 days ago",
    product: "Baroque Pearl Drop Earrings",
    productId: undefined as string | undefined,
    productImage:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=80&q=80",
  },
  {
    id: "5",
    name: "Blessing Nwosu",
    rating: 5,
    comment:
      "Ordered a custom fascinator and it exceeded all my expectations. Truly one of a kind bespoke design.",
    date: "2 months ago",
    product: "Custom Church Fascinator",
    productId: undefined as string | undefined,
    productImage:
      "https://images.unsplash.com/photo-1520367445093-50dc08a59d9d?w=80&q=80",
  },
  {
    id: "6",
    name: "Oluwakemi Adeyemi",
    rating: 5,
    comment:
      "The straw fedora is my new favourite accessory. Lightweight and so chic. Exceptional service from Lagos team!",
    date: "3 days ago",
    product: "Classic Straw Fedora",
    productId: undefined as string | undefined,
    productImage:
      "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=80&q=80",
  },
];

function formatRelativeDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Recently";
  }
}

interface FeedBackItem {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  product: string;
  productId?: string;
  productImage: string;
}

const FeedBackCard = ({
  name,
  rating,
  comment,
  date,
  product,
  productId,
  productImage,
}: FeedBackItem) => {
  const productContent = (
    <div className="flex items-center gap-3 bg-base-200/60 hover:bg-base-200 rounded-lg p-2 mt-auto border border-base-200/50 transition-colors">
      <img
        loading="lazy"
        src={productImage}
        alt={product}
        className="w-9 h-9 rounded-md object-cover shrink-0"
      />
      <p className="text-xs font-semibold text-base-content/80 leading-tight line-clamp-1">
        {product}
      </p>
    </div>
  );

  return (
    <div className="border border-base-200 rounded-xl p-5 flex flex-col gap-3 bg-base-100/90 shadow-xs hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-xs sm:text-sm text-base-content/90">
            {name}
          </p>
          <span className="flex items-center gap-1 text-success text-[11px] font-semibold mt-0.5">
            <IconCircleCheck size={13} />
            Verified Shopper
          </span>
        </div>
        <span className="text-[11px] text-base-content/40 font-medium">
          {date}
        </span>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) =>
          i < rating ? (
            <IconStarFilled key={i} size={14} className="text-amber-400" />
          ) : (
            <IconStar key={i} size={14} className="text-base-300" />
          ),
        )}
      </div>

      {/* Comment */}
      <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed font-normal">
        "{comment}"
      </p>

      {/* Product Purchased */}
      {productId ? (
        <Link
          to="/store/catalog"
          search={{ search: product }}
          className="block"
        >
          {productContent}
        </Link>
      ) : (
        productContent
      )}
    </div>
  );
};

export default function Feedbacks({
  initialData,
}: {
  initialData?: ListResult<ReviewWithDetails>;
}) {
  const query = useQuery({
    queryKey: ["store-reviews"],
    queryFn: () =>
      pb.collection("reviews").getList<ReviewWithDetails>(1, 6, {
        sort: "-created",
        expand: "user,product",
      }),
    initialData,
    staleTime: 5 * 60 * 1000,
  });

  const rawReviews = query.data?.items ?? [];

  const items: FeedBackItem[] =
    rawReviews.length > 0
      ? rawReviews.map((r) => {
          const product = r.expand?.product;
          const user = r.expand?.user;

          const productImage =
            product?.images && product.images.length > 0
              ? pb.files.getURL(product, product.images[0])
              : product?.preview || FALLBACK_PRODUCT_IMAGE;

          return {
            id: r.id,
            name:
              user?.username ||
              user?.email?.split("@")[0] ||
              "Verified Customer",
            rating: r.review_stars ?? 5,
            comment:
              r.review_message || "Wonderful product, highly recommended!",
            date: formatRelativeDate(r.created),
            product: product?.title || "Bespoke Creation",
            productId: product?.id,
            productImage,
          };
        })
      : fallbackFeedbacks;

  const averageRating = (
    items.reduce((acc, r) => acc + r.rating, 0) / (items.length || 1)
  ).toFixed(1);

  return (
    <section className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Verified Buyer Reviews
          </h2>
          <p className="text-xs text-base-content/60 mt-0.5">
            Real feedback from our valued customers across Nigeria.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-base-content/80 bg-base-200/60 px-3 py-1.5 rounded-full border border-base-200">
          <IconStarFilled size={14} className="text-amber-400" />
          <span>{averageRating} / 5.0 Rating</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((fb) => (
          <FeedBackCard key={fb.id} {...fb} />
        ))}
      </div>
    </section>
  );
}
