import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logout } from '../services/auth'

export default function Navbar() {
  const { user, setUser } = useAuth()
  const nav = useNavigate()

  const handleLogout = () => {
    logout()
    setUser(null)
    nav('/login')
  }

  return (
    <nav className="bg-dark text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="text-xl font-bold text-white">
        FUTO <span className="text-primary">Market</span>
      </Link>

      <Link to="/browse">
        <input placeholder="Search listings..."
          className="hidden md:block bg-white/10 text-white placeholder-white/50 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-primary" />
      </Link>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link to="/notifications" className="text-white hover:text-primary">🔔</Link>
            <Link to="/messages" className="text-white hover:text-primary">💬</Link>
            <Link to="/dashboard" className="text-sm font-medium hover:text-primary">
              {user.name?.split(' ')[0]}
            </Link>
            <button onClick={handleLogout}
              className="text-sm bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm hover:text-primary">Login</Link>
            <Link to="/register"
              className="text-sm bg-primary px-4 py-2 rounded-lg hover:bg-blue-700">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}