import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ItemCard from '../components/ItemCard'
import SkeletonCard from '../components/SkeletonCard'
import { getItems } from '../services/items'

const CATEGORIES = ['electronics','books','clothing','food','furniture','services','tickets','other']
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'most_viewed', label: 'Most Viewed' },
]

export default function Browse() {
  const [params, setParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)

  const filters = {
    search: params.get('search') || '',
    category: params.get('category') || '',
    sort: params.get('sort') || 'newest',
    page: parseInt(params.get('page') || '1'),
  }

  useEffect(() => {
    setLoading(true)
    getItems({ ...filters, per_page: 20 })
      .then(res => {
        setItems(res.data.data)
        setPagination(res.data.pagination)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [params.toString()])

  const update = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    next.set('page', '1')
    setParams(next)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Search bar */}
        <input
          defaultValue={filters.search}
          placeholder="Search listings..."
          onKeyDown={e => e.key === 'Enter' && update('search', e.target.value)}
          className="w-full border rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {/* Filters */}
        <div className="flex gap-3 flex-wrap mb-6">
          <select value={filters.category} onChange={e => update('category', e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={filters.sort} onChange={e => update('sort', e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {(filters.search || filters.category) && (
            <button onClick={() => setParams({})}
              className="border rounded-lg px-3 py-2 text-red-500 hover:bg-red-50">
              Clear filters ✕
            </button>
          )}
        </div>

        {/* Results count */}
        {pagination && (
          <p className="text-gray-500 text-sm mb-4">{pagination.total} listings found</p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading
            ? Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : items.length === 0
              ? <div className="col-span-4 text-center py-16 text-gray-400">
                  <p className="text-4xl mb-2">🔍</p>
                  <p>No listings found</p>
                </div>
              : items.map(item => <ItemCard key={item.id} item={item} />)
          }
        </div>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => update('page', p)}
                className={`px-4 py-2 rounded-lg border ${filters.page === p
                  ? 'bg-primary text-white border-primary'
                  : 'hover:border-primary'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}