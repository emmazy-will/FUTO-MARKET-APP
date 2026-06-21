import api from './api'
export const addFavorite = (id) => api.post(`/favorites/${id}`)
export const removeFavorite = (id) => api.delete(`/favorites/${id}`)
export const getFavorites = (params) => api.get('/favorites', { params })