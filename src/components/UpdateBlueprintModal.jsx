import { useState } from 'react'
import useUpdate from '../hooks/useUpdate.js'

export default function UpdateBlueprintModal({ isOpen, onClose, onSuccess, author, name }) {
  const [newX, setNewX] = useState('')
  const [newY, setNewY] = useState('')

  const { updateData, isLoading, error, setError } = useUpdate()

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (newX === '' || newY === '') {
      setError('Debes ingresar coordenadas X e Y válidas.')
      return
    }

    try {
      const url = `/v1/blueprints/${author}/${name}/points`
      
      await updateData(url, { 
        x: parseInt(newX), 
        y: parseInt(newY) 
      })
      
      alert('Punto agregado exitosamente al Blueprint')

      setNewX('')
      setNewY('')
      onSuccess() 
      
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', 
      alignItems: 'center', zIndex: 1000
    }}>
      <div className="card" style={{ width: '350px', background: '#1e293b' }}>
        <h3 style={{ marginTop: 0 }}>Añadir Punto a {name}</h3>
        
        <form onSubmit={handleSubmit} className="grid" style={{ gap: '12px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label>Coordenada X</label>
              <input 
                type="number" required className="input" 
                value={newX} onChange={(e) => setNewX(e.target.value)} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Coordenada Y</label>
              <input 
                type="number" required className="input" 
                value={newY} onChange={(e) => setNewY(e.target.value)} 
              />
            </div>
          </div>
          
          {error && <p style={{ color: '#fca5a5', fontSize: '14px', margin: 0 }}>{error}</p>}
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button type="submit" className="btn" style={{ flex: 1, background: '#f59e0b' }} disabled={isLoading}>
              {isLoading ? 'Añadiendo...' : 'Añadir Punto'}
            </button>
            <button type="button" className="btn" style={{ flex: 1, background: '#475569' }} onClick={onClose} disabled={isLoading}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}