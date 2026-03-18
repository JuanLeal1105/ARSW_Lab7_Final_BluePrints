import { useState } from 'react'
import usePost from '../hooks/usePost.js'

export default function CreateBlueprintModal({ isOpen, onClose, onSuccess }) {
  const [author, setAuthor] = useState('')
  const [name, setName] = useState('')
  const [points, setPoints] = useState('[{"x": 10, "y": 10}]')

  const { postData, isLoading, error, setError } = usePost('/v1/blueprints')
  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const pointsArray = JSON.parse(points)
      await postData({ 
        author, 
        name, 
        points: pointsArray 
      })
      
      alert('Blueprint creado exitosamente')

      setAuthor('')
      setName('')
      setPoints('[{"x": 10, "y": 10}]')
      onSuccess() 
      
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Error: El formato JSON de los puntos es inválido.')
      }
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', 
      alignItems: 'center', zIndex: 1000
    }}>
      <div className="card" style={{ width: '400px', background: '#1e293b' }}>
        <h3 style={{ marginTop: 0 }}>Crear Nuevo Blueprint</h3>
        
        <form onSubmit={handleSubmit} className="grid" style={{ gap: '12px' }}>
          <div>
            <label htmlFor="author-input">Author</label>
            <input id="author-input" required className="input" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div>
            <label htmlFor="name-input">Name</label>
            <input id="name-input" required className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="points-input">Points (JSON Array)</label>
            <textarea 
              id="points-input"
              required className="input" rows="4" value={points} 
              onChange={(e) => setPoints(e.target.value)} 
            />
          </div>
          {error && <p style={{ color: '#fca5a5', fontSize: '14px', margin: 0 }}>{error}</p>}
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button type="submit" className="btn primary" style={{ flex: 1 }} disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar'}
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