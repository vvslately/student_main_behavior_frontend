import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

function exportToCSV(rows) {
  if (!rows.length) return;
  const header = Object.keys(rows[0]);
  const csv = [header.join(',')].concat(
    rows.map(row => header.map(h => '"' + (row[h] ?? '').toString().replace(/"/g, '""') + '"').join(','))
  ).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cases_export.csv';
  a.click();
  URL.revokeObjectURL(url);
}

const EditIcon = ({size=20}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.85 2.85a2.121 2.121 0 0 1 3 3l-9.1 9.1a2 2 0 0 1-.71.44l-3.13 1.04a.5.5 0 0 1-.63-.63l1.04-3.13a2 2 0 0 1 .44-.71l9.1-9.1Zm2.12.88a1.121 1.121 0 0 0-1.59 0l-9.1 9.1a1 1 0 0 0-.22.36l-.9 2.7 2.7-.9a1 1 0 0 0 .36-.22l9.1-9.1a1.121 1.121 0 0 0 0-1.59Z" fill="#f59e42"/>
  </svg>
);

const DeleteIcon = ({size=20}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="8" width="2" height="7" rx="1" fill="#ef4444"/>
    <rect x="9" y="8" width="2" height="7" rx="1" fill="#ef4444"/>
    <rect x="13" y="8" width="2" height="7" rx="1" fill="#ef4444"/>
    <rect x="3" y="4" width="14" height="2" rx="1" fill="#ef4444"/>
    <rect x="7" y="2" width="6" height="2" rx="1" fill="#ef4444"/>
    <rect x="4" y="6" width="12" height="2" rx="1" fill="#ef4444"/>
  </svg>
);

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchRoom, setSearchRoom] = useState('');
  const [selected, setSelected] = useState([]);
  const [editCase, setEditCase] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('https://student-main-behavior-backend.onrender.com/api/cases' + (search ? `?q=${encodeURIComponent(search)}` : ''))
      .then(res => res.json())
      .then(data => {
        setCases(data);
        setLoading(false);
      })
      .catch(() => {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        setLoading(false);
      });
  }, [search]);

  const handleSelectAll = e => {
    setSelected(e.target.checked ? filteredCases.map(c => c.id) : []);
  };
  const handleSelect = id => {
    setSelected(selected.includes(id) ? selected.filter(i => i !== id) : [...selected, id]);
  };

  // Filter by name and room (frontend)
  const filteredCases = cases.filter(c => {
    const nameMatch = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase().includes(searchName.toLowerCase());
    const roomMatch = searchRoom.trim() === '' || (c.class_room || '').toLowerCase().includes(searchRoom.toLowerCase());
    return nameMatch && roomMatch;
  });

  // SWEETALERT2 DELETE
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบเคสนี้?',
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
        const res = await fetch(`https://student-main-behavior-backend.onrender.com/api/cases/${id}`, { 
          method: 'DELETE' 
        });
        
        if (!res.ok) {
          const data = await res.json();
          Swal.fire('เกิดข้อผิดพลาด', data.message || 'ไม่สามารถลบเคสได้', 'error');
        } else {
          setCases(cases => cases.filter(c => c.id !== id));
          Swal.fire('ลบสำเร็จ!', 'เคสถูกลบแล้ว', 'success');
        }
      } catch (err) {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์', 'error');
      }
    }
  };

  // MODAL EDIT
  const handleEdit = (id) => {
    const found = cases.find(c => c.id === id);
    setEditCase(found);
  };
  const handleEditModalClose = () => setEditCase(null);
  const handleEditModalSave = async (updated) => {
    try {
      const res = await fetch(`https://student-main-behavior-backend.onrender.com/api/cases/${updated.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        const data = await res.json();
        Swal.fire('เกิดข้อผิดพลาด', data.message || 'ไม่สามารถบันทึกข้อมูลได้', 'error');
      } else {
        setCases(cases => cases.map(c => c.id === updated.id ? { ...c, ...updated } : c));
        setEditCase(null);
        Swal.fire('บันทึกสำเร็จ', '', 'success');
      }
    } catch (err) {
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์', 'error');
    }
  };

  // ADD CASE MODAL
  const handleAddModalSave = async (newCase) => {
    try {
      const res = await fetch('https://student-main-behavior-backend.onrender.com/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCase),
      });
      if (!res.ok) {
        const data = await res.json();
        Swal.fire('เกิดข้อผิดพลาด', data.message || 'ไม่สามารถเพิ่มเคสได้', 'error');
      } else {
        const created = await res.json();
        setCases(cases => [created, ...cases]);
        setAddModalOpen(false);
        Swal.fire('เพิ่มเคสสำเร็จ', '', 'success');
      }
    } catch (err) {
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์', 'error');
    }
  };

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
          <h2 style={{ fontWeight: 800, fontSize: 32, color: 'var(--primary, #2563eb)', letterSpacing: 1, margin: 0 }}>จัดการเคส/เหตุการณ์</h2>
          <button
            onClick={() => setAddModalOpen(true)}
            style={{ background: '#2563eb', color: '#fff', padding: '10px 26px', borderRadius: 10, fontWeight: 700, fontSize: 18, boxShadow: '0 2px 8px #2563eb22', transition: 'background 0.2s', border: 'none', cursor: 'pointer' }}
          >
            + เพิ่มเคส
          </button>
        </div>
        <div style={{ display: 'flex', gap: 14, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="ค้นหาชื่อเคส, รายละเอียด, สถานะ"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', minWidth: 200, fontSize: 16 }}
          />
          <input
            type="text"
            placeholder="ค้นหาชื่อ-นามสกุลนักเรียน"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', minWidth: 180, fontSize: 16 }}
          />
          <input
            type="text"
            placeholder="ค้นหาห้อง (เช่น 1/2)"
            value={searchRoom}
            onChange={e => setSearchRoom(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', minWidth: 120, fontSize: 16 }}
          />
          <button
            onClick={() => exportToCSV(filteredCases.filter(c => selected.includes(c.id)))}
            disabled={!selected.length}
            style={{ background: selected.length ? '#10b981' : '#cbd5e1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 16, boxShadow: selected.length ? '0 2px 8px #10b98133' : 'none', cursor: selected.length ? 'pointer' : 'not-allowed', transition: 'background 0.2s, box-shadow 0.2s' }}
          >
            Export CSV
          </button>
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
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <input type="checkbox" checked={selected.length === filteredCases.length && filteredCases.length > 0} onChange={handleSelectAll} />
                  </th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>#</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>ชื่อเคส</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>รายละเอียด</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>นักเรียน</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>ชั้น</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>ห้อง</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>พฤติกรรม</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>ผู้รายงาน</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>สถานะ</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>วันที่รายงาน</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center', minWidth: 80 }}>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.length === 0 ? (
                  <tr><td colSpan={11} style={{ textAlign: 'center', padding: 24 }}>ไม่มีข้อมูล</td></tr>
                ) : filteredCases.map((c, i) => (
                  <tr key={c.id} style={{ transition: 'background 0.22s', background: selected.includes(c.id) ? '#e0f2fe' : 'transparent' }}>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                      <input type="checkbox" checked={selected.includes(c.id)} onChange={() => handleSelect(c.id)} />
                    </td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{c.case_title || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{c.case_description || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{c.first_name ? `${c.first_name} ${c.last_name}` : '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{c.class_level || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{c.class_room || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{c.behavior_name || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{c.reporter_name || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{c.status}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{c.reported_at ? c.reported_at.split('T')[0] : '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center', minWidth: 80 }}>
                      <button
                        onClick={() => handleEdit(c.id)}
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
                        onMouseEnter={e => e.currentTarget.style.background = '#f59e4222'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <EditIcon size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
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
                        onMouseEnter={e => e.currentTarget.style.background = '#ef444422'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <DeleteIcon size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {editCase && <EditCaseModal caseData={editCase} onClose={handleEditModalClose} onSave={handleEditModalSave} />}
      {addModalOpen && <AddCaseModal onClose={() => setAddModalOpen(false)} onSave={handleAddModalSave} />}
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
  )
}

function SkeletonTable() {
  // 5 rows, 11 cols
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

// MODAL COMPONENT
function EditCaseModal({ caseData, onClose, onSave }) {
  const [form, setForm] = useState({ ...caseData });
  const [saving, setSaving] = useState(false);
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(30,41,59,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px #2563eb33', padding: 32, minWidth: 340, maxWidth: 420, width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h3 style={{ margin: 0, fontWeight: 700, fontSize: 22, color: '#2563eb' }}>แก้ไขเคส</h3>
        <label>ชื่อเคส
          <input name="case_title" value={form.case_title || ''} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }} />
        </label>
        <label>รายละเอียด
          <textarea name="case_description" value={form.case_description || ''} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, minHeight: 60 }} />
        </label>
        <label>สถานะ
          <select name="status" value={form.status} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }}>
            <option value="open">open</option>
            <option value="in_progress">in_progress</option>
            <option value="closed">closed</option>
          </select>
        </label>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, background: '#cbd5e1', color: '#334155', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>ยกเลิก</button>
          <button type="submit" disabled={saving} style={{ flex: 1, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: 16, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
        </div>
      </form>
    </div>
  );
}

// MODAL ADD COMPONENT (copy logic from add.jsx)
function AddCaseModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    student_id: '',
    behavior_id: '',
    reported_by: '',
    case_title: '',
    case_description: '',
    status: 'open',
  });
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [behaviors, setBehaviors] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reporterName, setReporterName] = useState('');

  useEffect(() => {
    fetch('https://student-main-behavior-backend.onrender.com/api/students').then(res => res.json()).then(setStudents);
    fetch('https://student-main-behavior-backend.onrender.com/api/behaviors').then(res => res.json()).then(setBehaviors);
    fetch('https://student-main-behavior-backend.onrender.com/api/admins').then(res => res.json()).then(setAdmins);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setForm(f => ({ ...f, reported_by: user.id || '' }));
    setReporterName(user.full_name || user.username || '');
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ฟิลเตอร์นักเรียนตามรหัส/ชื่อ
  const filteredStudents = students.filter(s =>
    (s.student_code + ' ' + s.first_name + ' ' + s.last_name)
      .toLowerCase()
      .includes(studentSearch.toLowerCase())
  );

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
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px #2563eb33', padding: 32, minWidth: 340, maxWidth: 420, width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h3 style={{ margin: 0, fontWeight: 700, fontSize: 22, color: '#2563eb' }}>เพิ่มเคส</h3>
        <div>
          <label>นักเรียน <span style={{ color: 'red' }}>*</span></label>
          <input
            type="text"
            placeholder="ค้นหาด้วยรหัสนักเรียนหรือชื่อ"
            value={studentSearch}
            onChange={e => setStudentSearch(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd', marginBottom: 8 }}
          />
          <select
            name="student_id"
            value={form.student_id}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
          >
            <option value="">-- เลือกนักเรียน --</option>
            {filteredStudents.map(s => (
              <option key={s.id} value={s.id}>{s.student_code} - {s.first_name} {s.last_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>พฤติกรรม <span style={{ color: 'red' }}>*</span></label>
          <select
            name="behavior_id"
            value={form.behavior_id}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }}
          >
            <option value="">-- เลือกพฤติกรรม --</option>
            {behaviors.map(b => (
              <option key={b.id} value={b.id}>{b.behavior_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>ผู้รายงาน <span style={{ color: 'red' }}>*</span></label>
          <input
            type="text"
            value={reporterName}
            readOnly
            style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd', background: '#f1f5f9' }}
          />
        </div>
        <div>
          <label>ชื่อเคส</label>
          <input
            name="case_title"
            type="text"
            value={form.case_title}
            onChange={handleChange}
            style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }}
          />
        </div>
        <div>
          <label>รายละเอียด</label>
          <textarea
            name="case_description"
            value={form.case_description}
            onChange={handleChange}
            rows={3}
            style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }}
          />
        </div>
        <div>
          <label>สถานะ</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }}
          >
            <option value="open">open</option>
            <option value="in_progress">in_progress</option>
            <option value="closed">closed</option>
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