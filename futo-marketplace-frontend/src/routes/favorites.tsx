import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "Favorites — FUTO Marketplace" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <Heart className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Your favorites</h1>
        </div>

        <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-semibold">No favorites yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Tap the heart on any listing to save it here.</p>
          <Button variant="hero" className="mt-6" asChild>
            <Link to="/browse">Browse listings</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
