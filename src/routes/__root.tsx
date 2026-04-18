import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

import appCss from "../styles.css?url";
import faviconUrl from "../assets/favicon.png";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 items-center justify-center bg-gradient-soft px-4">
        <div className="max-w-md text-center">
          <h1 className="text-8xl font-bold text-primary">404</h1>
          <h2 className="mt-4 text-2xl font-semibold text-foreground">Page not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elevated transition hover:shadow-glow"
            >
              Back to marketplace
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FUTO Marketplace — Buy & sell with verified FUTO students" },
      {
        name: "description",
        content:
          "The verified student marketplace for Federal University of Technology, Owerri. Buy, sell and chat safely with fellow FUTO students.",
      },
      { name: "author", content: "FUTO Marketplace" },
      { property: "og:title", content: "FUTO Marketplace" },
      {
        property: "og:description",
        content: "Buy and sell with verified FUTO students. Safe, fast and on-campus.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: faviconUrl },
      { rel: "apple-touch-icon", href: faviconUrl },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
