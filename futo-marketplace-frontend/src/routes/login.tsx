import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — FUTO Marketplace" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [show, setShow] = useState(false);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Logo />
          <h1 className="mt-8 text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-muted-foreground">Log in to continue buying & selling on campus.</p>

          <form className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">FUTO email</label>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:border-primary">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input type="email" placeholder="you@futo.edu.ng" className="flex-1 bg-transparent text-sm outline-none" />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-medium">Password</label>
                <a href="#" className="text-xs font-medium text-primary hover:underline">Forgot?</a>
              </div>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:border-primary">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input type={show ? "text" : "password"} placeholder="••••••••" className="flex-1 bg-transparent text-sm outline-none" />
                <button type="button" onClick={() => setShow((s) => !s)} className="text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button variant="hero" size="lg" className="w-full" type="button">
              Log in
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              New to FUTO Market?{" "}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Visual */}
      <div className="relative hidden overflow-hidden bg-gradient-hero lg:block">
        <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
        <div className="relative flex h-full flex-col justify-center p-12 text-primary-foreground">
          <h2 className="text-4xl font-bold leading-tight">
            The trusted marketplace for FUTO students.
          </h2>
          <p className="mt-4 max-w-md text-primary-foreground/90">
            Verified accounts. Private chat. Honest ratings. Everything you need to buy and sell on campus, safely.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            {[
              { v: "12K+", l: "Students" },
              { v: "3.8K", l: "Listings" },
              { v: "4.9★", l: "Avg rating" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-background/10 p-4 backdrop-blur">
                <p className="text-2xl font-bold">{s.v}</p>
                <p className="text-xs text-primary-foreground/80">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
