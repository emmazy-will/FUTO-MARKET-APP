import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { getMessages } from '../services/chat'
import { createSocket } from '../services/chat'
import { useAuth } from '../context/AuthContext'

export default function Conversation() {
  const { id } = useParams()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [socket, setSocket] = useState(null)
  const bottomRef = useRef(null)
  const typingTimer = useRef(null)

  useEffect(() => {
    getMessages(id)
      .then(res => setMessages(res.data.data))
      .catch(() => {})

    const token = localStorage.getItem('access_token')
    const ws = createSocket(token, {
      onMessage: (msg) => {
        setMessages(prev => [...prev, msg])
      },
      onTyping: (data) => {
        setTyping(data.is_typing)
        setTimeout(() => setTyping(false), 3000)
      },
    })
    setSocket(ws)
    return () => ws.close()
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleTyping = () => {
    socket?.typing(parseInt(id), true)
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => socket?.typing(parseInt(id), false), 1500)
  }

  const send = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    socket?.send(parseInt(id), input.trim())
    setInput('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-4">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map((msg) => {
            const isMe = msg.sender_id === user?.id
            return (
              <div key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-white shadow-sm text-dark rounded-bl-sm'
                }`}>
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                    {isMe && (msg.is_read ? ' ✓✓' : ' ✓')}
                  </p>
                </div>
              </div>
            )
          })}

          {typing && (
            <div className="flex justify-start">
              <div className="bg-white shadow-sm px-4 py-2 rounded-2xl rounded-bl-sm text-gray-400 text-sm">
                typing...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={send} className="flex gap-2">
          <input
            value={input}
            onChange={e => { setInput(e.target.value); handleTyping() }}
            placeholder="Type a message..."
            className="flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button type="submit"
            className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition">
            Send
          </button>
        </form>
      </div>
    </div>
  )
}