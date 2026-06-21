import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { forgotPassword } from '../services/auth'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const nav = useNavigate()
  const submit = async (e) => {
    e.preventDefault()
    try {
      await forgotPassword(email)
      toast.success('OTP sent!')
      nav('/verify', { state: { email, isReset: true } })
    } catch { toast.error('Email not found') }
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-dark mb-6">Reset Password</h1>
          <form onSubmit={submit} className="space-y-4">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Your email" required
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
            <button type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold">
              Send OTP
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}