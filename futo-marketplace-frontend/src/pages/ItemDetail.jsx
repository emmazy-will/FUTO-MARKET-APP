import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { getItem, reportItem, deleteItem, markSold } from '../services/items'
import { addFavorite, removeFavorite } from '../services/favorites'
import { startConversation } from '../services/chat'
import { createOrder } from '../services/orders'
import { useAuth } from '../context/AuthContext'

export default function ItemDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { user } = useAuth()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [favorited, setFavorited] = useState(false)

  useEffect(() => {
    getItem(id)
      .then(res => setItem(res.data.data))
      .catch(() => toast.error('Item not found'))
      .finally(() => setLoading(false))
  }, [id])

  const images = (() => {
    try { return JSON.parse(item?.images || '[]') } catch { return [] }
  })()

  const handleChat = async () => {
    if (!user) return nav('/login')
    try {
      const res = await startConversation(item.id, item.seller_id)
      nav(`/messages/${res.data.data.conversation_id}`)
    } catch { toast.error('Could not start conversation') }
  }

  const handleOrder = async () => {
    if (!user) return nav('/login')
    try {
      await createOrder(item.id)
      toast.success('Order placed!')
      nav('/orders')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not place order')
    }
  }

  const handleFavorite = async () => {
    if (!user) return nav('/login')
    try {
      if (favorited) { await removeFavorite(item.id); setFavorited(false) }
      else { await addFavorite(item.id); setFavorited(true) }
    } catch {}
  }

  const handleDelete = async () => {
    if (!confirm('Delete this listing?')) return
    try {
      await deleteItem(item.id)
      toast.success('Listing deleted')
      nav('/listings/mine')
    } catch { toast.error('Could not delete') }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  )

  if (!item) return null

  const isOwner = user?.id === item.seller_id

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">

          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-3">
              {images[imgIdx] ? (
                <img src={images[imgIdx]} alt={item.title}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">📦</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${i === imgIdx ? 'border-primary' : 'border-transparent'}`}>
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-bold text-dark">{item.title}</h1>
              <button onClick={handleFavorite} className="text-2xl">
                {favorited ? '❤️' : '🤍'}
              </button>
            </div>

            <p className="text-3xl font-bold text-primary mb-4">
              ₦{item.price?.toLocaleString()}
            </p>

            <div className="flex gap-2 flex-wrap mb-4">
              <span className="bg-blue-50 text-primary px-3 py-1 rounded-full text-sm capitalize">
                {item.category}
              </span>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm capitalize">
                {item.condition?.replace('_', ' ')}
              </span>
              {item.status === 'sold' && (
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">Sold</span>
              )}
            </div>

            {item.location && (
              <p className="text-gray-500 mb-4">📍 {item.location}</p>
            )}

            {item.description && (
              <p className="text-gray-600 mb-6 leading-relaxed">{item.description}</p>
            )}

            {/* Seller info */}
            {item.seller && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Seller</p>
                <p className="font-semibold">{item.seller.name}</p>
                <p className="text-sm text-gray-400">@{item.seller.username}</p>
              </div>
            )}

            {/* Actions */}
            {!isOwner && item.status === 'active' && (
              <div className="space-y-3">
                <button onClick={handleChat}
                  className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
                  💬 Chat Seller
                </button>
                <button onClick={handleOrder}
                  className="w-full border-2 border-primary text-primary py-3 rounded-xl font-semibold hover:bg-blue-50 transition">
                  🛒 Place Order
                </button>
              </div>
            )}

            {isOwner && (
              <div className="space-y-3">
                <button onClick={() => nav(`/listings/edit/${item.id}`)}
                  className="w-full border-2 border-dark text-dark py-3 rounded-xl font-semibold hover:bg-gray-100 transition">
                  ✏️ Edit Listing
                </button>
                <button onClick={handleDelete}
                  className="w-full bg-red-50 text-red-500 border border-red-200 py-3 rounded-xl font-semibold hover:bg-red-100 transition">
                  🗑️ Delete Listing
                </button>
              </div>
            )}

            {/* Report */}
            {!isOwner && (
              <button onClick={() => {
                const reason = prompt('Reason for reporting:')
                if (reason) reportItem(item.id, reason).then(() => toast.success('Reported'))
              }} className="mt-4 text-sm text-gray-400 hover:text-red-400 block">
                ⚠️ Report this listing
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}