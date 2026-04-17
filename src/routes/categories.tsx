import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { categories, listings } from "@/lib/mock-data";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [{ title: "Categories — FUTO Marketplace" }],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <SiteLayout>
      <div className="border-b border-border bg-gradient-soft">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">All categories</h1>
          <p className="mt-2 text-muted-foreground">Find what you need across {listings.length} active listings.</p>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {categories.map((c) => (
          <Link
            key={c.name}
            to="/browse"
            className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-card"
          >
            <span className="text-4xl">{c.icon}</span>
            <h3 className="text-lg font-bold group-hover:text-primary">{c.name}</h3>
            <p className="text-xs text-muted-foreground">{c.count} active listings →</p>
          </Link>
        ))}
      </div>
    </SiteLayout>
  );
}
