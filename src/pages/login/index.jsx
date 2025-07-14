import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/home')
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('https://student-main-behavior-backend.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Login failed')
      } else {
        // บันทึก token ใน localStorage หรือ state ตามต้องการ
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/home')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24, border: '1px solid #eee', borderRadius: 8, background: '#fff', boxShadow: '0 2px 16px 0 #f8bbd044' , marginTop: '250px'}}>
      <div style={{ textAlign: 'center', color: '#334155', marginBottom: 8, fontSize: 28, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
        ระบบจัดการพฤติกรรมนักเรียน
      </div>
      <div style={{ textAlign: 'center', color: '#334155', marginBottom: 20, fontSize: 20 }}>
        โรงเรียนวชิรธรรมสาธิต
      </div>
      <h2 style={{ marginBottom: 24, color: '#ff69b4', textAlign: 'center', fontWeight: 700 }}>เข้าสู่ระบบ</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500 }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: 10, marginTop: 4, borderRadius: 6, border: '1px solid #eee', fontSize: 16 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 10, marginTop: 4, borderRadius: 6, border: '1px solid #eee', fontSize: 16 }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
        <button type="submit" disabled={loading} className="btn-pink" style={{ width: '100%' }}>
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  )
}