import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Search, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { listings } from "@/lib/mock-data";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — FUTO Marketplace" }] }),
  component: MessagesPage,
});

const conversations = listings.slice(0, 5).map((l, i) => ({
  id: l.id,
  listing: l,
  lastMessage: [
    "Is this still available?",
    "Can I see more photos?",
    "I'll come pick it up tomorrow 👍",
    "Can you do ₦220,000?",
    "Thanks! Confirmed.",
  ][i],
  time: ["2m", "1h", "3h", "Yesterday", "2d"][i],
  unread: i < 2,
}));

const messages = [
  { from: "them", text: "Hi! Is this MacBook still available?", time: "10:24" },
  { from: "me", text: "Hey 👋 Yes, it is.", time: "10:26" },
  { from: "them", text: "Great. Could you share the battery health screenshot?", time: "10:27" },
  { from: "me", text: "Sure — sending now. It's at 92%.", time: "10:28" },
  { from: "them", text: "Perfect. Can I see it tomorrow at the school of engineering?", time: "10:30" },
];

function MessagesPage() {
  const [active, setActive] = useState(conversations[0]);
  const [text, setText] = useState("");

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">Messages</h1>

        <div className="grid h-[640px] overflow-hidden rounded-3xl border border-border bg-card shadow-card md:grid-cols-[320px_1fr]">
          {/* List */}
          <aside className="flex flex-col border-r border-border">
            <div className="border-b border-border p-4">
              <div className="flex h-10 items-center gap-2 rounded-xl bg-muted px-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input placeholder="Search…" className="flex-1 bg-transparent text-sm outline-none" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActive(c)}
                  className={`flex w-full items-start gap-3 border-b border-border/60 p-4 text-left transition-colors hover:bg-muted/50 ${active.id === c.id ? "bg-primary/5" : ""}`}
                >
                  <img src={c.listing.seller.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{c.listing.seller.name}</p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{c.listing.title}</p>
                    <p className="mt-1 truncate text-xs">{c.lastMessage}</p>
                  </div>
                  {c.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
          </aside>

          {/* Thread */}
          <section className="flex flex-col">
            <div className="flex items-center gap-3 border-b border-border p-4">
              <img src={active.listing.seller.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold">{active.listing.seller.name}</p>
                  {active.listing.seller.verified && <ShieldCheck className="h-4 w-4 text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground">About: {active.listing.title}</p>
              </div>
              <img src={active.listing.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-soft p-6">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === "me" ? "justify-end" : ""}`}>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-soft ${m.from === "me" ? "bg-gradient-primary text-primary-foreground" : "bg-card"}`}
                  >
                    <p>{m.text}</p>
                    <p className={`mt-1 text-[10px] ${m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{m.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-4">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 focus-within:border-primary">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message…"
                  className="h-11 flex-1 bg-transparent text-sm outline-none"
                />
                <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-soft hover:shadow-card">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
