import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { getConversations } from '../services/chat'
import { useAuth } from '../context/AuthContext'

export default function Messages() {
  const { user } = useAuth()
  const [convs, setConvs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getConversations()
      .then(res => setConvs(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-dark mb-6">Messages 💬</h1>

        {loading ? (
          <div className="space-y-3">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse h-20" />
            ))}
          </div>
        ) : convs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">💬</p>
            <p>No conversations yet</p>
            <p className="text-sm mt-2">Start chatting by clicking "Chat Seller" on any listing</p>
          </div>
        ) : (
          <div className="space-y-2">
            {convs.map((conv, i) => (
              <motion.div key={conv.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/messages/${conv.id}`}
                  className="flex items-center gap-4 bg-white rounded-xl p-4 hover:shadow-md transition"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                    {conv.other_user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-dark">{conv.other_user?.name}</p>
                      {conv.unread_count > 0 && (
                        <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {conv.item?.title && `Re: ${conv.item.title}`}
                    </p>
                    {conv.last_message && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {conv.last_message.content}
                      </p>
                    )}
                  </div>
                  {conv.other_user?.is_online && (
                    <div className="w-3 h-3 bg-green-400 rounded-full flex-shrink-0" />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}