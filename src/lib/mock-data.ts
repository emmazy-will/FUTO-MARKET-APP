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
  { name: "Books & Study", icon: "📚", count: 142 },
  { name: "Electronics", icon: "💻", count: 318 },
  { name: "Clothing", icon: "👕", count: 207 },
  { name: "Food & Drinks", icon: "🍱", count: 86 },
  { name: "Furniture & Hostel", icon: "🛏️", count: 124 },
  { name: "Services", icon: "🛠️", count: 73 },
  { name: "Tickets & Events", icon: "🎟️", count: 41 },
  { name: "Other", icon: "📦", count: 58 },
];

const sellers: Seller[] = [
  {
    id: "s1",
    name: "Chioma Okeke",
    avatar: "https://i.pravatar.cc/150?img=47",
    rating: 4.9,
    reviewCount: 124,
    verified: true,
    subscribed: true,
    joinedYear: 2023,
    department: "Computer Science",
    bio: "300L CSC. Selling quality used electronics & books.",
  },
  {
    id: "s2",
    name: "Tobi Adeyemi",
    avatar: "https://i.pravatar.cc/150?img=12",
    rating: 4.7,
    reviewCount: 58,
    verified: true,
    subscribed: false,
    joinedYear: 2024,
    department: "Mechanical Engineering",
  },
  {
    id: "s3",
    name: "Amaka Nwosu",
    avatar: "https://i.pravatar.cc/150?img=45",
    rating: 5.0,
    reviewCount: 32,
    verified: true,
    subscribed: true,
    joinedYear: 2022,
    department: "Architecture",
    bio: "Hostel essentials & fashion. Fast delivery on campus.",
  },
  {
    id: "s4",
    name: "Emeka Obi",
    avatar: "https://i.pravatar.cc/150?img=33",
    rating: 4.5,
    reviewCount: 19,
    verified: false,
    subscribed: false,
    joinedYear: 2024,
    department: "Civil Engineering",
  },
  {
    id: "s5",
    name: "Funke Bello",
    avatar: "https://i.pravatar.cc/150?img=44",
    rating: 4.8,
    reviewCount: 76,
    verified: true,
    subscribed: true,
    joinedYear: 2023,
    department: "Food Science",
    bio: "Home-cooked meals delivered to your hostel.",
  },
];

export const listings: Listing[] = [
  {
    id: "l1",
    title: "MacBook Air M1 — 8GB / 256GB",
    description:
      "Excellent condition, used for school work only. Battery health 92%. Comes with original charger and sleeve. No scratches, no dents.",
    price: 520000,
    category: "Electronics",
    condition: "Like New",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&q=80",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900&q=80",
    ],
    seller: sellers[0],
    location: "Hostel D, FUTO",
    postedAt: "2 hours ago",
    views: 234,
    promoted: true,
    status: "active",
  },
  {
    id: "l2",
    title: "Engineering Mathematics Textbook (Stroud)",
    description: "9th edition. Slight wear on cover, all pages intact. Perfect for 200L students.",
    price: 4500,
    category: "Books & Study",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=900&q=80"],
    seller: sellers[1],
    location: "School of Engineering",
    postedAt: "5 hours ago",
    views: 89,
    status: "active",
  },
  {
    id: "l3",
    title: "Mini Fridge — Hostel Friendly",
    description: "Compact 50L fridge. Quiet, energy-saving. Perfect for hostel rooms. Used for one semester.",
    price: 38000,
    category: "Furniture & Hostel",
    condition: "Like New",
    images: ["https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=900&q=80"],
    seller: sellers[2],
    location: "Hostel B, FUTO",
    postedAt: "1 day ago",
    views: 412,
    promoted: true,
    status: "active",
  },
  {
    id: "l4",
    title: "Jollof Rice & Chicken — Daily Delivery",
    description: "Freshly cooked, delivered to your hostel. Order before 11am for lunch delivery.",
    price: 1500,
    category: "Food & Drinks",
    condition: "New",
    images: ["https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=900&q=80"],
    seller: sellers[4],
    location: "Campus-wide",
    postedAt: "3 hours ago",
    views: 521,
    status: "active",
  },
  {
    id: "l5",
    title: "Nike Air Force 1 — Size 42",
    description: "White, gently used. Cleaned and ready for a new owner.",
    price: 22000,
    category: "Clothing",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900&q=80"],
    seller: sellers[1],
    location: "Hostel C, FUTO",
    postedAt: "6 hours ago",
    views: 156,
    status: "active",
  },
  {
    id: "l6",
    title: "iPhone 12 — 128GB Blue",
    description: "Battery 89%, no scratches, FaceID works perfectly. Comes with case and charger.",
    price: 285000,
    category: "Electronics",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=900&q=80"],
    seller: sellers[0],
    location: "Hostel D, FUTO",
    postedAt: "12 hours ago",
    views: 678,
    promoted: true,
    status: "active",
  },
  {
    id: "l7",
    title: "Web Design Tutoring — HTML/CSS/React",
    description: "Affordable 1-on-1 tutoring sessions. Online or in-person. Build your first portfolio.",
    price: 8000,
    category: "Services",
    condition: "New",
    images: ["https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&q=80"],
    seller: sellers[0],
    location: "Online / Campus",
    postedAt: "2 days ago",
    views: 98,
    status: "active",
  },
  {
    id: "l8",
    title: "Reading Lamp — USB Rechargeable",
    description: "Perfect for night studying. 3 brightness levels. Lasts 6+ hours per charge.",
    price: 3200,
    category: "Furniture & Hostel",
    condition: "New",
    images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&q=80"],
    seller: sellers[2],
    location: "Hostel B, FUTO",
    postedAt: "4 hours ago",
    views: 67,
    status: "active",
  },
  {
    id: "l9",
    title: "Convocation Ticket — Extra Pass",
    description: "Selling my extra family pass for this year's convocation. Great seats.",
    price: 5000,
    category: "Tickets & Events",
    condition: "New",
    images: ["https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=900&q=80"],
    seller: sellers[3],
    location: "FUTO Main Auditorium",
    postedAt: "1 day ago",
    views: 142,
    status: "active",
  },
  {
    id: "l10",
    title: "Ankara Dress — Hand Stitched",
    description: "Custom stitched, never worn. Size M. Beautiful pattern.",
    price: 12000,
    category: "Clothing",
    condition: "New",
    images: ["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&q=80"],
    seller: sellers[2],
    location: "Hostel B, FUTO",
    postedAt: "8 hours ago",
    views: 203,
    status: "active",
  },
  {
    id: "l11",
    title: "Gaming Mouse — Logitech G102",
    description: "RGB lighting, 8000 DPI. Used for 4 months. Perfect working condition.",
    price: 9500,
    category: "Electronics",
    condition: "Like New",
    images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=900&q=80"],
    seller: sellers[3],
    location: "Hostel A, FUTO",
    postedAt: "1 day ago",
    views: 88,
    status: "active",
  },
  {
    id: "l12",
    title: "Surveying Practical Manual — SET 200L",
    description: "Complete with diagrams and worked examples. Required text for SET 200L.",
    price: 2500,
    category: "Books & Study",
    condition: "Good",
    images: ["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&q=80"],
    seller: sellers[1],
    location: "School of Engineering",
    postedAt: "3 days ago",
    views: 54,
    status: "active",
  },
];

export const getListingById = (id: string) => listings.find((l) => l.id === id);
export const getListingsBySeller = (sellerId: string) =>
  listings.filter((l) => l.seller.id === sellerId);

export const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
