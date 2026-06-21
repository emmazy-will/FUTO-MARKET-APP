import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { getOrders, acceptOrder, completeOrder, cancelOrder } from '../services/orders'
import { useAuth } from '../context/AuthContext'

const STATUS_STYLE = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
  disputed: 'bg-red-100 text-red-600',
}

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    getOrders()
      .then(res => setOrders(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handle = async (action, orderId) => {
    try {
      let res
      if (action === 'accept') res = await acceptOrder(orderId)
      if (action === 'complete') res = await completeOrder(orderId)
      if (action === 'cancel') res = await cancelOrder(orderId)
      setOrders(orders.map(o => o.id === orderId ? res.data.data : o))
      toast.success('Order updated')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Action failed')
    }
  }

  const filtered = tab === 'all' ? orders :
    orders.filter(o => o.status === tab)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-dark mb-6">My Orders</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all','pending','accepted','completed','cancelled'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize flex-shrink-0 ${
                tab === t ? 'bg-primary text-white' : 'bg-white border hover:border-primary'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse h-28" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">📦</p>
            <p>No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order, i) => (
              <motion.div key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-dark">Order #{order.id}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLE[order.status]}`}>
                    {order.status}
                  </span>
                </div>

                {order.note && (
                  <p className="text-sm text-gray-500 mb-3 bg-gray-50 rounded-lg p-2">
                    Note: {order.note}
                  </p>
                )}

                <div className="flex gap-2 flex-wrap">
                  {/* Seller actions */}
                  {user?.id === order.seller_id && order.status === 'pending' && (
                    <button onClick={() => handle('accept', order.id)}
                      className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                      Accept Order
                    </button>
                  )}
                  {/* Buyer actions */}
                  {user?.id === order.buyer_id && order.status === 'accepted' && (
                    <button onClick={() => handle('complete', order.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600">
                      Confirm Receipt
                    </button>
                  )}
                  {/* Cancel */}
                  {['pending','accepted'].includes(order.status) && (
                    <button onClick={() => handle('cancel', order.id)}
                      className="border border-red-300 text-red-500 px-4 py-2 rounded-lg text-sm hover:bg-red-50">
                      Cancel
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}