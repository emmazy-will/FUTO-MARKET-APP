import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { verifyEmail, resendOtp } from '../services/auth'

export default function VerifyEmail() {
  const nav = useNavigate()
  const { state } = useLocation()
  const email = state?.email || ''
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await verifyEmail(email, otp)
      toast.success('Email verified! Please login.')
      nav('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    try {
      await resendOtp(email)
      toast.success('OTP resent!')
    } catch {
      toast.error('Failed to resend OTP')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center"
      >
        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-2xl font-bold text-dark mb-2">Verify Your Email</h1>
        <p className="text-gray-500 mb-6">Enter the OTP sent to <strong>{email}</strong></p>

        <form onSubmit={submit} className="space-y-4">
          <input value={otp} onChange={e => setOtp(e.target.value)}
            placeholder="Enter OTP" maxLength={6} required
            className="w-full border rounded-lg px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary" />
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <button onClick={resend} className="mt-4 text-primary text-sm hover:underline">
          Resend OTP
        </button>
      </motion.div>
    </div>
  )
}