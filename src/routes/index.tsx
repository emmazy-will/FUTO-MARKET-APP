import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search, ShieldCheck, MessageCircle, Sparkles, ArrowRight, Star,
  TrendingUp, Users, PackageOpen,
} from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { categories, listings } from "@/lib/mock-data";
import heroimg from "../assets/futo background.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const featured = listings.slice(0, 8);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden bg-background">
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:gap-10 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-12 lg:py-24 lg:px-8">

          {/* LEFT */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-[11px] font-semibold text-primary backdrop-blur sm:text-xs">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified FUTO students only
            </span>

            <h1 className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              The smart way FUTO students{" "}
              <span className="text-primary">
                buy & sell
              </span>{" "}
              on campus.
            </h1>

            <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base lg:text-lg">
              Skip the noisy WhatsApp groups. Find books, gadgets, hostel essentials and more — from verified students you can trust.
            </p>

            {/* SEARCH */}
            <div className="mt-6 flex max-w-xl flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  placeholder="Search textbooks, laptops…"
                  className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>

              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link to="/browse">Search</Link>
              </Button>
            </div>

            {/* INFO */}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>For verified <b className="text-foreground">FUTO students</b></span>
              </div>

              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Be the <b className="text-foreground">first</b> to list</span>
              </div>

              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Rated by <b className="text-foreground">real buyers</b></span>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
              <img
                src={heroimg}
                alt="FUTO students using the marketplace"
                className="h-auto w-full"
              />
            </div>

            {/* FLOAT 1 */}
            <div className="absolute -bottom-4 -left-4 hidden items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold">Verified seller</p>
                <p className="text-[10px] text-muted-foreground">Matric verified</p>
              </div>
            </div>

            {/* FLOAT 2 */}
            <div className="absolute -top-4 right-4 hidden items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5">
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

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">Shop by category</h2>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to="/browse"
              className="flex flex-col items-center rounded-2xl border bg-card p-4 text-center shadow-sm hover:shadow-md"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-xs font-semibold">{cat.name}</span>
              <span className="text-[10px] text-muted-foreground">{cat.count} items</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-card p-8 shadow-lg sm:p-12 lg:p-14">

          <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
                Got something to sell?
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                List in minutes. Reach thousands of FUTO students.
              </p>
            </div>

            <div className="flex gap-3">
              <Button asChild>
                <Link to="/sell">Start selling</Link>
              </Button>
              <Button variant="outline" asChild>
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