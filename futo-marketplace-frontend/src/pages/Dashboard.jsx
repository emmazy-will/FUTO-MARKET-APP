import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const nav = useNavigate()

  const isSeller = user?.role === 'seller'
  const needsSub = ['free_limit_reached', 'expired'].includes(user?.subscription_status)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-dark mb-1">
            Welcome, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mb-6 capitalize">
            {user?.role} account
            {user?.subscription_status && ` · ${user.subscription_status.replace('_', ' ')}`}
          </p>
        </motion.div>

        {/* Subscription warning */}
        {isSeller && needsSub && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex justify-between items-center">
            <div>
              <p className="font-semibold text-yellow-800">Subscription Required</p>
              <p className="text-sm text-yellow-600">
                You've used your 3 free sales. Subscribe to keep listing.
              </p>
            </div>
            <button onClick={() => nav('/subscription')}
              className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500">
              Subscribe
            </button>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Browse', icon: '🔍', to: '/browse' },
            { label: 'My Orders', icon: '📦', to: '/orders' },
            { label: 'Favorites', icon: '❤️', to: '/favorites' },
            { label: 'Messages', icon: '💬', to: '/messages' },
            ...(isSeller ? [
              { label: 'My Listings', icon: '🏪', to: '/listings/mine' },
              { label: 'Post Item', icon: '➕', to: '/listings/new' },
            ] : []),
            { label: 'Profile', icon: '👤', to: '/profile' },
            { label: 'Notifications', icon: '🔔', to: '/notifications' },
          ].map(item => (
            <Link key={item.label} to={item.to}
              className="bg-white rounded-xl p-4 text-center hover:shadow-md transition hover:border-primary hover:border">
              <p className="text-3xl mb-2">{item.icon}</p>
              <p className="text-sm font-medium text-dark">{item.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}