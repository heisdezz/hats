import {
  IconPlane,
  IconHeadphones,
  IconRefresh,
  IconShieldCheck,
  IconPigMoney,
} from "@tabler/icons-react";

const features = [
  {
    icon: IconPlane,
    title: "Free Shipping",
    description: "Free nationwide shipping on orders from ₦120,000",
  },
  {
    icon: IconHeadphones,
    title: "Amazing Support",
    description: "We are proud of our award winning customer service",
  },
  {
    icon: IconRefresh,
    title: "100% Money Back",
    description: "We have a favorable, easy & no quibble returns policy",
  },
  {
    icon: IconShieldCheck,
    title: "Payment Secure",
    description: "We provide secure & multiple payment options",
  },
  {
    icon: IconPigMoney,
    title: "Loyalty",
    description: "We reward our loyal customers",
  },
];

export default function Features() {
  return (
    <section className="container mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 py-10">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col items-center text-center gap-3"
          >
            <feature.icon size={36} strokeWidth={1.5} />
            <h3 className="font-bold text-sm">{feature.title}</h3>
            <p className="text-xs text-base-content/60 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
