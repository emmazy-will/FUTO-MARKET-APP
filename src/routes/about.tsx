import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, MessageCircle, Star, Users } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — FUTO Marketplace" },
      { name: "description", content: "Learn about FUTO Marketplace — built by FUTO students, for FUTO students." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-soft py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Built by FUTO students, <span className="text-primary">for FUTO students</span>.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            FUTO Marketplace replaces unorganised WhatsApp groups with a verified, structured and
            secure place for the Federal University of Technology, Owerri community to trade.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "Verified", desc: "Every account confirmed via matric number or school email." },
            { icon: MessageCircle, title: "Private chat", desc: "No phone numbers shared — talk safely in-app." },
            { icon: Star, title: "Trusted ratings", desc: "Earned only after confirmed sales. No fake reviews." },
            { icon: Users, title: "Community-first", desc: "Built around FUTO life — categories, locations, vibes." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-border bg-card p-8 shadow-card sm:p-12">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Our mission</h2>
          <p className="mt-4 text-muted-foreground">
            We want every FUTO student to feel safe and confident when they buy or sell on campus.
            That means verified identities, private communication, and clear trust signals — so you
            can spend less time worrying and more time learning, building, and connecting.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
