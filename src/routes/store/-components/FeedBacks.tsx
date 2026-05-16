import { IconCircleCheck, IconStar, IconStarFilled } from "@tabler/icons-react";

const feedbacks = [
  {
    id: "1",
    name: "Chinyelugo Ugwu",
    rating: 5,
    comment:
      "Absolutely love my wide-brim hat! True to size and exactly as shown in the pictures.",
    date: "1 month ago",
    product: "Ivory Wide-Brim Hat",
    productImage:
      "https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?w=80&q=80",
  },
  {
    id: "2",
    name: "Adaeze Okonkwo",
    rating: 5,
    comment:
      "The gold necklace is stunning. Got so many compliments at the event. Will order again!",
    date: "2 weeks ago",
    product: "Gold Layered Necklace",
    productImage:
      "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=80&q=80",
  },
  {
    id: "3",
    name: "Fatima Bello",
    rating: 4,
    comment:
      "Beautiful church hat, very well made. Delivery was a bit slow but worth the wait.",
    date: "3 weeks ago",
    product: "Black Church Hat",
    productImage:
      "https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=80&q=80",
  },
  {
    id: "4",
    name: "Ngozi Eze",
    rating: 5,
    comment:
      "The pearl earrings are so delicate and elegants Perfect for my wedding day!",
    date: "5 days ago",
    product: "Pearl Drop Earrings",
    productImage:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=80&q=80",
  },
  {
    id: "5",
    name: "Blessing Nwosu",
    rating: 5,
    comment:
      "Ordered a custom fascinator and it exceeded my expectations. Truly one of a kind.",
    date: "2 months ago",
    product: "Custom Fascinator",
    productImage:
      "https://images.unsplash.com/photo-1520367445093-50dc08a59d9d?w=80&q=80",
  },
  {
    id: "6",
    name: "Amaka Obi",
    rating: 4,
    comment:
      "Rose gold bracelet is gorgeous. Fits perfectly and doesn't tarnish. Very happy.",
    date: "1 week ago",
    product: "Rose Gold Bracelet",
    productImage:
      "https://images.unsplash.com/photo-1573408301185-9519f94715f6?w=80&q=80",
  },
  {
    id: "7",
    name: "Oluwakemi Adeyemi",
    rating: 5,
    comment:
      "The straw fedora is my new favourite. Lightweight and so chic. Fast delivery too!",
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
  <div className="ring fade rounded-xl p-4 flex flex-col gap-3 bg-base-100">
    {/* Header */}
    <div>
      <p className="font-semibold text-sm">{name}</p>
      <span className="flex items-center gap-1 text-success text-xs mt-0.5">
        <IconCircleCheck size={12} />
        Verified Shopper
      </span>
    </div>

    {/* Stars */}
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {/*{Array.from({ length: 5 }).map((_, i) =>
          i < rating ? (
            <IconStarFilled key={i} size={15} className="text-warning" />
          ) : (
            <IconStar key={i} size={15} className="text-base-300" />
          )
        ))}*/}
      </div>
      <span className="text-xs text-base-content/60">{rating}/5</span>
    </div>

    {/* Comment */}
    <p className="text-sm text-base-content/80 leading-relaxed">{comment}</p>
    <p className="text-xs text-base-content/40">{date}</p>

    {/* Product */}
    <div className="flex items-center gap-3 bg-base-200 rounded-lg p-2 mt-auto">
      <img
        loading="lazy"
        src={productImage}
        alt={product}
        className="w-10 h-10 rounded-md object-cover shrink-0"
      />
      <p className="text-xs font-medium leading-tight line-clamp-2">
        {product}
      </p>
    </div>
  </div>
);

export default function Feedbacks() {
  return (
    <section className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">What our customers say</h2>
        <div className="flex items-center gap-1 text-sm text-base-content/60">
          <IconStarFilled size={14} className="text-warning" />
          <span className="font-semibold text-base-content">4.9</span> ·{" "}
          {feedbacks.length} reviews
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
