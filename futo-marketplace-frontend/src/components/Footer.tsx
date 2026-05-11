import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Instagram, Twitter, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-gradient-soft">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              The verified marketplace for Federal University of Technology, Owerri students.
            </p>
            <div className="mt-4 flex gap-2">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-muted-foreground shadow-soft transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Marketplace</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/browse" className="hover:text-primary">Browse all</Link></li>
              <li><Link to="/categories" className="hover:text-primary">Categories</Link></li>
              <li><Link to="/sell" className="hover:text-primary">Sell an item</Link></li>
              <li><Link to="/pricing" className="hover:text-primary">Seller plans</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Trust & Safety</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Verification</a></li>
              <li><a href="#" className="hover:text-primary">Safety tips</a></li>
              <li><a href="#" className="hover:text-primary">Report a listing</a></li>
              <li><a href="#" className="hover:text-primary">Disputes</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">FUTO Market</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary">About</Link></li>
              <li><a href="#" className="hover:text-primary">Help center</a></li>
              <li><a href="#" className="hover:text-primary">Privacy</a></li>
              <li><a href="#" className="hover:text-primary">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} FUTO Marketplace. Built for FUTO students, by FUTO students.</p>
          <p>Federal University of Technology, Owerri</p>
        </div>
      </div>
    </footer>
  );
}
