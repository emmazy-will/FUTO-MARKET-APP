import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Lock, User, GraduationCap, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — FUTO Marketplace" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const [show, setShow] = useState(false);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-hero lg:block">
        <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
        <div className="relative flex h-full flex-col justify-center p-12 text-primary-foreground">
          <h2 className="text-4xl font-bold leading-tight">Join 12,000+ FUTO students.</h2>
          <p className="mt-4 max-w-md text-primary-foreground/90">
            Create an account in under a minute. Verify your matric number and start trading on campus.
          </p>
          <ul className="mt-8 space-y-3 max-w-md">
            {[
              "Buy and sell with verified students",
              "Chat without sharing your phone number",
              "Build your reputation with seller ratings",
              "Your first 3 sales are completely free",
            ].map((b) => (
              <li key={b} className="flex items-start gap-3 rounded-xl bg-background/10 p-3 backdrop-blur">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
                <span className="text-sm">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Logo />
          <h1 className="mt-8 text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1 text-muted-foreground">For verified FUTO students only.</p>

          <form className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Full name</label>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:border-primary">
                <User className="h-4 w-4 text-muted-foreground" />
                <input placeholder="Your full name" className="flex-1 bg-transparent text-sm outline-none" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">FUTO email</label>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:border-primary">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input type="email" placeholder="you@futo.edu.ng" className="flex-1 bg-transparent text-sm outline-none" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Matric number</label>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:border-primary">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <input placeholder="2021/123456" className="flex-1 bg-transparent text-sm outline-none" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Password</label>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:border-primary">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input type={show ? "text" : "password"} placeholder="At least 8 characters" className="flex-1 bg-transparent text-sm outline-none" />
                <button type="button" onClick={() => setShow((s) => !s)} className="text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button variant="hero" size="lg" className="w-full" type="button">
              Create account
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By signing up, you agree to our Terms and Privacy Policy.
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
