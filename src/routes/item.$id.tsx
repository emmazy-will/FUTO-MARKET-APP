import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  Heart, Share2, Flag, MessageCircle, ShieldCheck, MapPin, Eye, Star, ChevronRight,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { getListingById, getListingsBySeller, formatNaira, listings } from "@/lib/mock-data";

export const Route = createFileRoute("/item/$id")({
  loader: ({ params }) => {
    const item = getListingById(params.id);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.item.title} — FUTO Marketplace` },
          { name: "description", content: loaderData.item.description.slice(0, 160) },
          { property: "og:title", content: loaderData.item.title },
          { property: "og:description", content: loaderData.item.description.slice(0, 160) },
          { property: "og:image", content: loaderData.item.images[0] },
          { name: "twitter:image", content: loaderData.item.images[0] },
        ]
      : [],
  }),
  component: ItemPage,
});

function ItemPage() {
  const { item } = Route.useLoaderData();
  const [activeImg, setActiveImg] = useState(0);
  const [saved, setSaved] = useState(false);

  const sellerOther = getListingsBySeller(item.seller.id).filter((l) => l.id !== item.id);
  const related = listings.filter((l) => l.category === item.category && l.id !== item.id).slice(0, 4);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/browse" className="hover:text-primary">Browse</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{item.category}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Gallery */}
          <div>
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
              <img
                src={item.images[activeImg]}
                alt={item.title}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            {item.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
                {item.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${activeImg === i ? "border-primary shadow-soft" : "border-border opacity-70"}`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="text-lg font-bold">Description</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Condition</p>
                  <p className="font-semibold">{item.condition}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="font-semibold">{item.category}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Posted</p>
                  <p className="font-semibold">{item.postedAt}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Views</p>
                  <p className="font-semibold">{item.views}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              {item.promoted && (
                <span className="mb-3 inline-block rounded-full bg-gradient-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  ✨ Promoted listing
                </span>
              )}
              <h1 className="text-2xl font-bold leading-tight tracking-tight">{item.title}</h1>
              <p className="mt-3 text-3xl font-bold text-primary">{formatNaira(item.price)}</p>

              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {item.location}</span>
                <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {item.views} views</span>
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <Button variant="hero" size="lg" className="w-full">
                  <MessageCircle className="h-5 w-5" /> Chat with seller
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setSaved(!saved)}>
                    <Heart className={saved ? "fill-destructive text-destructive" : ""} />
                    {saved ? "Saved" : "Save"}
                  </Button>
                  <Button variant="outline" size="icon" aria-label="Share">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" aria-label="Report">
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Seller card */}
            <Link
              to="/seller/$id"
              params={{ id: item.seller.id }}
              className="block rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:border-primary/40 hover:shadow-card"
            >
              <div className="flex items-center gap-4">
                <img src={item.seller.avatar} alt={item.seller.name} className="h-14 w-14 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-bold">{item.seller.name}</p>
                    {item.seller.verified && <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{item.seller.department}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    <span className="font-semibold">{item.seller.rating}</span>
                    <span className="text-muted-foreground">({item.seller.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
              {item.seller.subscribed && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-xs">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium text-primary">Premium subscriber · Trusted seller</span>
                </div>
              )}
            </Link>

            {/* Safety tips */}
            <div className="rounded-2xl border border-warning/30 bg-warning/5 p-5 text-xs">
              <h4 className="mb-2 font-bold text-foreground">Stay safe on FUTO Marketplace</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Meet in public, well-lit campus areas</li>
                <li>• Inspect the item before paying</li>
                <li>• Keep all chats inside the app</li>
                <li>• Report suspicious sellers immediately</li>
              </ul>
            </div>
          </aside>
        </div>

        {/* Other from seller */}
        {sellerOther.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold tracking-tight">More from {item.seller.name}</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {sellerOther.slice(0, 4).map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold tracking-tight">Similar listings</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        )}
      </div>
    </SiteLayout>
  );
}
