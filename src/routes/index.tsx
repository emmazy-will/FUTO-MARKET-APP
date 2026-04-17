import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search, ShieldCheck, MessageCircle, Sparkles, ArrowRight, Star,
  TrendingUp, Users, BookOpen, Smartphone, Shirt, UtensilsCrossed,
} from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { categories, listings } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const categoryIcons: Record<string, typeof BookOpen> = {
  "Books & Study": BookOpen,
  Electronics: Smartphone,
  Clothing: Shirt,
  "Food & Drinks": UtensilsCrossed,
};

function HomePage() {
  const featured = listings.slice(0, 8);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-soft">
        <div className="absolute inset-0 bg-gradient-mesh opacity-60" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-24 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified FUTO students only
            </span>
            <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              The smart way FUTO students{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">buy & sell</span> on campus.
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
              Skip the noisy WhatsApp groups. Find books, gadgets, hostel essentials and more — from
              verified students you can trust.
            </p>

            {/* Search */}
            <div className="mt-7 flex max-w-xl items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-card">
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  placeholder="Search textbooks, laptops, hostel items…"
                  className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Button variant="hero" size="lg" asChild>
                <Link to="/browse">Search</Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span><b className="text-foreground">12,400+</b> students</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span><b className="text-foreground">3,800+</b> active listings</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span><b className="text-foreground">4.9</b> avg seller rating</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-primary opacity-20 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
              <img
                src={heroImg}
                alt="FUTO students using the marketplace"
                width={1536}
                height={1024}
                className="h-auto w-full"
              />
            </div>

            {/* Floating cards */}
            <div className="absolute -bottom-4 -left-4 hidden items-center gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-elevated backdrop-blur sm:flex animate-float">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold">Verified seller</p>
                <p className="text-[10px] text-muted-foreground">Matric verified</p>
              </div>
            </div>
            <div className="absolute -top-4 right-4 hidden items-center gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-elevated backdrop-blur sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold">In-app chat</p>
                <p className="text-[10px] text-muted-foreground">No phone numbers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Shop by category</h2>
            <p className="mt-1 text-muted-foreground">Find exactly what you need on campus.</p>
          </div>
          <Link to="/categories" className="hidden text-sm font-semibold text-primary hover:underline sm:inline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to="/browse"
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center shadow-soft transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-card"
            >
              <span className="text-3xl transition-transform group-hover:scale-110">{cat.icon}</span>
              <span className="text-xs font-semibold leading-tight">{cat.name}</span>
              <span className="text-[10px] text-muted-foreground">{cat.count} items</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
              <TrendingUp className="h-7 w-7 text-primary" />
              Trending on campus
            </h2>
            <p className="mt-1 text-muted-foreground">What FUTO students are loving right now.</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/browse">
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-soft py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built around safety. Designed for students.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every account is verified. Every chat is private. Every seller is rated.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Verified students only",
                desc: "Every account is confirmed with a FUTO matric number or school email — no strangers, no scams.",
              },
              {
                icon: MessageCircle,
                title: "Private in-app chat",
                desc: "Talk to sellers without sharing your phone number. Stay safe, stay anonymous.",
              },
              {
                icon: Star,
                title: "Trusted by ratings",
                desc: "Sellers earn ratings only after confirmed sales. Build your reputation, the right way.",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="rounded-2xl border border-border bg-card p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                  <feat.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold">{feat.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 text-primary-foreground shadow-elevated sm:p-14">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Got something to sell? Your first 3 sales are on us.
              </h2>
              <p className="mt-3 max-w-2xl text-primary-foreground/90">
                List in minutes. Reach thousands of FUTO students. Subscribe only after you've proven it works.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="xl" variant="default" className="bg-background text-primary hover:bg-background/90" asChild>
                <Link to="/sell">Start selling</Link>
              </Button>
              <Button size="xl" variant="outline" className="border-white/30 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground" asChild>
                <Link to="/pricing">View plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
