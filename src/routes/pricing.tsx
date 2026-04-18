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
    price: "$7",
    period: "/ month",
    desc: "Perfect for active student sellers.",
    features: ["Unlimited listings", "Standard visibility", "Verified badge eligibility", "Priority support"],
    cta: "Choose Basic",
    popular: true,
    icon: ShieldCheck,
  },
  {
    name: "Premium",
    price: "$15",
    period: "/ year",
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
      <section className="bg-gradient-soft py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-background px-3 py-1 text-[11px] font-semibold text-primary sm:text-xs">
            Seller plans
          </span>
          <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Sell free for your first <span className="text-primary">3 sales</span>.
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
            Upgrade when you're ready to scale. Cancel anytime — no contracts, no fees.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-6 shadow-soft transition-all hover:shadow-card sm:rounded-3xl sm:p-8 ${plan.popular ? "border-primary bg-gradient-card shadow-card md:col-span-2 lg:col-span-1 lg:scale-105" : "border-border bg-card"}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-soft sm:text-[11px]">
                  Most popular
                </span>
              )}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-12 sm:w-12">
                <plan.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold sm:text-2xl">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>
              <div className="mt-5 flex flex-wrap items-baseline gap-1 sm:mt-6">
                <span className="text-4xl font-bold tracking-tight sm:text-5xl">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="mt-5 flex-1 space-y-2.5 text-sm sm:mt-6 sm:space-y-3">
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
                className="mt-6 w-full sm:mt-8"
                asChild
              >
                <Link to="/register">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground sm:mt-10">
          All plans include in-app chat, dispute support and student verification.
        </p>
      </section>
    </SiteLayout>
  );
}
