import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { createItem } from '../services/items'

const CATEGORIES = ['books','electronics','clothing','food','furniture','services','tickets','other']
const CONDITIONS = ['new','fairly_used','used']

export default function PostListing() {
  const nav = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', price: '', category: 'electronics',
    condition: 'fairly_used', location: ''
  })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      images.forEach(img => fd.append('images', img))
      const res = await createItem(fd)
      toast.success('Listing created!')
      nav(`/items/${res.data.data.id}`)
    } catch (err) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'string' && detail.includes('Subscribe')) {
        toast.error('Subscribe to keep listing items')
        nav('/subscription')
      } else {
        toast.error('Failed to create listing')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6">

          <h1 className="text-2xl font-bold text-dark mb-6">Post a Listing</h1>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input name="title" value={form.title} onChange={handle} required
                placeholder="e.g. Dell Laptop Core i5"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handle}
                placeholder="Describe your item..."
                rows={4}
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦) *</label>
                <input name="price" type="number" value={form.price} onChange={handle} required
                  placeholder="e.g. 45000"
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input name="location" value={form.location} onChange={handle}
                  placeholder="e.g. Hostel A"
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select name="category" value={form.category} onChange={handle}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
                <select name="condition" value={form.condition} onChange={handle}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary">
                  {CONDITIONS.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Images (up to 5)
              </label>
              <input type="file" multiple accept="image/*" onChange={handleImages}
                className="w-full border rounded-lg px-4 py-3" />
              {previews.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {previews.map((p, i) => (
                    <img key={i} src={p} className="w-16 h-16 object-cover rounded-lg border" />
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? 'Publishing...' : 'Publish Listing'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}