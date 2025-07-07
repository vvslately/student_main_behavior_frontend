import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function SkeletonTable() {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
        <thead>
          <tr style={{ background: 'var(--table-head, #f1f5f9)' }}>
            {[...Array(11)].map((_, i) => (
              <th key={i} style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, r) => (
            <tr key={r}>
              {[...Array(11)].map((_, c) => (
                <td key={c} style={{ padding: 10, border: '1px solid #e5e7eb' }}>
                  <div style={{
                    height: 16,
                    width: '80%',
                    background: 'linear-gradient(90deg, #e0e7ff 25%, #f1f5f9 50%, #e0e7ff 75%)',
                    borderRadius: 6,
                    animation: 'skeleton-loading 1.2s infinite linear',
                    margin: '0 auto',
                  }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        @keyframes skeleton-loading {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

function AddStudentModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    student_code: '',
    first_name: '',
    last_name: '',
    gender: 'male',
    class_level: '',
    birthdate: '',
    guardian_name: '',
    contact_info: '',
    class_room: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave(form);
    } catch (err) {
      setError('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(30,41,59,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px #2563eb33', padding: 32, minWidth: 340, maxWidth: 480, width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h3 style={{ margin: 0, fontWeight: 700, fontSize: 22, color: '#2563eb' }}>เพิ่มนักเรียนใหม่</h3>
        <div>
          <label>รหัสนักเรียน <span style={{ color: 'red' }}>*</span></label>
          <input name="student_code" type="text" value={form.student_code} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label>ชื่อ <span style={{ color: 'red' }}>*</span></label>
            <input name="first_name" type="text" value={form.first_name} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label>นามสกุล <span style={{ color: 'red' }}>*</span></label>
            <input name="last_name" type="text" value={form.last_name} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label>เพศ</label>
            <select name="gender" value={form.gender} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }}>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>ชั้นเรียน</label>
            <input name="class_level" type="text" value={form.class_level} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label>ห้อง</label>
            <input name="class_room" type="text" value={form.class_room} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
        </div>
        <div>
          <label>วันเกิด</label>
          <input name="birthdate" type="date" value={form.birthdate} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label>ชื่อผู้ปกครอง</label>
            <input name="guardian_name" type="text" value={form.guardian_name} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label>ข้อมูลติดต่อ</label>
            <input name="contact_info" type="text" value={form.contact_info} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
        </div>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, background: '#cbd5e1', color: '#334155', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>ยกเลิก</button>
          <button type="submit" disabled={loading} style={{ flex: 1, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'กำลังบันทึก...' : 'บันทึก'}</button>
        </div>
      </form>
    </div>
  );
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    fetch('https://student-main-behavior-backend.onrender.com/api/students')
      .then(res => res.json())
      .then(data => {
        setStudents(data);
        setLoading(false);
      })
      .catch(() => {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        setLoading(false);
      });
  }, []);

  const filtered = students.filter(s => {
    const keyword = search.toLowerCase();
    const codeMatch = (s.student_code || '').toLowerCase().includes(keyword);
    const nameMatch = `${s.first_name} ${s.last_name}`.toLowerCase().includes(keyword);
    return codeMatch || nameMatch;
  });

  return (
    <div style={{
      maxWidth: 1200,
      margin: '80px auto',
      marginLeft: 0,
      padding: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      minHeight: 'calc(100vh - 80px)',
      background: 'transparent',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 1100,
        background: 'var(--card-bg, #fff)',
        borderRadius: 18,
        boxShadow: '0 4px 32px 0 #2563eb18',
        padding: 32,
        margin: '0 0',
        border: '1px solid #e5e7eb',
        position: 'relative',
        transition: 'box-shadow 0.3s',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 800, fontSize: 32, color: 'var(--primary, #2563eb)', letterSpacing: 1, margin: 0 }}>จัดการนักเรียน</h2>
          <button
            onClick={() => setAddModalOpen(true)}
            style={{ background: '#2563eb', color: '#fff', padding: '10px 26px', borderRadius: 10, fontWeight: 700, fontSize: 18, boxShadow: '0 2px 8px #2563eb22', transition: 'background 0.2s', border: 'none', cursor: 'pointer' }}
          >
            + เพิ่มนักเรียน
          </button>
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="ค้นหาชื่อหรือนามสกุล"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', minWidth: 220, fontSize: 16 }}
          />
        </div>
        {loading ? (
          <SkeletonTable />
        ) : error ? (
          <div style={{ color: 'red', padding: 24, textAlign: 'center' }}>{error}</div>
        ) : (
          <div style={{ overflowX: 'auto', transition: 'box-shadow 0.3s' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, background: 'transparent', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 8px #2563eb11', transition: 'box-shadow 0.3s' }}>
              <thead>
                <tr style={{ background: 'var(--table-head, #f1f5f9)', transition: 'background 0.3s' }}>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>#</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>รหัสนักเรียน</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>ชื่อ</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>นามสกุล</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>เพศ</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>ชั้น</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>ห้อง</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>วันเกิด</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>ผู้ปกครอง</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>ติดต่อ</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>วันที่สร้าง</th>
                </tr>
              </thead>
              <tbody>
                {
                  filtered.length === 0 ? (
                    <tr><td colSpan={11} style={{ textAlign: 'center', padding: 20 }}>ไม่มีข้อมูล</td></tr>
                  ) : (
                    filtered.map((s, i) => (
                      <tr key={s.id}>
                        <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{i + 1}</td>
                        <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{s.student_code}</td>
                        <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{s.first_name}</td>
                        <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{s.last_name}</td>
                        <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{s.gender}</td>
                        <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{s.class_level || '-'}</td>
                        <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{s.class_room || '-'}</td>
                        <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{s.birthdate || '-'}</td>
                        <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{s.guardian_name || '-'}</td>
                        <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{s.contact_info || '-'}</td>
                        <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{s.created_at ? s.created_at.split('T')[0] : '-'}</td>
                      </tr>
                    ))
                  )
                }
              </tbody>
            </table>
          </div>
        )}
        {addModalOpen && <AddStudentModal onClose={() => setAddModalOpen(false)} onSave={async (form) => {
          try {
            const res = await fetch('https://student-main-behavior-backend.onrender.com/api/students', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) {
              Swal.fire('เกิดข้อผิดพลาด', data.message || 'เพิ่มข้อมูลไม่สำเร็จ', 'error');
            } else {
              setStudents(stu => [data, ...stu]);
              setAddModalOpen(false);
              Swal.fire('เพิ่มข้อมูลสำเร็จ!', '', 'success');
            }
          } catch (err) {
            Swal.fire('Network error', '', 'error');
          }
        }} />}
      </div>
      <style>{`
        :root {
          --primary: #2563eb;
          --card-bg: #fff;
          --table-head: #f1f5f9;
        }
        body[data-theme='dark'] {
          --primary: #60a5fa;
          --card-bg: #1e293b;
          --table-head: #334155;
        }
      `}</style>
    </div>
  );
} 