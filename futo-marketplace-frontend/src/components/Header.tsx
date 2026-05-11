import { Link } from "@tanstack/react-router";
import { Search, Heart, MessageCircle, Bell, User, Menu } from "lucide-react";
import { useState } from "react";
import logoImg from "../assets/futo.jpg"; // 👈 your image logo
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const nav = [
  { to: "/browse", label: "Browse" },
  { to: "/categories", label: "Categories" },
  { to: "/sell", label: "Sell" },
  { to: "/pricing", label: "Pricing" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">

        {/* ✅ NEW LOGO SECTION */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logoImg}
            alt="Futo Market Logo"
            className="h-9 w-9 rounded-full object-cover"
          />
          <span className="hidden sm:block font-bold text-lg">
            Futo Market
          </span>
        </Link>

        {/* NAV LINKS */}
        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
              activeProps={{ className: "text-primary bg-accent/40" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="ml-auto hidden items-center gap-1 md:flex">
          <Link to="/browse" className="rounded-full p-2 text-muted-foreground hover:bg-accent/50 hover:text-foreground">
            <Search className="h-5 w-5" />
          </Link>

          <Link to="/favorites" className="rounded-full p-2 text-muted-foreground hover:bg-accent/50 hover:text-foreground">
            <Heart className="h-5 w-5" />
          </Link>

          <Link to="/messages" className="relative rounded-full p-2 text-muted-foreground hover:bg-accent/50 hover:text-foreground">
            <MessageCircle className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          </Link>

          <Link to="/notifications" className="rounded-full p-2 text-muted-foreground hover:bg-accent/50 hover:text-foreground">
            <Bell className="h-5 w-5" />
          </Link>

          <div className="mx-2 h-6 w-px bg-border" />

          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Log in</Link>
          </Button>

          <Button variant="hero" size="sm" asChild>
            <Link to="/register">Get started</Link>
          </Button>
        </div>

        {/* MOBILE MENU */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="ml-auto md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-72">
            <div className="mt-8 flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium hover:bg-accent"
                >
                  {item.label}
                </Link>
              ))}

              <div className="my-3 h-px bg-border" />

              <Link to="/favorites" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-accent">
                <Heart className="h-4 w-4" /> Favorites
              </Link>

              <Link to="/messages" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-accent">
                <MessageCircle className="h-4 w-4" /> Messages
              </Link>

              <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-accent">
                <User className="h-4 w-4" /> Dashboard
              </Link>

              <div className="mt-4 flex flex-col gap-2">
                <Button variant="outline" asChild onClick={() => setOpen(false)}>
                  <Link to="/login">Log in</Link>
                </Button>

                <Button variant="hero" asChild onClick={() => setOpen(false)}>
                  <Link to="/register">Get started</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

      </div>
    </header>
  );
}