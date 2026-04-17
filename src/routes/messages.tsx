import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — FUTO Marketplace" }] }),
  component: MessagesPage,
});

function MessagesPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">Messages</h1>

        <div className="rounded-3xl border border-dashed border-border bg-card p-16 text-center shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MessageCircle className="h-7 w-7" />
          </div>
          <p className="mt-5 text-lg font-semibold">No conversations yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            When you chat with a buyer or seller, your conversations will appear here.
          </p>
          <Button variant="hero" className="mt-6" asChild>
            <Link to="/browse">Find something to chat about</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
