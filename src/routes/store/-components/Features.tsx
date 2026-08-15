import {
  IconTruck,
  IconHeadphones,
  IconShieldCheck,
  IconSparkles,
  IconNeedle,
} from "@tabler/icons-react";

const features = [
  {
    icon: IconTruck,
    title: "Fast Lagos Delivery",
    description: "Free shipping on Lagos orders above ₦150,000",
  },
  {
    icon: IconNeedle,
    title: "Artisanal Millinery",
    description: "Handcrafted with premium materials by expert hat makers",
  },
  {
    icon: IconShieldCheck,
    title: "Instant Paystack Checkout",
    description: "Secure, encrypted end-to-end payment processing",
  },
  {
    icon: IconSparkles,
    title: "Bespoke Custom Orders",
    description: "Tailored color, sizing & head-measurement customization",
  },
  {
    icon: IconHeadphones,
    title: "Dedicated VIP Support",
    description: "Personal styling & order assistance via WhatsApp & phone",
  },
];

export default function Features() {
  return (
    <section className="container mx-auto px-4">
      <div className="bg-base-200/50 rounded-2xl border border-base-200 p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col items-center text-center gap-3 p-3 rounded-xl hover:bg-base-100/80 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-content transition-all duration-300">
              <feature.icon size={22} strokeWidth={1.75} />
            </div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-base-content/90">
              {feature.title}
            </h3>
            <p className="text-xs text-base-content/60 leading-relaxed max-w-[200px]">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
