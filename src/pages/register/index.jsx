import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    role: 'admin'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await fetch('https://student-main-behavior-backend.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Register failed')
      } else {
        setSuccess('สมัครสมาชิกสำเร็จ!')
        setForm({ username: '', password: '', full_name: '', email: '', role: 'admin' })
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24, border: '1px solid #eee', borderRadius: 8, background: '#fff', boxShadow: '0 2px 16px 0 #f8bbd044' }}>
      <h2 style={{ marginBottom: 24, color: '#222', textAlign: 'center', fontWeight: 700 }}>สมัครสมาชิก</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500, color: '#222' }}>Username</label>
          <input
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 10, marginTop: 4, borderRadius: 6, border: '1px solid #eee', fontSize: 16, color: '#222' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500, color: '#222' }}>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 10, marginTop: 4, borderRadius: 6, border: '1px solid #eee', fontSize: 16, color: '#222' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500, color: '#222' }}>Full Name</label>
          <input
            name="full_name"
            type="text"
            value={form.full_name}
            onChange={handleChange}
            style={{ width: '100%', padding: 10, marginTop: 4, borderRadius: 6, border: '1px solid #eee', fontSize: 16, color: '#222' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500, color: '#222' }}>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            style={{ width: '100%', padding: 10, marginTop: 4, borderRadius: 6, border: '1px solid #eee', fontSize: 16, color: '#222' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500, color: '#222' }}>Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={{ width: '100%', padding: 10, marginTop: 4, borderRadius: 6, border: '1px solid #eee', fontSize: 16, color: '#222' }}
          >
            <option value="admin">admin</option>
            <option value="teacher">teacher</option>
            <option value="counselor">counselor</option>
          </select>
        </div>
        {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: 16 }}>{success}</div>}
        <button type="submit" disabled={loading} className="btn-pink" style={{ width: '100%' }}>
          {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
        </button>
      </form>
      
      <div style={{
        textAlign: 'center',
        marginTop: '24px',
        paddingTop: '24px',
        borderTop: '1px solid var(--color-border-light)'
      }}>
        <p style={{
          color: '#222',
          fontSize: '14px',
          marginBottom: '8px'
        }}>
          มีบัญชีอยู่แล้ว?
        </p>
        <button
          onClick={() => navigate('/login')}
          className="btn btn-secondary"
          style={{
            fontSize: '14px',
            padding: '8px 16px',
            color: '#222'
          }}
        >
          เข้าสู่ระบบ
        </button>
      </div>
    </div>
  )
} 