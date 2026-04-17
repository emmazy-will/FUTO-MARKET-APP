export type Category =
  | "Books & Study"
  | "Electronics"
  | "Clothing"
  | "Food & Drinks"
  | "Furniture & Hostel"
  | "Services"
  | "Tickets & Events"
  | "Other";

export type Condition = "New" | "Like New" | "Good" | "Fair";

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  subscribed: boolean;
  joinedYear: number;
  department?: string;
  bio?: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  condition: Condition;
  images: string[];
  seller: Seller;
  location: string;
  postedAt: string;
  views: number;
  promoted?: boolean;
  status: "active" | "sold";
}

export const categories: { name: Category; icon: string; count: number }[] = [
  { name: "Books & Study", icon: "📚", count: 0 },
  { name: "Electronics", icon: "💻", count: 0 },
  { name: "Clothing", icon: "👕", count: 0 },
  { name: "Food & Drinks", icon: "🍱", count: 0 },
  { name: "Furniture & Hostel", icon: "🛏️", count: 0 },
  { name: "Services", icon: "🛠️", count: 0 },
  { name: "Tickets & Events", icon: "🎟️", count: 0 },
  { name: "Other", icon: "📦", count: 0 },
];

// Listings, sellers, conversations, notifications come from the backend.
// Frontend ships empty — your backend dev will wire up the real data.
export const listings: Listing[] = [];

export const getListingById = (_id: string): Listing | undefined => undefined;
export const getListingsBySeller = (sellerId: string) =>
  listings.filter((l) => l.seller.id === sellerId);

export const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
