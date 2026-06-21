import api from './api'

export const createOrder = (item_id, note) => api.post('/orders', { item_id, note })
export const getOrders = (params) => api.get('/orders', { params })
export const getOrder = (id) => api.get(`/orders/${id}`)
export const acceptOrder = (id) => api.put(`/orders/${id}/accept`)
export const completeOrder = (id) => api.put(`/orders/${id}/complete`)
export const cancelOrder = (id) => api.put(`/orders/${id}/cancel`)
export const disputeOrder = (id, reason) => api.post(`/orders/${id}/dispute`, { reason })