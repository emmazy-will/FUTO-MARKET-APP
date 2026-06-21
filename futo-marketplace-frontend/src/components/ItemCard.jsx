import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const CATEGORY_EMOJI = {
  electronics: '💻', books: '📚', clothing: '👕',
  food: '🍔', furniture: '🪑', services: '🔧',
  tickets: '🎟️', other: '📦'
}

export default function ItemCard({ item }) {
  const images = (() => {
    try { return JSON.parse(item.images || '[]') } catch { return [] }
  })()

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
    >
      <Link to={`/items/${item.id}`}>
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {images[0] ? (
            <img src={images[0]} alt={item.title}
              className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              {CATEGORY_EMOJI[item.category] || '📦'}
            </div>
          )}
          {item.is_boosted && (
            <span className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
              ⭐ Featured
            </span>
          )}
          {item.status === 'sold' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">SOLD</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="font-semibold text-dark truncate">{item.title}</p>
          <p className="text-primary font-bold">₦{item.price?.toLocaleString()}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-400 capitalize">{item.condition?.replace('_', ' ')}</span>
            <span className="text-xs text-gray-400">👁 {item.view_count}</span>
          </div>
          {item.location && (
            <p className="text-xs text-gray-400 mt-1 truncate">📍 {item.location}</p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}