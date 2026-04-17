import { createFileRoute, notFound } from "@tanstack/react-router";
import { ShieldCheck, Star, MapPin, Calendar } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { getListingsBySeller, listings } from "@/lib/mock-data";

export const Route = createFileRoute("/seller/$id")({
  loader: ({ params }) => {
    const items = getListingsBySeller(params.id);
    const seller = listings.find((l) => l.seller.id === params.id)?.seller;
    if (!seller) throw notFound();
    return { seller, items };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.seller.name} — FUTO Marketplace seller` },
          { name: "description", content: `Browse listings by ${loaderData.seller.name} on FUTO Marketplace.` },
        ]
      : [],
  }),
  component: SellerPage,
});

function SellerPage() {
  const { seller, items } = Route.useLoaderData();

  return (
    <SiteLayout>
      {/* Banner */}
      <div className="bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end">
            <img
              src={seller.avatar}
              alt={seller.name}
              className="h-28 w-28 rounded-3xl border-4 border-background object-cover shadow-elevated"
            />
            <div className="flex-1 text-primary-foreground">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold">{seller.name}</h1>
                {seller.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-background/20 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
                {seller.subscribed && (
                  <span className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-primary">
                    Premium
                  </span>
                )}
              </div>
              <p className="mt-1 text-primary-foreground/90">{seller.department}</p>
              <div className="mt-3 flex flex-wrap gap-5 text-sm text-primary-foreground/90">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <b>{seller.rating}</b> ({seller.reviewCount} reviews)
                </span>
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Joined {seller.joinedYear}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> FUTO Campus</span>
              </div>
            </div>
            <Button variant="default" className="bg-background text-primary hover:bg-background/90">
              Message seller
            </Button>
          </div>
          {seller.bio && (
            <p className="mt-6 max-w-2xl text-sm text-primary-foreground/90">{seller.bio}</p>
          )}
        </div>
      </div>

      {/* Listings */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">
          Active listings <span className="text-muted-foreground">({items.length})</span>
        </h2>
        {items.length === 0 ? (
          <p className="text-muted-foreground">No active listings.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((l: typeof items[number]) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
