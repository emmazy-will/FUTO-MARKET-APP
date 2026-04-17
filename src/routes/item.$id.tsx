import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PackageOpen } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { getListingById } from "@/lib/mock-data";

export const Route = createFileRoute("/item/$id")({
  loader: ({ params }) => {
    const item = getListingById(params.id);
    if (!item) throw notFound();
    return { item };
  },
  head: () => ({
    meta: [{ title: "Listing — FUTO Marketplace" }],
  }),
  component: ItemPage,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <PackageOpen className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Listing not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This item doesn't exist yet — listings will appear here once the backend is connected.
        </p>
        <Button variant="hero" className="mt-6" asChild>
          <Link to="/browse">Browse marketplace</Link>
        </Button>
      </div>
    </SiteLayout>
  ),
});

function ItemPage() {
  // Backend will populate listings; UI rendering here once data exists.
  return null;
}
