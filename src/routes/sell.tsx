import { createFileRoute, Link } from "@tanstack/react-router";
import { Upload, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/mock-data";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Post a listing — FUTO Marketplace" },
      { name: "description", content: "Sell your items to verified FUTO students in minutes." },
    ],
  }),
  component: SellPage,
});

function SellPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Post a new listing</h1>
          <p className="mt-2 text-muted-foreground">
            Reach thousands of FUTO students. Your first 3 sales are free —{" "}
            <Link to="/pricing" className="font-semibold text-primary hover:underline">
              see plans
            </Link>.
          </p>
        </div>

        <form className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
          {/* Photos */}
          <div>
            <label className="mb-2 block text-sm font-semibold">Photos</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <button
                type="button"
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                <Upload className="h-6 w-6" />
                <span className="text-xs font-medium">Add photo</span>
              </button>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl border border-dashed border-border bg-muted/20"
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Upload up to 6 photos. Clear photos sell faster.</p>
          </div>

          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-semibold">Title</label>
            <input
              type="text"
              placeholder="e.g. MacBook Air M1, like new"
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">Category</label>
              <select className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary">
                {categories.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Condition</label>
              <select className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary">
                <option>New</option>
                <option>Like New</option>
                <option>Good</option>
                <option>Fair</option>
              </select>
            </div>
          </div>

          {/* Price & Location */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">Price (₦)</label>
              <input
                type="number"
                placeholder="0"
                className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">Location</label>
              <input
                type="text"
                placeholder="e.g. Hostel B, FUTO"
                className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-semibold">Description</label>
            <textarea
              rows={5}
              placeholder="Tell buyers about your item — condition, why you're selling, what's included…"
              className="w-full rounded-xl border border-border bg-background p-4 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-primary/5 p-4 text-sm">
            <Sparkles className="h-5 w-5 shrink-0 text-primary" />
            <p>
              <span className="font-semibold">Pro tip:</span> Listings with 3+ photos sell 4× faster.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" type="button">Save draft</Button>
            <Button variant="hero" className="flex-1" type="button">Publish listing</Button>
          </div>
        </form>
      </div>
    </SiteLayout>
  );
}
