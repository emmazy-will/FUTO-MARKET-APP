import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/seller/$id")({
  loader: () => {
    // No sellers exist yet — backend will populate.
    throw notFound();
  },
  head: () => ({
    meta: [{ title: "Seller — FUTO Marketplace" }],
  }),
  component: () => null,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Users className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Seller not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Seller profiles will appear here once students start signing up and posting listings.
        </p>
        <Button variant="hero" className="mt-6" asChild>
          <Link to="/browse">Browse marketplace</Link>
        </Button>
      </div>
    </SiteLayout>
  ),
});
