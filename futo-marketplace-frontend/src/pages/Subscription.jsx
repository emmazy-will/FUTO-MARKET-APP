import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { getSubStatus, subscribe } from '../services/subscriptions'

const PLANS = [
  {
    key: 'basic',
    label: 'Basic',
    price: '₦2,000/month',
    amount: 200000,
    features: ['Unlimited listings', 'Standard visibility', 'In-app chat'],
  },
  {
    key: 'premium',
    label: 'Premium',
    price: '₦5,000/month',
    amount: 500000,
    features: ['Unlimited listings', 'Boosted placement ⭐', 'Verified badge ✓', 'Seller analytics'],
  },
]

export default function Subscription() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(null)

  useEffect(() => {
    getSubStatus()
      .then(res => setStatus(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSubscribe = async (plan) => {
    setPaying(plan)
    try {
      const res = await subscribe(plan)
      const { amount, email, paystack_public_key } = res.data.data

      if (!window.PaystackPop) {
        toast.error('Paystack not loaded. Add Paystack script to index.html')
        return
      }

      const handler = window.PaystackPop.setup({
        key: paystack_public_key,
        email,
        amount,
        currency: 'NGN',
        callback: () => {
          toast.success('Subscription activated! 🎉')
          getSubStatus().then(r => setStatus(r.data.data))
        },
        onClose: () => toast('Payment cancelled'),
      })
      handler.openIframe()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not initiate payment')
    } finally {
      setPaying(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-dark mb-2">Subscription</h1>

        {loading ? (
          <div className="bg-white rounded-xl p-4 animate-pulse h-20 mb-6" />
        ) : status && (
          <div className={`rounded-xl p-4 mb-8 border ${
            status.subscription_status === 'active'
              ? 'bg-green-50 border-green-200'
              : status.subscription_status === 'free_limit_reached'
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <p className="font-semibold text-dark">
              Current status:{' '}
              <span className="capitalize">
                {status.subscription_status?.replace('_', ' ')}
              </span>
            </p>
            {status.subscription_status === 'free' && (
              <p className="text-sm text-gray-500 mt-1">
                {status.free_sales_remaining} free sale(s) remaining
              </p>
            )}
            {status.active_subscription && (
              <p className="text-sm text-gray-500 mt-1">
                Expires: {new Date(status.active_subscription.expires_at).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {PLANS.map((plan, i) => (
            <motion.div key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white rounded-2xl p-6 shadow-sm border-2 ${
                plan.key === 'premium' ? 'border-primary' : 'border-transparent'
              }`}
            >
              {plan.key === 'premium' && (
                <span className="bg-primary text-white text-xs px-3 py-1 rounded-full mb-3 inline-block">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold text-dark mb-1">{plan.label}</h3>
              <p className="text-2xl font-bold text-primary mb-4">{plan.price}</p>

              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.key)}
                disabled={paying === plan.key}
                className={`w-full py-3 rounded-xl font-semibold transition disabled:opacity-50 ${
                  plan.key === 'premium'
                    ? 'bg-primary text-white hover:bg-blue-700'
                    : 'border-2 border-primary text-primary hover:bg-blue-50'
                }`}
              >
                {paying === plan.key ? 'Processing...' : `Subscribe to ${plan.label}`}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}