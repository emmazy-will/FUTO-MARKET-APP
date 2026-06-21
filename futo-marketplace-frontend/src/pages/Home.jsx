import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import ItemCard from '../components/ItemCard'
import SkeletonCard from '../components/SkeletonCard'
import { getItems } from '../services/items'

const CATEGORIES = [
  { key: 'electronics', label: 'Electronics', emoji: '💻' },
  { key: 'books', label: 'Books', emoji: '📚' },
  { key: 'clothing', label: 'Clothing', emoji: '👕' },
  { key: 'food', label: 'Food', emoji: '🍔' },
  { key: 'furniture', label: 'Furniture', emoji: '🪑' },
  { key: 'services', label: 'Services', emoji: '🔧' },
  { key: 'tickets', label: 'Tickets', emoji: '🎟️' },
  { key: 'other', label: 'Other', emoji: '📦' },
]

export default function Home() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const nav = useNavigate()

  useEffect(() => {
    getItems({ per_page: 8, sort: 'newest' })
      .then(res => setItems(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) nav(`/browse?search=${search}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-dark text-white py-16 px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Buy & Sell on Campus
        </motion.h1>
        <p className="text-white/70 mb-8 text-lg">
          The marketplace built for FUTO students
        </p>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search for laptops, books, clothes..."
            className="flex-1 rounded-xl px-4 py-3 text-dark focus:outline-none"
          />
          <button type="submit"
            className="bg-primary px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
            Search
          </button>
        </form>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-dark mb-4">Browse by Category</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {CATEGORIES.map(cat => (
            <Link key={cat.key} to={`/browse?category=${cat.key}`}
              className="flex flex-col items-center gap-1 p-3 bg-white rounded-xl hover:shadow-md transition hover:border-primary hover:border">
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-xs text-gray-600">{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Latest Listings */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-dark">Latest Listings</h2>
          <Link to="/browse" className="text-primary text-sm hover:underline">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading
            ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : items.map(item => <ItemCard key={item.id} item={item} />)
          }
        </div>
      </div>
    </div>
  )
}