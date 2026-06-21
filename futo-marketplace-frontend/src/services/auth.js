import api from './api'
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL + '/api/v1'

export const register = (data) => api.post('/auth/register', data)

export const verifyEmail = (email, otp) =>
  api.post('/auth/verify-email', { email, otp: parseInt(otp) })

export const resendOtp = (email) =>
  api.post('/auth/resend-otp', null, { params: { email } })

export const login = async (email, password) => {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)
  const res = await axios.post(`${BASE}/auth/login`, form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
  localStorage.setItem('access_token', res.data.access_token)
  localStorage.setItem('refresh_token', res.data.refresh_token)
  localStorage.setItem('user', JSON.stringify(res.data.data.user))
  return res.data
}

export const logout = () => {
  api.post('/auth/logout').catch(() => {})
  localStorage.clear()
}

export const getMe = () => api.get('/auth/me')
export const updateProfile = (data) => api.put('/auth/me', data)
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email })
export const resetPassword = (email, otp, new_password) =>
  api.post('/auth/reset-password', { email, otp: parseInt(otp), new_password })