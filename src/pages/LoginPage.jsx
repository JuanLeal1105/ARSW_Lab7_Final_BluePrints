import { useState } from 'react'
import api from '../services/apiClient.js'
import axios from 'axios'
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()
 
  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    const cleanUsername = username.trim()
    const cleanPassword = password.trim()
    
    try {
      const { data } = await axios.post('http://localhost:8080/auth/login', { 
        username: cleanUsername, 
        password: cleanPassword 
      })
      
      localStorage.setItem('token', data.access_token)
      alert('Login exitoso')
      navigate('/blueprint')
    } catch (e) {
      setError('Credenciales inválidas o servidor no disponible')
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2 style={{ marginTop: 0 }}>Login</h2>
      <div className="grid cols-2">
        <div>
          <label>Usuario</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label>Contraseña</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      <button className="btn primary" style={{ marginTop: 12 }}>
        Ingresar
      </button>
    </form>
  )
}
