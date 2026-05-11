import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Sparkles, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { Listing } from "@/lib/mock-data";
import { formatNaira } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function ListingCard({ listing }: { listing: Listing }) {
  const [saved, setSaved] = useState(false);

  return (
    <Link
      to="/item/$id"
      params={{ id: listing.id }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevated"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={listing.images[0]}
          alt={listing.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {listing.promoted && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-gradient-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-soft">
            <Sparkles className="h-3 w-3" /> Promoted
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            setSaved((s) => !s);
          }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-muted-foreground backdrop-blur transition-colors hover:text-destructive"
          aria-label="Save"
        >
          <Heart className={cn("h-4 w-4 transition-all", saved && "fill-destructive text-destructive")} />
        </button>

        <span className="absolute bottom-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
          {listing.condition}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 font-semibold text-foreground group-hover:text-primary">
          {listing.title}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{listing.category}</p>

        <p className="mt-2 text-xl font-bold text-primary">{formatNaira(listing.price)}</p>

        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
          <div className="flex min-w-0 items-center gap-2">
            <img
              src={listing.seller.avatar}
              alt={listing.seller.name}
              className="h-6 w-6 rounded-full object-cover"
            />
            <span className="truncate text-xs font-medium">{listing.seller.name}</span>
            {listing.seller.verified && (
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{listing.location}</span>
          <span className="ml-auto shrink-0">{listing.postedAt}</span>
        </div>
      </div>
    </Link>
  );
}
