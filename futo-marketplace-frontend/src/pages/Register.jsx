import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { register } from '../services/auth'

export default function Register() {
  const nav = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', username: '', password: '', role: 'buyer', matric_number: ''
  })
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      toast.success('Check your email for the OTP!')
      nav('/verify', { state: { email: form.email } })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-dark mb-2">Create Account</h1>
        <p className="text-gray-500 mb-6">Join FUTO Marketplace</p>

        <form onSubmit={submit} className="space-y-4">
          <input name="name" placeholder="Full Name" value={form.name}
            onChange={handle} required
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
          <input name="email" type="email" placeholder="Email" value={form.email}
            onChange={handle} required
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
          <input name="username" placeholder="Username" value={form.username}
            onChange={handle} required
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
          <input name="matric_number" placeholder="Matric Number (optional)" value={form.matric_number}
            onChange={handle}
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
          <input name="password" type="password" placeholder="Password" value={form.password}
            onChange={handle} required
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
          <select name="role" value={form.role} onChange={handle}
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="buyer">I want to buy</option>
            <option value="seller">I want to sell</option>
          </select>

          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}