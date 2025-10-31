import { Routes, Route, Link, useLocation } from 'react-router-dom'
import SymptomInput from './pages/SymptomInput'
import MapHospitals from './pages/MapHospitals'
import Profile from './pages/Profile'
import './styles.css'

export default function App() {
  const loc = useLocation()
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="px-4 py-3 border-b sticky top-0 bg-white z-10">
        <nav className="flex gap-3 text-sm">
          <Link to="/">증상 입력</Link>
          <Link to="/map">지도/병원</Link>
          <Link to="/profile">사용자 정보</Link>
        </nav>
      </header>
      <main className="p-4">
        <Routes location={loc}>
          <Route path="/" element={<SymptomInput/>}/>
          <Route path="/map" element={<MapHospitals/>}/>
          <Route path="/profile" element={<Profile/>}/>
        </Routes>
      </main>
    </div>
  )
}
