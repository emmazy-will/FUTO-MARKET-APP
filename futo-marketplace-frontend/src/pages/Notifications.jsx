import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { getNotifications, markRead, markAllRead } from '../services/notifications'

export default function Notifications() {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNotifications()
      .then(res => setNotifs(res.data.data.notifications))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleMarkAll = async () => {
    await markAllRead()
    setNotifs(notifs.map(n => ({ ...n, is_read: true })))
  }

  const handleMark = async (id) => {
    await markRead(id)
    setNotifs(notifs.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const ICONS = {
    new_order: '📦', order_accepted: '✅', order_completed: '🎉',
    order_cancelled: '❌', order_disputed: '⚠️',
    subscription_required: '💳', subscription_activated: '🎊',
    subscription_expired: '⏰', rate_seller: '⭐',
    new_message: '💬', default: '🔔'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-dark">Notifications 🔔</h1>
          {notifs.some(n => !n.is_read) && (
            <button onClick={handleMarkAll}
              className="text-sm text-primary hover:underline">
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse h-16" />
            ))}
          </div>
        ) : notifs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🔔</p>
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifs.map((n, i) => (
              <motion.div key={n.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => !n.is_read && handleMark(n.id)}
                className={`flex gap-4 p-4 rounded-xl cursor-pointer transition ${
                  n.is_read ? 'bg-white' : 'bg-blue-50 border border-blue-100'
                }`}
              >
                <span className="text-2xl flex-shrink-0">
                  {ICONS[n.type] || ICONS.default}
                </span>
                <div className="flex-1">
                  <p className={`text-sm ${n.is_read ? 'text-gray-600' : 'text-dark font-medium'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
                {!n.is_read && (
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}