import { useEffect, useState, forwardRef } from 'react';
import Swal from 'sweetalert2';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';

const EditIcon = ({size=22}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.85 2.85a2.121 2.121 0 0 1 3 3l-9.1 9.1a2 2 0 0 1-.71.44l-3.13 1.04a.5.5 0 0 1-.63-.63l1.04-3.13a2 2 0 0 1 .44-.71l9.1-9.1Zm2.12.88a1.121 1.121 0 0 0-1.59 0l-9.1 9.1a1 1 0 0 0-.22.36l-.9 2.7 2.7-.9a1 1 0 0 0 .36-.22l9.1-9.1a1.121 1.121 0 0 0 0-1.59Z" fill="var(--color-warning, #f59e42)"/>
  </svg>
);

const DeleteIcon = ({size=22}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="8" width="2" height="7" rx="1" fill="var(--color-status-error, #ef4444)"/>
    <rect x="9" y="8" width="2" height="7" rx="1" fill="var(--color-status-error, #ef4444)"/>
    <rect x="13" y="8" width="2" height="7" rx="1" fill="var(--color-status-error, #ef4444)"/>
    <rect x="3" y="4" width="14" height="2" rx="1" fill="var(--color-status-error, #ef4444)"/>
    <rect x="7" y="2" width="6" height="2" rx="1" fill="var(--color-status-error, #ef4444)"/>
    <rect x="4" y="6" width="12" height="2" rx="1" fill="var(--color-status-error, #ef4444)"/>
  </svg>
);

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
    guardian_relation: '',
    advisor_name: '',
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
      await onSave({ ...form, birthdate: toDateOnly(form.birthdate) });
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
          <label style={{ color: '#222' }}>รหัสนักเรียน <span style={{ color: 'red' }}>*</span></label>
          <input name="student_code" type="text" value={form.student_code} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#222' }}>ชื่อ <span style={{ color: 'red' }}>*</span></label>
            <input name="first_name" type="text" value={form.first_name} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#222' }}>นามสกุล <span style={{ color: 'red' }}>*</span></label>
            <input name="last_name" type="text" value={form.last_name} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#222' }}>เพศ</label>
            <select name="gender" value={form.gender} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }}>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#222' }}>ชั้นเรียน</label>
            <input name="class_level" type="text" value={form.class_level} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#222' }}>ห้อง</label>
            <input name="class_room" type="text" value={form.class_room} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#222' }}>ชื่อผู้ปกครอง</label>
            <input name="guardian_name" type="text" value={form.guardian_name} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#222' }}>ความสัมพันธ์กับนักเรียน</label>
            <input name="guardian_relation" type="text" value={form.guardian_relation} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#222' }}>ข้อมูลติดต่อ</label>
            <input name="contact_info" type="text" value={form.contact_info} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
        </div>
        <div>
          <label style={{ color: '#222', display: 'block', marginBottom: 4 }}>วันเกิด</label>
          <DatePicker
            selected={form.birthdate ? new Date(form.birthdate) : null}
            onChange={date => setForm(f => ({ ...f, birthdate: date ? date.toISOString().slice(0, 10) : '' }))}
            dateFormat="dd/MM/yyyy"
            placeholderText="เลือกวันเกิด"
            customInput={<CustomInput />}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
          />
        </div>
        <div>
          <label style={{ color: '#222' }}>ครูที่ปรึกษา</label>
          <input name="advisor_name" type="text" value={form.advisor_name} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
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

// เพิ่มฟังก์ชันแปลงวันเกิด
function formatDateDMY(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// เพิ่มฟังก์ชันแปลง birthdate เป็น yyyy-MM-dd
function toDateOnly(str) {
  if (!str) return '';
  return str.slice(0, 10);
}

// Custom input สำหรับ DatePicker ให้เหมือน input ปกติ
const CustomInput = forwardRef(({ value, onClick, onChange }, ref) => (
  <input
    className="custom-datepicker-input"
    onClick={onClick}
    value={value}
    onChange={onChange}
    ref={ref}
    placeholder="เลือกวันเกิด"
    readOnly
    style={{
      width: '100%',
      padding: 8,
      marginTop: 4,
      borderRadius: 6,
      border: '1px solid #ddd',
      fontSize: 16,
      background: '#fff',
      cursor: 'pointer',
    }}
  />
));

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);

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

  // ลบข้อมูล
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบนักเรียนนี้?',
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
        const res = await fetch(`https://student-main-behavior-backend.onrender.com/api/students/${id}`, {
          method: 'DELETE'
        });
        if (!res.ok) {
          const data = await res.json();
          Swal.fire('เกิดข้อผิดพลาด', data.message || 'ไม่สามารถลบข้อมูลได้', 'error');
        } else {
          setStudents(stu => stu.filter(s => s.id !== id));
          Swal.fire('ลบสำเร็จ!', 'ข้อมูลถูกลบแล้ว', 'success');
        }
      } catch (err) {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์', 'error');
      }
    }
  };

  // แก้ไขข้อมูล
  const handleEdit = (student) => {
    setEditStudent(student);
  };
  const handleEditModalClose = () => setEditStudent(null);
  const handleEditModalSave = async (updated) => {
    try {
      const res = await fetch(`https://student-main-behavior-backend.onrender.com/api/students/${updated.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updated, birthdate: toDateOnly(updated.birthdate) }),
      });
      if (!res.ok) {
        const data = await res.json();
        Swal.fire('เกิดข้อผิดพลาด', data.message || 'ไม่สามารถบันทึกข้อมูลได้', 'error');
      } else {
        setStudents(stu => stu.map(s => s.id === updated.id ? { ...s, ...updated } : s));
        setEditStudent(null);
        Swal.fire('บันทึกสำเร็จ', '', 'success');
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
          <h2 style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: 32, letterSpacing: 1, margin: 0 , color:'#222'}}>จัดการนักเรียน</h2>
          <button
            onClick={() => setAddModalOpen(true)}
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-contrast)', padding: '8px 16px', borderRadius: 10, fontWeight: 700, fontSize: 15, boxShadow: '0 2px 8px var(--color-primary, #2563eb22)', transition: 'background 0.2s', border: 'none', cursor: 'pointer', width: '100%', maxWidth: 200 }}
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
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>ความสัมพันธ์กับนักเรียน</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>ติดต่อ</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>ครูที่ปรึกษา</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>วันที่สร้าง</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', minWidth: 90, textAlign: 'center' }}>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {
                  filtered.length === 0 ? (
                    <tr><td colSpan={12} style={{ textAlign: 'center', padding: 20 }}>ไม่มีข้อมูล</td></tr>
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
                        <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{formatDateDMY(s.birthdate)}</td>
                        <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{s.guardian_name || '-'}</td>
                        <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{s.guardian_relation || '-'}</td>
                        <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{s.contact_info || '-'}</td>
                        <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{s.advisor_name || '-'}</td>
                        <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{s.created_at ? s.created_at.split('T')[0] : '-'}</td>
                        <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center', minWidth: 90 }}>
                          <button
                            onClick={() => handleEdit(s)}
                            title="แก้ไข"
                            style={{
                              marginRight: 8,
                              background: 'none',
                              border: 'none',
                              padding: 6,
                              borderRadius: 8,
                              cursor: 'pointer',
                              verticalAlign: 'middle',
                              transition: 'background 0.18s',
                              width: 36,
                              height: 36,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f59e4222'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            <EditIcon size={22} />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            title="ลบ"
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 6,
                              borderRadius: 8,
                              cursor: 'pointer',
                              verticalAlign: 'middle',
                              transition: 'background 0.18s',
                              width: 36,
                              height: 36,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#ef444422'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            <DeleteIcon size={22} />
                          </button>
                        </td>
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
              body: JSON.stringify({ ...form, birthdate: toDateOnly(form.birthdate) }),
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
        {editStudent && <EditStudentModal studentData={editStudent} onClose={handleEditModalClose} onSave={handleEditModalSave} />}
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

// เพิ่ม EditStudentModal
function EditStudentModal({ studentData, onClose, onSave }) {
  const [form, setForm] = useState({ ...studentData });
  const [saving, setSaving] = useState(false);
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...form, birthdate: toDateOnly(form.birthdate) });
    setSaving(false);
  };
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(30,41,59,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px #2563eb33', padding: 32, minWidth: 340, maxWidth: 480, width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h3 style={{ margin: 0, fontWeight: 700, fontSize: 22, color: '#2563eb' }}>แก้ไขข้อมูลนักเรียน</h3>
        <div>
          <label style={{ color: '#222' }}>รหัสนักเรียน <span style={{ color: 'red' }}>*</span></label>
          <input name="student_code" type="text" value={form.student_code} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#222' }}>ชื่อ <span style={{ color: 'red' }}>*</span></label>
            <input name="first_name" type="text" value={form.first_name} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#222' }}>นามสกุล <span style={{ color: 'red' }}>*</span></label>
            <input name="last_name" type="text" value={form.last_name} onChange={handleChange} required style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#222' }}>เพศ</label>
            <select name="gender" value={form.gender} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }}>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#222' }}>ชั้นเรียน</label>
            <input name="class_level" type="text" value={form.class_level} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#222' }}>ห้อง</label>
            <input name="class_room" type="text" value={form.class_room} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#222' }}>ชื่อผู้ปกครอง</label>
            <input name="guardian_name" type="text" value={form.guardian_name} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#222' }}>ความสัมพันธ์กับนักเรียน</label>
            <input name="guardian_relation" type="text" value={form.guardian_relation || ''} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#222' }}>ข้อมูลติดต่อ</label>
            <input name="contact_info" type="text" value={form.contact_info} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
        </div>
        <div>
          <label style={{ color: '#222', display: 'block', marginBottom: 4 }}>วันเกิด</label>
          <DatePicker
            selected={form.birthdate ? new Date(form.birthdate) : null}
            onChange={date => setForm(f => ({ ...f, birthdate: date ? date.toISOString().slice(0, 10) : '' }))}
            dateFormat="dd/MM/yyyy"
            placeholderText="เลือกวันเกิด"
            customInput={<CustomInput />}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            
          />
        </div>
        <div>
          <label style={{ color: '#222' }}>ครูที่ปรึกษา</label>
          <input name="advisor_name" type="text" value={form.advisor_name || ''} onChange={handleChange} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }} />
        </div>
        <div>
          <label style={{ color: '#222' }}>วันที่สร้าง</label>
          <input name="created_at" type="text" value={form.created_at ? form.created_at.split('T')[0] : ''} readOnly style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd', background: '#f1f5f9' }} />
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, background: '#cbd5e1', color: '#334155', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>ยกเลิก</button>
          <button type="submit" disabled={saving} style={{ flex: 1, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: 16, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
        </div>
      </form>
    </div>
  );
} 