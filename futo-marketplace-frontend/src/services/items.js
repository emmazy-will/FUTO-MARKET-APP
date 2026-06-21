import api from './api'

export const getItems = (params) => api.get('/items', { params })
export const getItem = (id) => api.get(`/items/${id}`)
export const getSellerItems = (id, params) => api.get(`/items/seller/${id}`, { params })
export const createItem = (formData) =>
  api.post('/items', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const updateItem = (id, data) => api.put(`/items/${id}`, data)
export const markSold = (id) => api.put(`/items/${id}/mark-sold`)
export const deleteItem = (id) => api.delete(`/items/${id}`)
export const reportItem = (id, reason) => api.post(`/items/${id}/report`, { reason })