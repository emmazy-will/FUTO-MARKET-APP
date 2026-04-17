import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Eye, MessageCircle, TrendingUp, ShoppingBag, Heart, Wallet } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { listings, formatNaira } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — FUTO Marketplace" }] }),
  component: DashboardPage,
});

const stats = [
  { label: "Active listings", value: "8", icon: ShoppingBag, change: "+2 this week" },
  { label: "Total views", value: "1,247", icon: Eye, change: "+18% vs last week" },
  { label: "Messages", value: "23", icon: MessageCircle, change: "5 unread" },
  { label: "Sales completed", value: "12", icon: Wallet, change: formatNaira(285000) },
];

function DashboardPage() {
  const myListings = listings.slice(0, 4);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <h1 className="text-3xl font-bold tracking-tight">Chioma 👋</h1>
          </div>
          <Button variant="hero" asChild>
            <Link to="/sell"><Plus className="h-4 w-4" /> New listing</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-2 text-xs font-medium text-success">{s.change}</p>
            </div>
          ))}
        </div>

        {/* Subscription banner */}
        <div className="mt-8 overflow-hidden rounded-2xl bg-gradient-hero p-6 text-primary-foreground shadow-elevated">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium opacity-90">Free tier</p>
              <h3 className="mt-1 text-xl font-bold">2 of 3 free sales remaining</h3>
              <p className="mt-1 text-sm opacity-90">Subscribe to unlock unlimited listings.</p>
            </div>
            <Button variant="default" className="bg-background text-primary hover:bg-background/90" asChild>
              <Link to="/pricing">Upgrade plan</Link>
            </Button>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-background/20">
            <div className="h-full w-2/3 rounded-full bg-background" />
          </div>
        </div>

        {/* My listings */}
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">My listings</h2>
            <Link to="/browse" className="text-sm font-semibold text-primary hover:underline">View all</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {myListings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>

        {/* Quick actions */}
        <section className="mt-12 grid gap-5 sm:grid-cols-3">
          {[
            { icon: Heart, title: "Favorites", desc: "View saved items", to: "/favorites" as const },
            { icon: MessageCircle, title: "Messages", desc: "Chat with buyers", to: "/messages" as const },
            { icon: Wallet, title: "Subscription", desc: "Manage your plan", to: "/pricing" as const },
          ].map((a) => (
            <Link
              key={a.title}
              to={a.to}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                <a.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </SiteLayout>
  );
}
