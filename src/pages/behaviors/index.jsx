import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

function SkeletonTable() {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
        <thead>
          <tr style={{ background: 'var(--table-head, #f1f5f9)' }}>
            {[...Array(5)].map((_, i) => (
              <th key={i} style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, r) => (
            <tr key={r}>
              {[...Array(5)].map((_, c) => (
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

function AddBehaviorModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    behavior_name: '',
    description: '',
    severity_level: 'low',
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
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,41,59,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px #2563eb33', padding: 32, minWidth: 340, maxWidth: 480, width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h3 style={{ margin: 0, fontWeight: 700, fontSize: 22, color: '#2563eb' }}>เพิ่มพฤติกรรมใหม่</h3>
        <div>
          <label>ชื่อพฤติกรรม <span style={{ color: 'red' }}>*</span></label>
          <input name="behavior_name" type="text" value={form.behavior_name} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
        </div>
        <div>
          <label>รายละเอียด</label>
          <textarea name="description" value={form.description} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd', minHeight: 60 }} />
        </div>
        <div>
          <label>ระดับความรุนแรง <span style={{ color: 'red' }}>*</span></label>
          <select name="severity_level" value={form.severity_level} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }}>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
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

function EditBehaviorModal({ behavior, onClose, onSave }) {
  const [form, setForm] = useState({
    behavior_name: behavior.behavior_name || '',
    description: behavior.description || '',
    severity_level: behavior.severity_level || 'low',
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
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,41,59,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px #2563eb33', padding: 32, minWidth: 340, maxWidth: 480, width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h3 style={{ margin: 0, fontWeight: 700, fontSize: 22, color: '#2563eb' }}>แก้ไขพฤติกรรม</h3>
        <div>
          <label>ชื่อพฤติกรรม <span style={{ color: 'red' }}>*</span></label>
          <input name="behavior_name" type="text" value={form.behavior_name} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
        </div>
        <div>
          <label>รายละเอียด</label>
          <textarea name="description" value={form.description} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd', minHeight: 60 }} />
        </div>
        <div>
          <label>ระดับความรุนแรง <span style={{ color: 'red' }}>*</span></label>
          <select name="severity_level" value={form.severity_level} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }}>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
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

export default function Behaviors() {
  const [behaviors, setBehaviors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, behavior: null });

  useEffect(() => {
    fetch('https://student-main-behavior-backend.onrender.com/api/behaviors')
      .then(res => res.json())
      .then(data => {
        setBehaviors(data);
        setLoading(false);
      })
      .catch(() => {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        setLoading(false);
      });
  }, []);

  const handleDelete = async (behavior) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ',
      text: `คุณต้องการลบพฤติกรรม "${behavior.behavior_name}" หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`https://student-main-behavior-backend.onrender.com/api/behaviors/${behavior.id}`, {
          method: 'DELETE',
        });
        
        if (!res.ok) {
          const data = await res.json();
          Swal.fire('เกิดข้อผิดพลาด', data.message || 'ลบข้อมูลไม่สำเร็จ', 'error');
        } else {
          setBehaviors(bh => bh.filter(b => b.id !== behavior.id));
          Swal.fire('ลบข้อมูลสำเร็จ!', '', 'success');
        }
      } catch (err) {
        Swal.fire('Network error', '', 'error');
      }
    }
  };

  return (
    <div className="container-behaviors" style={{
      maxWidth: 1100,
      margin: '80px auto',
      marginLeft: 50,
      padding: 0,
      background: 'transparent',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      minHeight: 'calc(100vh - 80px)',

    }}>
      <div className="card-behaviors" style={{
        width: '100%',
        background: 'var(--card-bg, #fff)',
        borderRadius: 18,
        boxShadow: '0 4px 32px 0 #2563eb18',
        padding: 32,
        border: '1px solid #e5e7eb',
        position: 'relative',
        transition: 'box-shadow 0.3s',
        maxWidth: 1100,
        

        margin: '0 0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 } }>
          <h2 style={{ fontWeight: 800, fontSize: 32, color: 'var(--primary, #2563eb)', letterSpacing: 1, margin: 0  }}>จัดการพฤติกรรม</h2>
          <button
            onClick={() => setAddModalOpen(true)}
            style={{ background: '#2563eb', color: '#fff', padding: '10px 26px', borderRadius: 10, fontWeight: 700, fontSize: 18, boxShadow: '0 2px 8px #2563eb22', transition: 'background 0.2s', border: 'none', cursor: 'pointer' }}
          >
            + เพิ่มพฤติกรรม
          </button>
        </div>
        {loading ? (
          <SkeletonTable />
        ) : error ? (
          <div style={{ color: 'red', padding: 24, textAlign: 'center' }}>{error}</div>
        ) : (
          <div style={{ overflowX: 'auto', transition: 'box-shadow 0.3s' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16, background: 'transparent', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 8px #2563eb11', transition: 'box-shadow 0.3s', minWidth: 600 }}>
              <thead>
                <tr style={{ background: 'var(--table-head, #f1f5f9)', transition: 'background 0.3s' }}>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>#</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>ชื่อพฤติกรรม</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>รายละเอียด</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>ระดับความรุนแรง</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>วันที่สร้าง</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {behaviors.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20 }}>ไม่มีข้อมูล</td></tr>
                ) : behaviors.map((b, i) => (
                  <tr key={b.id}>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{b.behavior_name}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{b.description || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{b.severity_level}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{b.created_at ? b.created_at.split('T')[0] : '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setEditModal({ open: true, behavior: b })}
                          style={{
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 12px',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.background = '#1d4ed8'}
                          onMouseOut={(e) => e.target.style.background = '#2563eb'}
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(b)}
                          style={{
                            background: '#dc2626',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 12px',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.background = '#b91c1c'}
                          onMouseOut={(e) => e.target.style.background = '#dc2626'}
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {addModalOpen && <AddBehaviorModal onClose={() => setAddModalOpen(false)} onSave={async (form) => {
          try {
            const res = await fetch('https://student-main-behavior-backend.onrender.com/api/behaviors', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) {
              Swal.fire('เกิดข้อผิดพลาด', data.message || 'เพิ่มข้อมูลไม่สำเร็จ', 'error');
            } else {
              setBehaviors(bh => [data, ...bh]);
              setAddModalOpen(false);
              Swal.fire('เพิ่มข้อมูลสำเร็จ!', '', 'success');
            }
          } catch (err) {
            Swal.fire('Network error', '', 'error');
          }
        }} />}
        {editModal.open && <EditBehaviorModal behavior={editModal.behavior} onClose={() => setEditModal({ open: false, behavior: null })} onSave={async (form) => {
          try {
            const res = await fetch(`https://student-main-behavior-backend.onrender.com/api/behaviors/${editModal.behavior.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) {
              Swal.fire('เกิดข้อผิดพลาด', data.message || 'แก้ไขข้อมูลไม่สำเร็จ', 'error');
            } else {
              setBehaviors(bh => bh.map(b => b.id === editModal.behavior.id ? { ...b, ...form } : b));
              setEditModal({ open: false, behavior: null });
              Swal.fire('แก้ไขข้อมูลสำเร็จ!', '', 'success');
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
        @media (max-width: 900px) {
          .container-behaviors {
            margin-left: 0 !important;
            padding: 0 8px !important;
          }
          .card-behaviors {
            padding: 16px !important;
          }
          table {
            font-size: 14px !important;
          }
        }
        @media (max-width: 600px) {
          .container-behaviors {
            margin: 32px 0 0 0 !important;
            padding: 0 2px !important;
          }
          .card-behaviors {
            padding: 6px !important;
            border-radius: 10px !important;
            margin-top: 70px !important;
          }
          table {
            font-size: 12px !important;
            min-width: 400px !important;
          }
          th, td {
            padding: 6px !important;
          }
          h2 {
            font-size: 22px !important;
          }
        }
      `}</style>
    </div>
  );
} 