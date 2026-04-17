import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Seller plans — FUTO Marketplace" },
      { name: "description", content: "Free for your first 3 sales. Upgrade for unlimited listings and visibility." },
    ],
  }),
  component: PricingPage,
});

const plans = [
  {
    name: "Free",
    price: "₦0",
    period: "forever",
    desc: "Try the marketplace risk-free.",
    features: ["Up to 3 completed sales", "Basic listing visibility", "In-app chat", "Buyer ratings"],
    cta: "Start selling",
    popular: false,
    icon: Sparkles,
  },
  {
    name: "Basic",
    price: "₦1,500",
    period: "/ month",
    desc: "Perfect for active student sellers.",
    features: ["Unlimited listings", "Standard visibility", "Verified badge eligibility", "Priority support"],
    cta: "Choose Basic",
    popular: true,
    icon: ShieldCheck,
  },
  {
    name: "Premium",
    price: "₦3,500",
    period: "/ month",
    desc: "For top sellers who want maximum reach.",
    features: ["Everything in Basic", "Boosted homepage placement", "Premium verified badge", "Featured in category", "Analytics dashboard"],
    cta: "Choose Premium",
    popular: false,
    icon: Zap,
  },
];

function PricingPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-soft py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-background px-3 py-1 text-xs font-semibold text-primary">
            Seller plans
          </span>
          <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Sell free for your first <span className="text-primary">3 sales</span>.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Upgrade when you're ready to scale. Cancel anytime — no contracts, no fees.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl border p-8 shadow-soft transition-all hover:shadow-card ${plan.popular ? "border-primary bg-gradient-card shadow-card lg:scale-105" : "border-border bg-card"}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-soft">
                  Most popular
                </span>
              )}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <plan.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-2xl font-bold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "hero" : "outline"}
                size="lg"
                className="mt-8 w-full"
                asChild
              >
                <Link to="/register">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          All plans include in-app chat, dispute support and student verification.
        </p>
      </section>
    </SiteLayout>
  );
}
