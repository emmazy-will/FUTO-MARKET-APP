import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { getFavorites, removeFavorite } from '../services/favorites'

export default function Favorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFavorites()
      .then(res => setFavorites(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const remove = async (itemId) => {
    try {
      await removeFavorite(itemId)
      setFavorites(favorites.filter(f => f.item_id !== itemId))
      toast.success('Removed from favorites')
    } catch { toast.error('Could not remove') }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-dark mb-6">Saved Items ❤️</h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl animate-pulse h-48" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🤍</p>
            <p className="mb-4">No saved items yet</p>
            <Link to="/browse"
              className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-blue-700">
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {favorites.map((fav, i) => {
              const item = fav.item
              if (!item) return null
              return (
                <motion.div key={fav.favorite_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  <Link to={`/items/${item.id}`}>
                    <div className="aspect-square bg-gray-100 flex items-center justify-center text-4xl">
                      📦
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-dark truncate text-sm">{item.title}</p>
                      <p className="text-primary font-bold">₦{item.price?.toLocaleString()}</p>
                    </div>
                  </Link>
                  <button onClick={() => remove(item.id)}
                    className="w-full text-xs text-red-400 py-2 hover:bg-red-50 border-t">
                    Remove ✕
                  </button>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}