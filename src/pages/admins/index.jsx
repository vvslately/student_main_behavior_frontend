import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// SVG icons
const EditIcon = ({size=20}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.85 2.85a2.121 2.121 0 0 1 3 3l-9.1 9.1a2 2 0 0 1-.71.44l-3.13 1.04a.5.5 0 0 1-.63-.63l1.04-3.13a2 2 0 0 1 .44-.71l9.1-9.1Zm2.12.88a1.121 1.121 0 0 0-1.59 0l-9.1 9.1a1 1 0 0 0-.22.36l-.9 2.7 2.7-.9a1 1 0 0 0 .36-.22l9.1-9.1a1.121 1.121 0 0 0 0-1.59Z" fill="var(--color-status-warning)"/>
  </svg>
);
const DeleteIcon = ({size=20}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="8" width="2" height="7" rx="1" fill="var(--color-status-error)"/>
    <rect x="9" y="8" width="2" height="7" rx="1" fill="var(--color-status-error)"/>
    <rect x="13" y="8" width="2" height="7" rx="1" fill="var(--color-status-error)"/>
    <rect x="3" y="4" width="14" height="2" rx="1" fill="var(--color-status-error)"/>
    <rect x="7" y="2" width="6" height="2" rx="1" fill="var(--color-status-error)"/>
    <rect x="4" y="6" width="12" height="2" rx="1" fill="var(--color-status-error)"/>
  </svg>
);

function SkeletonTable() {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
        <thead>
          <tr style={{ background: 'var(--table-head, #f1f5f9)' }}>
            {[...Array(7)].map((_, i) => (
              <th key={i} style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, r) => (
            <tr key={r}>
              {[...Array(7)].map((_, c) => (
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

function AddAdminModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    role: 'admin',
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
      <form onSubmit={handleSubmit} style={{ background: 'var(--color-background-primary)', borderRadius: 14, boxShadow: '0 8px 32px var(--color-primary-light)', padding: 32, minWidth: 340, maxWidth: 480, width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h3 style={{ margin: 0, fontWeight: 700, fontSize: 22, color: 'var(--color-primary)' }}>เพิ่มผู้ใช้ใหม่</h3>
        <div>
          <label style={{ color: 'var(--color-text-primary)' }}>Username <span style={{ color: 'var(--color-status-error)' }}>*</span></label>
          <input name="username" type="text" value={form.username} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid var(--color-border-light)' }} />
        </div>
        <div>
          <label style={{ color: 'var(--color-text-primary)' }}>Password <span style={{ color: 'var(--color-status-error)' }}>*</span></label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid var(--color-border-light)' }} />
        </div>
        <div>
          <label style={{ color: 'var(--color-text-primary)' }}>ชื่อ-นามสกุล</label>
          <input name="full_name" type="text" value={form.full_name} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid var(--color-border-light)' }} />
        </div>
        <div>
          <label style={{ color: 'var(--color-text-primary)' }}>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid var(--color-border-light)' }} />
        </div>
        <div>
          <label style={{ color: 'var(--color-text-primary)' }}>Role</label>
          <select name="role" value={form.role} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid var(--color-border-light)' }}>
            <option value="admin">admin</option>
            <option value="teacher">teacher</option>
            <option value="counselor">counselor</option>
          </select>
        </div>
        {error && <div style={{ color: 'var(--color-status-error)', marginBottom: 8 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, background: 'var(--color-border-light)', color: 'var(--color-text-secondary)', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>ยกเลิก</button>
          <button type="submit" disabled={loading} style={{ flex: 1, background: 'var(--color-primary)', color: 'var(--color-primary-contrast)', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'กำลังบันทึก...' : 'บันทึก'}</button>
        </div>
      </form>
    </div>
  );
}

function EditAdminModal({ admin, onClose, onSave }) {
  const [form, setForm] = useState({
    username: admin.username || '',
    password: '',
    full_name: admin.full_name || '',
    email: admin.email || '',
    role: admin.role || 'admin',
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
      <form onSubmit={handleSubmit} style={{ background: 'var(--color-background-primary)', borderRadius: 14, boxShadow: '0 8px 32px var(--color-primary-light)', padding: 32, minWidth: 340, maxWidth: 480, width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h3 style={{ margin: 0, fontWeight: 700, fontSize: 22, color: 'var(--color-primary)' }}>แก้ไขผู้ใช้</h3>
        <div>
          <label style={{ color: 'var(--color-text-primary)' }}>Username <span style={{ color: 'var(--color-status-error)' }}>*</span></label>
          <input name="username" type="text" value={form.username} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid var(--color-border-light)' }} />
        </div>
        <div>
          <label style={{ color: 'var(--color-text-primary)' }}>Password (ถ้าไม่เปลี่ยนให้เว้นว่าง)</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid var(--color-border-light)' }} />
        </div>
        <div>
          <label style={{ color: 'var(--color-text-primary)' }}>ชื่อ-นามสกุล</label>
          <input name="full_name" type="text" value={form.full_name} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid var(--color-border-light)' }} />
        </div>
        <div>
          <label style={{ color: 'var(--color-text-primary)' }}>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid var(--color-border-light)' }} />
        </div>
        <div>
          <label style={{ color: 'var(--color-text-primary)' }}>Role</label>
          <select name="role" value={form.role} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid var(--color-border-light)' }}>
            <option value="admin">admin</option>
            <option value="teacher">teacher</option>
            <option value="counselor">counselor</option>
          </select>
        </div>
        {error && <div style={{ color: 'var(--color-status-error)', marginBottom: 8 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, background: 'var(--color-border-light)', color: 'var(--color-text-secondary)', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>ยกเลิก</button>
          <button type="submit" disabled={loading} style={{ flex: 1, background: 'var(--color-primary)', color: 'var(--color-primary-contrast)', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'กำลังบันทึก...' : 'บันทึก'}</button>
        </div>
      </form>
    </div>
  );
}

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, admin: null });

  const fetchAdmins = () => {
    setLoading(true);
    fetch('https://student-main-behavior-backend.onrender.com/api/admins')
      .then(res => res.json())
      .then(data => {
        setAdmins(data);
        setLoading(false);
      })
      .catch(() => {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบผู้ใช้นี้?',
      text: 'หากลบแล้วจะไม่สามารถกู้คืนได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    });
    if (result.isConfirmed) {
      try {
        await fetch(`https://student-main-behavior-backend.onrender.com/api/admins/${id}`, { method: 'DELETE' });
        fetchAdmins();
        Swal.fire('ลบสำเร็จ!', 'ผู้ใช้ถูกลบแล้ว', 'success');
      } catch {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบผู้ใช้ได้', 'error');
      }
    }
  };

  const handleEdit = (id) => {
    const admin = admins.find(a => a.id === id);
    if (admin) setEditModal({ open: true, admin });
  };

  return (
    <div className="container-admins" style={{
      maxWidth: 1100,
      margin: '80px auto',
      marginLeft: 50,
      padding: 0,
      background: 'transparent',
    }}>
      <div className="card-admins" style={{
        width: '100%',
        background: 'var(--card-bg, #fff)',
        borderRadius: 18,
        boxShadow: '0 4px 32px 0 #2563eb18',
        padding: 32,
        border: '1px solid #e5e7eb',
        position: 'relative',
        transition: 'box-shadow 0.3s',
        marginTop: 50,
        maxWidth: 1100,
        margin: '0 0',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ fontWeight: 800, fontSize: 32, color: 'var(--color-primary)', letterSpacing: 1, margin: 0 }}>จัดการผู้ใช้</h2>
          <button
            onClick={() => setAddModalOpen(true)}
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-contrast)', padding: '8px 16px', borderRadius: 10, fontWeight: 700, fontSize: 15, boxShadow: '0 2px 8px var(--color-primary-light)', transition: 'background 0.2s', border: 'none', cursor: 'pointer', width: '100%', maxWidth: 200 }}
          >
            + เพิ่มผู้ใช้
          </button>
        </div>
        {loading ? (
          <SkeletonTable />
        ) : error ? (
          <div style={{ color: 'var(--color-status-error)', padding: 24, textAlign: 'center' }}>{error}</div>
        ) : (
          <div style={{ overflowX: 'auto', transition: 'box-shadow 0.3s' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16, background: 'transparent', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 8px var(--color-primary-light)', transition: 'box-shadow 0.3s', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '4%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead>
                <tr style={{ background: 'var(--color-background-tertiary)', transition: 'background 0.3s' }}>
                  <th style={{ padding: 10, border: '1px solid var(--color-border-light)', minWidth: 60 }}>#</th>
                  <th style={{ padding: 10, border: '1px solid var(--color-border-light)', minWidth: 100 }}>Username</th>
                  <th style={{ padding: 10, border: '1px solid var(--color-border-light)', minWidth: 120 }}>ชื่อ-นามสกุล</th>
                  <th style={{ padding: 10, border: '1px solid var(--color-border-light)', minWidth: 140 }}>Email</th>
                  <th style={{ padding: 10, border: '1px solid var(--color-border-light)', minWidth: 80 }}>Role</th>
                  <th style={{ padding: 10, border: '1px solid var(--color-border-light)', minWidth: 100 }}>วันที่สร้าง</th>
                  <th style={{ padding: 10, border: '1px solid var(--color-border-light)', minWidth: 120 }}>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20 }}>ไม่มีข้อมูล</td></tr>
                ) : admins.map((a, i) => (
                  <tr key={a.id}>
                    <td style={{ padding: 10, border: '1px solid var(--color-border-light)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i + 1}</td>
                    <td style={{ padding: 10, border: '1px solid var(--color-border-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.username}</td>
                    <td style={{ padding: 10, border: '1px solid var(--color-border-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.full_name || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid var(--color-border-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.email || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid var(--color-border-light)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.role}</td>
                    <td style={{ padding: 10, border: '1px solid var(--color-border-light)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.created_at ? a.created_at.split('T')[0] : '-'}</td>
                    <td style={{ padding: 10, border: '1px solid var(--color-border-light)', textAlign: 'center', minWidth: 120 }}>
                      <button
                        onClick={() => handleEdit(a.id)}
                        title="แก้ไข"
                        style={{
                          marginRight: 8,
                          background: 'none',
                          border: 'none',
                          padding: 4,
                          borderRadius: 6,
                          cursor: 'pointer',
                          verticalAlign: 'middle',
                          transition: 'background 0.18s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-status-warning, #f59e4222)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <EditIcon size={22} />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        title="ลบ"
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 4,
                          borderRadius: 6,
                          cursor: 'pointer',
                          verticalAlign: 'middle',
                          transition: 'background 0.18s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-status-error, #ef444422)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <DeleteIcon size={22} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {addModalOpen && <AddAdminModal onClose={() => setAddModalOpen(false)} onSave={async (form) => {
        try {
          const res = await fetch('https://student-main-behavior-backend.onrender.com/api/admins', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
          });
          const data = await res.json();
          if (!res.ok) {
            Swal.fire('เกิดข้อผิดพลาด', data.message || 'เพิ่มข้อมูลไม่สำเร็จ', 'error');
          } else {
            setAdmins(adm => [data, ...adm]);
            setAddModalOpen(false);
            Swal.fire('เพิ่มข้อมูลสำเร็จ!', '', 'success');
          }
        } catch (err) {
          Swal.fire('Network error', '', 'error');
        }
      }} />}
      {editModal.open && (
        <EditAdminModal
          admin={editModal.admin}
          onClose={() => setEditModal({ open: false, admin: null })}
          onSave={async (form) => {
            try {
              const res = await fetch(`https://student-main-behavior-backend.onrender.com/api/admins/${editModal.admin.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
              });
              const data = await res.json();
              if (!res.ok) {
                Swal.fire('เกิดข้อผิดพลาด', data.message || 'แก้ไขข้อมูลไม่สำเร็จ', 'error');
              } else {
                setAdmins(adms => adms.map(a => a.id === editModal.admin.id ? { ...a, ...form, password: undefined } : a));
                setEditModal({ open: false, admin: null });
                Swal.fire('แก้ไขข้อมูลสำเร็จ!', '', 'success');
              }
            } catch (err) {
              Swal.fire('Network error', '', 'error');
            }
          }}
        />
      )}
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
          .container-admins {
            margin-left: 0 !important;
            padding: 0 8px !important;
          }
          .card-admins {
            padding: 16px !important;
          }
          table {
            font-size: 14px !important;
          }
        }
        @media (max-width: 600px) {
          .container-admins {
            margin: 32px 0 0 0 !important;
            padding: 0 2px !important;
          }
          .card-admins {
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