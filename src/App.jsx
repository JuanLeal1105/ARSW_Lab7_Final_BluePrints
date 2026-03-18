import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import BlueprintsPage from './pages/BlueprintsPage.jsx'
import BlueprintDetailPage from './pages/BlueprintDetailPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFound from './pages/NotFound.jsx'
import LogoutButton from './components/LogoutButton.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'

export default function App() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/' || location.pathname === '/login'

  return (
    <div className="container">
      <header>
        <h1>ECI - Laboratorio de Blueprints en React</h1>
        {!isLoginPage && <LogoutButton />}
        
      </header>
      
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/blueprint" element={<PrivateRoute><BlueprintsPage /></PrivateRoute>} />
        <Route path="/blueprint/:author/:name" element={<PrivateRoute><BlueprintDetailPage /></PrivateRoute>}/>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}