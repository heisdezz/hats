import { IconCircleCheck, IconStar, IconStarFilled } from "@tabler/icons-react";

const feedbacks = [
  {
    id: "1",
    name: "Chinyelugo Ugwu",
    rating: 5,
    comment:
      "Absolutely love my wide-brim hat! True to size and exactly as shown in the pictures. Arrived in Lagos within 24 hours.",
    date: "1 month ago",
    product: "Ivory Wide-Brim Royal Hat",
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
    productImage:
      "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=80&q=80",
  },
];

const FeedBackCard = ({
  name,
  rating,
  comment,
  date,
  product,
  productImage,
}: (typeof feedbacks)[0]) => (
  <div className="border border-base-200 rounded-xl p-5 flex flex-col gap-3 bg-base-100/90 shadow-xs hover:shadow-md transition-shadow">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <p className="font-bold text-xs sm:text-sm text-base-content/90">{name}</p>
        <span className="flex items-center gap-1 text-success text-[11px] font-semibold mt-0.5">
          <IconCircleCheck size={13} />
          Verified Lagos Shopper
        </span>
      </div>
      <span className="text-[11px] text-base-content/40 font-medium">{date}</span>
    </div>

    {/* Stars */}
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) =>
        i < rating ? (
          <IconStarFilled key={i} size={14} className="text-amber-400" />
        ) : (
          <IconStar key={i} size={14} className="text-base-300" />
        )
      )}
    </div>

    {/* Comment */}
    <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed font-normal">
      "{comment}"
    </p>

    {/* Product Purchased */}
    <div className="flex items-center gap-3 bg-base-200/60 rounded-lg p-2 mt-auto border border-base-200/50">
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
  </div>
);

export default function Feedbacks() {
  return (
    <section className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Verified Buyer Reviews</h2>
          <p className="text-xs text-base-content/60 mt-0.5">
            Real feedback from our valued customers across Nigeria.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-base-content/80 bg-base-200/60 px-3 py-1.5 rounded-full border border-base-200">
          <IconStarFilled size={14} className="text-amber-400" />
          <span>4.9 / 5.0 Rating</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {feedbacks.map((fb) => (
          <FeedBackCard key={fb.id} {...fb} />
        ))}
      </div>
    </section>
  );
}
