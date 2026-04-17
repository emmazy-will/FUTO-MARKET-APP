import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-display font-bold ${className}`}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
        <ShoppingBag className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
      </span>
      <span className="text-xl tracking-tight">
        FUTO<span className="text-primary">Market</span>
      </span>
    </Link>
  );
}
