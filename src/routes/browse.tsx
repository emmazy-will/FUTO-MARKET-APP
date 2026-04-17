import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { categories, listings, type Category, type Condition } from "@/lib/mock-data";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse listings — FUTO Marketplace" },
      { name: "description", content: "Browse and filter listings from verified FUTO students." },
    ],
  }),
  component: BrowsePage,
});

const conditions: Condition[] = ["New", "Like New", "Good", "Fair"];
const sorts = ["Newest", "Price: Low to High", "Price: High to Low", "Most viewed"];

function BrowsePage() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<Category | "All">("All");
  const [cond, setCond] = useState<Condition | "All">("All");
  const [maxPrice, setMaxPrice] = useState(600000);
  const [sort, setSort] = useState(sorts[0]);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let r = listings.filter((l) => {
      if (activeCat !== "All" && l.category !== activeCat) return false;
      if (cond !== "All" && l.condition !== cond) return false;
      if (l.price > maxPrice) return false;
      if (query && !l.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
    if (sort === "Price: Low to High") r = [...r].sort((a, b) => a.price - b.price);
    if (sort === "Price: High to Low") r = [...r].sort((a, b) => b.price - a.price);
    if (sort === "Most viewed") r = [...r].sort((a, b) => b.views - a.views);
    return r;
  }, [query, activeCat, cond, maxPrice, sort]);

  return (
    <SiteLayout>
      <div className="border-b border-border bg-gradient-soft">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Browse marketplace</h1>
          <p className="mt-1 text-muted-foreground">{filtered.length} listings from verified FUTO students</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-4 shadow-soft">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search items…"
                className="h-11 flex-1 bg-transparent text-sm outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Clear">
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            <Button variant="outline" onClick={() => setShowFilters((s) => !s)} className="lg:hidden">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </Button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-11 rounded-xl border border-border bg-card px-4 text-sm shadow-soft outline-none focus:border-primary"
            >
              {sorts.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        {/* Sidebar */}
        <aside className={`${showFilters ? "block" : "hidden"} space-y-6 lg:block`}>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="mb-3 text-sm font-bold">Categories</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <button
                  onClick={() => setActiveCat("All")}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors ${activeCat === "All" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                >
                  <span>All categories</span>
                  <span className="text-xs opacity-70">{listings.length}</span>
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.name}>
                  <button
                    onClick={() => setActiveCat(c.name)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors ${activeCat === c.name ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                  >
                    <span>{c.icon} {c.name}</span>
                    <span className="text-xs opacity-70">{c.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="mb-3 text-sm font-bold">Condition</h3>
            <div className="flex flex-wrap gap-2">
              {(["All", ...conditions] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCond(c as Condition | "All")}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${cond === c ? "bg-primary text-primary-foreground" : "border border-border hover:bg-accent"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="mb-3 text-sm font-bold">Max price</h3>
            <input
              type="range"
              min={1000}
              max={600000}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(+e.target.value)}
              className="w-full accent-primary"
            />
            <p className="mt-2 text-sm font-semibold text-primary">
              Up to ₦{maxPrice.toLocaleString()}
            </p>
          </div>
        </aside>

        {/* Results */}
        <div>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">No listings match your filters.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setQuery("");
                  setActiveCat("All");
                  setCond("All");
                  setMaxPrice(600000);
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
