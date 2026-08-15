import { createFileRoute, Link } from "@tanstack/react-router";
import { ssr_pb } from "#/client/pb";
import type { CategoryResponse, SectionResponse } from "#/../pocketbase-types";
import {
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Award,
  HeartHandshake,
  Compass,
  Tag,
} from "lucide-react";

export const Route = createFileRoute("/store/about/")({
  component: RouteComponent,
  loader: async () => {
    const pb = ssr_pb();
    const [sections, categories] = await Promise.all([
      pb.collection("section").getFullList<SectionResponse>({
        sort: "name",
      }),
      pb.collection("category").getFullList<CategoryResponse<{ parent?: SectionResponse }>>({
        expand: "parent",
        sort: "name",
      }),
    ]);

    return { sections, categories };
  },
});

function RouteComponent() {
  const { sections, categories } = Route.useLoaderData();

  return (
    <div className="page-wrap py-10 space-y-12 max-w-6xl">
      {/* Brand Hero Section */}
      <section className="relative rounded-3xl bg-gradient-to-br from-primary/10 via-base-200 to-base-100 p-8 md:p-12 border border-base-200 overflow-hidden shadow-xs">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles className="size-3.5" />
            <span>Destinys Concept Atelier</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-base-content font-serif">
            Bespoke Millinery & Handcrafted Artistry
          </h1>
          <p className="text-sm md:text-base text-base-content/70 leading-relaxed">
            Destinys Concept creates couture millinery headpieces, avant-garde fascinators, and bespoke fine jewelry tailored to perfection for royalty, ceremonies, and unforgettable events.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/store/catalog" className="btn btn-primary rounded-xl text-xs px-5">
              Explore Entire Catalog <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Sections & Up to 5 Categories Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-base-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Layers className="size-4" />
              <span>Our Collections & Departments</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-base-content mt-1">
              Curated Sections & Categories
            </h2>
          </div>
          <p className="text-xs text-base-content/50">
            Featuring top 5 categories per atelier department
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((sec) => {
            // Find categories under this section and take at most 5
            const sectionCategories = categories.filter(
              (c) =>
                c.parent === sec.id ||
                c.expand?.parent?.id === sec.id ||
                c.expand?.parent?.name?.toLowerCase() === sec.name?.toLowerCase()
            );
            const top5Categories = sectionCategories.slice(0, 5);

            return (
              <div
                key={sec.id}
                className="card bg-base-100 border border-base-200 shadow-xs hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  {/* Section Title Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                        <Compass className="size-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-base-content capitalize">
                          {sec.name}
                        </h3>
                        <p className="text-[11px] text-base-content/50">
                          {sectionCategories.length} categor{sectionCategories.length === 1 ? "y" : "ies"} total
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Top 5 Categories List */}
                  <div className="space-y-2 pt-2 border-t border-base-200">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-base-content/50">
                      Featured Categories (Top 5):
                    </p>
                    {top5Categories.length > 0 ? (
                      <ul className="space-y-1.5">
                        {top5Categories.map((cat) => (
                          <li key={cat.id}>
                            <Link
                              to="/store/catalog"
                              search={{ section: sec.name, category: cat.id } as any}
                              className="group flex items-center justify-between p-2 rounded-xl bg-base-200/50 hover:bg-primary/10 hover:text-primary transition-all text-xs font-medium"
                            >
                              <span className="flex items-center gap-2">
                                <Tag className="size-3 text-base-content/40 group-hover:text-primary transition-colors" />
                                <span>{cat.name}</span>
                              </span>
                              <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-base-content/40 italic py-2">
                        No categories registered in this section yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Section Action Footer */}
                <div className="p-4 pt-0">
                  <Link
                    to="/store/catalog"
                    search={{ section: sec.name } as any}
                    className="btn btn-sm btn-ghost border border-base-200 hover:btn-primary w-full rounded-xl text-xs gap-1.5"
                  >
                    <span>Browse All {sec.name}</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Atelier Core Values */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 rounded-2xl bg-base-100 border border-base-200 space-y-2 shadow-xs">
          <Award className="size-6 text-primary" />
          <h4 className="font-bold text-sm text-base-content">Couture Craftsmanship</h4>
          <p className="text-xs text-base-content/60 leading-relaxed">
            Every piece is designed, blocked, and hand-stitched by master artisans using premium imported fabrics and sinamay.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-base-100 border border-base-200 space-y-2 shadow-xs">
          <ShieldCheck className="size-6 text-success" />
          <h4 className="font-bold text-sm text-base-content">Custom Fitted Perfection</h4>
          <p className="text-xs text-base-content/60 leading-relaxed">
            We provide exact circumference and sizing specifications to ensure your hat or fascinator rests securely and comfortably.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-base-100 border border-base-200 space-y-2 shadow-xs">
          <HeartHandshake className="size-6 text-info" />
          <h4 className="font-bold text-sm text-base-content">Bespoke Commissions</h4>
          <p className="text-xs text-base-content/60 leading-relaxed">
            Looking for a specific color palette for a wedding or gala? We collaborate closely with you to realize your vision.
          </p>
        </div>
      </section>
    </div>
  );
}
