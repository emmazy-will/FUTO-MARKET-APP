import api from './api'

export const getConversations = (params) => api.get('/chat/conversations', { params })
export const startConversation = (item_id, seller_id) =>
  api.post('/chat/conversations', { item_id, seller_id })
export const getMessages = (id, params) => api.get(`/chat/messages/${id}`, { params })
export const sendMessage = (conversation_id, content) =>
  api.post('/chat/messages', { conversation_id, content })

export const createSocket = (token, handlers) => {
  const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/api/v1/chat/ws?token=${token}`)
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data)
    if (data.event === 'message:new') handlers.onMessage?.(data.message)
    if (data.event === 'typing:indicator') handlers.onTyping?.(data)
    if (data.event === 'message:read') handlers.onRead?.(data)
  }
  return {
    send: (conv_id, content) =>
      ws.send(JSON.stringify({ event: 'message:send', conversation_id: conv_id, content })),
    typing: (conv_id, isTyping) =>
      ws.send(JSON.stringify({ event: isTyping ? 'typing:start' : 'typing:stop', conversation_id: conv_id })),
    markRead: (conv_id) =>
      ws.send(JSON.stringify({ event: 'message:read', conversation_id: conv_id })),
    close: () => ws.close()
  }
}