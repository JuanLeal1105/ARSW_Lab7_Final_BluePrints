import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBlueprint, addPointOptimistic, syncBlueprintPoints } from '../features/blueprints/blueprintsSlice.js'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'

import { createSocket } from '../lib/socketIoClient.js'
import { createStompClient, subscribeBlueprint } from '../lib/stompClient.js'

export default function BlueprintDetailPage() {
  const { author, name } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { current: blueprint, detailStatus, detailError } = useSelector((s) => s.blueprints)
  const [newPoints, setNewPoints] = useState([])
  
  const [tech, setTech] = useState('socketio') 
  const stompRef = useRef(null)
  const socketRef = useRef(null)
  const unsubRef = useRef(null)

  useEffect(() => {
    dispatch(fetchBlueprint({ author, name }))
  }, [author, name, dispatch])

  useEffect(() => {
    unsubRef.current?.(); unsubRef.current = null
    stompRef.current?.deactivate?.(); stompRef.current = null
    socketRef.current?.disconnect?.(); socketRef.current = null

    if (tech === 'stomp') {
      const client = createStompClient()
      stompRef.current = client
      client.onConnect = () => {
        unsubRef.current = subscribeBlueprint(client, author, name, (upd) => {
          dispatch(syncBlueprintPoints(upd))
        })
      }
      client.activate()
    } else if (tech === 'socketio') {
      const s = createSocket()
      socketRef.current = s
      const room = `blueprints.${author}.${name}`
      
      s.emit('join-room', room)
      
      s.on('blueprint-update', (upd) => {
        dispatch(syncBlueprintPoints(upd))
      })
    }

    return () => {
      unsubRef.current?.(); unsubRef.current = null
      stompRef.current?.deactivate?.()
      socketRef.current?.disconnect?.()
    }
  }, [tech, author, name, dispatch])

  const handleCanvasClick = (coords) => {
    setNewPoints([...newPoints, coords])

    if (tech === 'stomp' && stompRef.current?.connected) {
      stompRef.current.publish({ destination: '/app/draw', body: JSON.stringify({ author, name, point: coords }) })
    } else if (tech === 'socketio' && socketRef.current?.connected) {
      const room = `blueprints.${author}.${name}`
      socketRef.current.emit('draw-event', { room, author, name, point: coords })
    }
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Tecnología RT:</label>
          <select 
            value={tech} 
            onChange={(e) => setTech(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          >
            <option value="none">Ninguna (Solo REST)</option>
            <option value="socketio">Socket.IO (Node)</option>
            <option value="stomp">STOMP (Spring)</option>
          </select>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ marginTop: 0, marginBottom: '8px' }}>{blueprint.name}</h2>
          <p style={{ margin: '4px 0' }}><strong>Author:</strong> {blueprint.author}</p>
          <p style={{ margin: '4px 0' }}><strong>Saved Points:</strong> {blueprint.points?.length || 0}</p>
          {newPoints.length > 0 && <p style={{ color: '#f59e0b', margin: '4px 0' }}><strong>Unsaved Points:</strong> {newPoints.length}</p>}
        </div>
      </div>
      
      <div style={{ marginTop: '24px' }}>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>
          * Haz click en el lienzo para dibujar. No olvides presionar Guardar para persistirlos en la base de datos.
        </p>
        <BlueprintCanvas 
          points={allPointsToRender} 
          onCanvasClick={handleCanvasClick} 
        />
      </div>
    </div>
  )
}