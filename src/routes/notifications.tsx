import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — FUTO Marketplace" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          </div>
        </div>

        <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Bell className="h-7 w-7" />
          </div>
          <p className="mt-5 text-lg font-semibold">You're all caught up</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We'll notify you here when you get new messages, sales, or updates on your listings.
          </p>
          <Button variant="hero" className="mt-6" asChild>
            <Link to="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
