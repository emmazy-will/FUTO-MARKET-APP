import { createFileRoute } from "@tanstack/react-router";
import { Bell, MessageCircle, ShoppingBag, Star, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — FUTO Marketplace" }] }),
  component: NotificationsPage,
});

const notifications = [
  { icon: MessageCircle, title: "New message from Tobi Adeyemi", desc: "About: Engineering Mathematics Textbook", time: "2m ago", unread: true, color: "primary" },
  { icon: ShoppingBag, title: "Your listing got 50 new views", desc: "MacBook Air M1 — 8GB / 256GB", time: "1h ago", unread: true, color: "success" },
  { icon: Star, title: "New 5★ review from Amaka Nwosu", desc: "\"Smooth transaction. Highly recommend!\"", time: "5h ago", unread: false, color: "warning" },
  { icon: ShieldCheck, title: "You've been verified ✓", desc: "Your matric number was confirmed", time: "1 day ago", unread: false, color: "primary" },
  { icon: Bell, title: "Subscription reminder", desc: "You have 1 free sale remaining on the Free plan", time: "2 days ago", unread: false, color: "warning" },
];

function NotificationsPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          </div>
          <button className="text-sm font-semibold text-primary hover:underline">Mark all as read</button>
        </div>

        <div className="space-y-2 rounded-3xl border border-border bg-card p-2 shadow-card">
          {notifications.map((n, i) => (
            <div
              key={i}
              className={`flex items-start gap-4 rounded-2xl p-4 transition-colors hover:bg-accent/40 ${n.unread ? "bg-primary/5" : ""}`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                n.color === "primary" ? "bg-primary/10 text-primary" :
                n.color === "success" ? "bg-success/10 text-success" :
                "bg-warning/10 text-warning"
              }`}>
                <n.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{n.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.desc}</p>
                <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
              </div>
              {n.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
