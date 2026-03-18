import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllBlueprints, fetchByAuthor, selectTop5Blueprints, showAllInTable, deleteBlueprintOptimistic } from '../features/blueprints/blueprintsSlice.js'
import CreateBlueprintModal from '../components/CreateBlueprintModal.jsx'

export default function BlueprintsPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { searchResults: blueprints, listStatus, listError } = useSelector((state) => state.blueprints)
  const top5Blueprints = useSelector(selectTop5Blueprints)

  const [authorInput, setAuthorInput] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

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
        .catch(() => {
          alert('Error al intentar eliminar. Revisa tus permisos o conexión.')
          dispatch(fetchAllBlueprints())
        })
    }
  }

  return (
    <div className="card" style={{ position: 'relative' }}>
      <h2 style={{ marginTop: 0 }}>Gestión de Blueprints</h2>
      <form onSubmit={handleSearch} className="grid cols-2" style={{ gap: '16px', marginBottom: '24px' }}>
        <div>
          <label>Buscar por Autor</label>
          <input className="input" value={authorInput} onChange={(e) => setAuthorInput(e.target.value)} placeholder="Ej: john" />
        </div>
        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="submit" className="btn primary" disabled={listStatus === 'loading'}>Search</button>
          <button type="button" className="btn" onClick={handleListAll} disabled={listStatus === 'loading'}>List All</button>
          <button type="button" className="btn" style={{ background: '#10b981' }} onClick={() => setIsModalOpen(true)}>+ Create New</button>
        </div>
      </form>

      {listStatus === 'loading' && <div style={{ padding: '12px', background: '#e0f2fe', color: '#0369a1', borderRadius: '8px', marginBottom: '16px' }}>Cargando planos...</div>}
      {listError && <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '16px' }}>Error: {listError}</div>}

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div>
          <h3 style={{ marginTop: 0 }}>Resultados ({blueprints.length})</h3>
          {blueprints.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #334155' }}>Author</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #334155' }}>Blueprint</th>
                  <th style={{ padding: '8px', borderBottom: '1px solid #334155' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {blueprints.map((bp) => (
                  <tr key={`${bp.author}-${bp.name}`}>
                    <td style={{ padding: '8px', borderBottom: '1px solid #1f2937' }}>{bp.author}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #1f2937' }}>{bp.name}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #1f2937', display: 'flex', gap: '8px' }}>
                      <button className="btn" onClick={() => navigate(`/blueprint/${bp.author}/${bp.name}`)}>Open</button>
                      <button className="btn" style={{ background: '#ef4444' }} onClick={() => handleDelete(bp.author, bp.name)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (listStatus === 'succeeded' && <p>No data to show.</p>)}
        </div>

        <div className="card" style={{ background: '#1e293b', padding: '16px' }}>
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

      <CreateBlueprintModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); dispatch(fetchAllBlueprints()) }} />
    </div>
  )
}