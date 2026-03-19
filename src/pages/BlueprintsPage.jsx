import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllBlueprints, fetchByAuthor, selectTop5Blueprints, showAllInTable, deleteBlueprintOptimistic } from '../features/blueprints/blueprintsSlice.js'
import CreateBlueprintModal from '../components/CreateBlueprintModal.jsx'
import { createSocket } from '../lib/socketIoClient.js'

export default function BlueprintsPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { searchResults: blueprints, listStatus, listError } = useSelector((state) => state.blueprints)
  const top5Blueprints = useSelector(selectTop5Blueprints)

  const [authorInput, setAuthorInput] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const socketRef = useRef(null)

  useEffect(() => {
    socketRef.current = createSocket()
    socketRef.current.on('refresh-dashboard', () => {
      dispatch(fetchAllBlueprints())
      if (authorInput) {
        dispatch(fetchByAuthor(authorInput))
      }
    })

    return () => socketRef.current?.disconnect()
  }, [dispatch, authorInput])

  useEffect(() => {
    dispatch(fetchAllBlueprints())
  }, [dispatch])

  const handleSearch = (e) => {
    e.preventDefault()
    if (authorInput) dispatch(fetchByAuthor(authorInput))
  }

  const handleListAll = () => {
    dispatch(showAllInTable())
  }

  const handleDelete = (author, name) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el plano ${name}?`)) {
      dispatch(deleteBlueprintOptimistic({ author, name }))
        .unwrap()
        .then(() => {
          socketRef.current?.emit('dashboard-update')
        })
        .catch(() => {
          alert('Error al intentar eliminar. Revisa tus permisos o conexión.')
          dispatch(fetchAllBlueprints())
        })
    }
  }

  const totalPuntosAutor = blueprints.reduce((acumulador, bp) => {
    return acumulador + (bp.points?.length || 0)
  }, 0)

  const handleModalSuccess = () => {
    setIsModalOpen(false)
    dispatch(fetchAllBlueprints())
    if (authorInput) dispatch(fetchByAuthor(authorInput))
  }

  return (
    <div className="card" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ marginTop: 0 }}>Blueprints Dashboard</h2>
        <button className="btn primary" onClick={() => setIsModalOpen(true)}>+ Create New</button>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input 
          className="input" 
          value={authorInput} 
          onChange={(e) => setAuthorInput(e.target.value)} 
          placeholder="Buscar por autor..." 
        />
        <button className="btn primary" type="submit">Search</button>
        <button className="btn" type="button" onClick={handleListAll}>Show All</button>
      </form>

      {listStatus === 'failed' && <p style={{ color: '#ef4444' }}>Error: {listError}</p>}
      {listStatus === 'loading' && <p>Loading...</p>}

      <div className="grid cols-3" style={{ gap: '24px' }}>
        <div style={{ gridColumn: 'span 2' }}>
          
          {blueprints.length > 0 && authorInput && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#166534' }}>Panel del Autor: {authorInput}</h3>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#15803d' }}>
                Total de puntos dibujados: {totalPuntosAutor}
              </p>
            </div>
          )}

          {blueprints.length > 0 ? (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 8px' }}>Name</th>
                  <th style={{ padding: '12px 8px' }}>Author</th>
                  <th style={{ padding: '12px 8px' }}>Points</th>
                  <th style={{ padding: '12px 8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blueprints.map(bp => (
                  <tr key={`${bp.author}-${bp.name}`} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 8px' }}>{bp.name}</td>
                    <td style={{ padding: '12px 8px' }}>{bp.author}</td>
                    <td style={{ padding: '12px 8px' }}>{bp.points?.length || 0}</td>
                    <td style={{ padding: '12px 8px', display: 'flex', gap: '8px' }}>
                      <button className="btn primary" onClick={() => navigate(`/blueprint/${bp.author}/${bp.name}`)}>Open</button>
                      <button className="btn" style={{ background: '#ef4444', color: 'white', border: 'none' }} onClick={() => handleDelete(bp.author, bp.name)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (listStatus === 'succeeded' && <p>No data to show.</p>)}
        </div>

        <div className="card" style={{ background: '#1e293b', padding: '16px', color: 'white' }}>
          <h3 style={{ marginTop: 0, color: '#fbbf24' }}>Top 5 Blueprints</h3>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>(For point quantity)</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {top5Blueprints.length === 0 && <p style={{ fontSize: '14px' }}>No data.</p>}
            {top5Blueprints.map((bp, index) => (
              <li key={`top-${bp.author}-${bp.name}`} style={{ padding: '8px 0', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>{index + 1}.</strong> {bp.name}</span>
                <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{bp.points?.length || 0} pts</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <CreateBlueprintModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleModalSuccess} 
      />
    </div>
  )
}