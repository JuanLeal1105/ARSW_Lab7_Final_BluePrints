import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBlueprint, addPointOptimistic } from '../features/blueprints/blueprintsSlice.js'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'

export default function BlueprintDetailPage() {
  const { author, name } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { current: blueprint, detailStatus, detailError } = useSelector((s) => s.blueprints)
  const [newPoints, setNewPoints] = useState([])

  useEffect(() => {
    dispatch(fetchBlueprint({ author, name }))
  }, [author, name, dispatch])

  const handleCanvasClick = (coords) => {
    setNewPoints([...newPoints, coords])
  }

  const handleSavePoints = async () => {
    for (const pt of newPoints) {
      await dispatch(addPointOptimistic({ author, name, point: pt })).unwrap()
    }
    setNewPoints([])
    alert('Puntos guardados exitosamente')
  }

  if (detailStatus === 'loading') return <p>Loading blueprint details...</p>
  
  if (detailStatus === 'failed') return (
    <div className="card" style={{ background: '#fee2e2', color: '#991b1b' }}>
      <p>Error: {detailError}</p>
      <button className="btn" onClick={() => dispatch(fetchBlueprint({ author, name }))}>Reintentar</button>
    </div>
  )

  if (!blueprint) return null
  const allPointsToRender = [...(blueprint.points || []), ...newPoints]

  return (
    <div className="card" style={{ position: 'relative' }}>
      <button className="btn" style={{ marginBottom: '16px' }} onClick={() => navigate('/blueprint')}>
        &larr; Back to List
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ marginTop: 0, marginBottom: '8px' }}>{blueprint.name}</h2>
          <p style={{ margin: '4px 0' }}><strong>Author:</strong> {blueprint.author}</p>
          <p style={{ margin: '4px 0' }}><strong>Saved Points:</strong> {blueprint.points?.length || 0}</p>
          {newPoints.length > 0 && <p style={{ color: '#f59e0b', margin: '4px 0' }}><strong>Unsaved Points:</strong> {newPoints.length}</p>}
        </div>

        <button 
          className="btn primary" 
          style={{ height: 'fit-content' }} 
          onClick={handleSavePoints}
          disabled={newPoints.length === 0}
        >
          Save New Points
        </button>
      </div>
      
      <div style={{ marginTop: '24px' }}>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>
          * Haz click en el lienzo para dibujar. No olvides presionar Guardar.
        </p>
        <BlueprintCanvas 
          points={allPointsToRender} 
          onCanvasClick={handleCanvasClick} 
        />
      </div>
    </div>
  )
}