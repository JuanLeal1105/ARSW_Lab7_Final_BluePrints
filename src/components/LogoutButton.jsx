import { useNavigate } from 'react-router-dom'

export default function LogoutButton() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <button 
      onClick={handleLogout} 
      className="btn" 
      style={{ background: '#ef4444', padding: '6px 12px', fontSize: '14px' }}
    >
      Cerrar Sesión
    </button>
  )
}