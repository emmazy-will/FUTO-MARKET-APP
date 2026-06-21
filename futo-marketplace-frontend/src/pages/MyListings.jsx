import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { getSellerItems, deleteItem, markSold } from '../services/items'
import { useAuth } from '../context/AuthContext'

export default function MyListings() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getSellerItems(user.id)
      .then(res => setItems(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return
    try {
      await deleteItem(id)
      setItems(items.filter(i => i.id !== id))
      toast.success('Listing deleted')
    } catch { toast.error('Could not delete') }
  }

  const handleMarkSold = async (id) => {
    try {
      await markSold(id)
      setItems(items.map(i => i.id === id ? { ...i, status: 'sold' } : i))
      toast.success('Marked as sold')
    } catch { toast.error('Could not update') }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-dark">My Listings</h1>
          <Link to="/listings/new"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            + New Listing
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse h-24" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🏪</p>
            <p className="text-lg mb-4">No listings yet</p>
            <Link to="/listings/new"
              className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-blue-700">
              Post your first item
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, i) => {
              const images = (() => { try { return JSON.parse(item.images || '[]') } catch { return [] } })()
              return (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl p-4 flex gap-4 items-center shadow-sm"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {images[0]
                      ? <img src={images[0]} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-dark truncate">{item.title}</p>
                    <p className="text-primary font-bold">₦{item.price?.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.status === 'active' ? 'bg-green-100 text-green-700' :
                      item.status === 'sold' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link to={`/items/${item.id}`}
                      className="text-sm border px-3 py-1 rounded-lg hover:border-primary hover:text-primary">
                      View
                    </Link>
                    {item.status === 'active' && (
                      <button onClick={() => handleMarkSold(item.id)}
                        className="text-sm border px-3 py-1 rounded-lg hover:border-green-500 hover:text-green-600">
                        Mark Sold
                      </button>
                    )}
                    <button onClick={() => handleDelete(item.id)}
                      className="text-sm border px-3 py-1 rounded-lg hover:border-red-400 hover:text-red-500">
                      Delete
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}