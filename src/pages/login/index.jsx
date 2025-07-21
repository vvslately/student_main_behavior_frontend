import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png';

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // ป้องกัน useEffect วนลูป: รันแค่รอบแรก
    if (localStorage.getItem('token')) {
      navigate('/home');
    }
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    const maxRetries = 3;
    const retryDelay = 3000; // 3 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch('https://student-main-behavior-backend.onrender.com/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate('/home');
          return;
        }

        if (res.status === 500) {
          if (attempt < maxRetries) {
            setError(`เซิร์ฟเวอร์อาจกำลังเริ่มทำงาน... (ลองใหม่ครั้งที่ ${attempt})`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          } else {
            setError('เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ โปรดรอสักครู่แล้วลองใหม่อีกครั้ง');
            break; // Exit loop after last attempt
          }
        } else {
          const data = await res.json().catch(() => ({}));
          setError(data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
          break; // Exit loop for non-500 errors
        }
      } catch (err) {
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
        break; // Exit loop on network error
      }
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '20px auto', padding: 24, border: '1px solid #eee', borderRadius: 8, background: '#fff', boxShadow: '0 2px 16px 0 #f8bbd044' , marginTop: '150px'}}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <img src={logo} alt="โลโก้" style={{ width: 128, height: 128, objectFit: 'contain', marginBottom: 8 }} />
      </div>
      <div style={{ textAlign: 'center', color: '#222', marginBottom: 8, fontSize: 28, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
        ระบบจัดการพฤติกรรมนักเรียน
      </div>
      <div style={{ textAlign: 'center', color: '#222', marginBottom: 20, fontSize: 20 }}>
        โรงเรียนวชิรธรรมสาธิต
      </div>
      <h2 style={{ marginBottom: 24, color: '#222', textAlign: 'center', fontWeight: 700 }}>เข้าสู่ระบบ</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500, color: '#222' }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: 10, marginTop: 4, borderRadius: 6, border: '1px solid #eee', fontSize: 16, color: '#222' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500, color: '#222' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 10, marginTop: 4, borderRadius: 6, border: '1px solid #eee', fontSize: 16, color: '#222' }}
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