import { useState } from 'react'
import api from '../services/apiClient.js'

export default function useUpdate() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateData = async (url, payload) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await api.put(url, payload)
      setIsLoading(false)
      return response.data
    } catch (err) {
      setIsLoading(false)
      if (err.response && err.response.status === 403) {
        setError('Permiso denegado: No tienes el rol necesario para ACTUALIZAR planos.')
      } else {
        setError('Error al conectar con el servidor para actualizar el Blueprint.')
      }
      
      throw err 
    }
  }

  return { updateData, isLoading, error, setError }
}