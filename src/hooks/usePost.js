import { useState } from 'react'
import api from '../services/apiClient.js'

export default function usePost(url) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const postData = async (payload) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await api.post(url, payload)
      setIsLoading(false)
      return response.data
    } catch (err) {
      setIsLoading(false)
      if (err.response && err.response.status === 403) {
        setError('Permiso denegado: No tienes el rol necesario para CREAR planos.')
      } else {
        setError('Error al conectar con el servidor para crear el Blueprint.')
      }
      throw err 
    }
  }

  return { postData, isLoading, error, setError }
}