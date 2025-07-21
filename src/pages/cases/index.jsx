import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PDFDownloadLink } from '@react-pdf/renderer';
import CasePDFDocument from './CasePDFDocument';


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

function exportToPDF(rows) {
  if (!rows.length) return;
  const doc = new jsPDF();
  const header = [
    "รายละเอียด", "นักเรียน", "ชั้น", "ห้อง", "พฤติกรรม", "ผู้รายงาน", "สถานะ", "วันที่รายงาน", "รอบ", "แผนการดำเนินการ"
  ];
  const data = rows.map(c => [
    c.case_description || '-',
    c.first_name ? `${c.first_name} ${c.last_name}` : '-',
    c.class_level || '-',
    c.class_room || '-',
    c.behavior_name || '-',
    c.reporter_name || '-',
    c.status || '-',
    c.reported_at ? c.reported_at.split('T')[0] : '-',
    c.round || '-',
    c.action_plan || '-'
  ]);
  doc.autoTable({
    head: [header],
    body: data,
    styles: { fontSize: 12 },
    headStyles: { fillColor: [37, 99, 235] }
  });
  doc.save('cases_export.pdf');
}

const EditIcon = ({size=20}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.85 2.85a2.121 2.121 0 0 1 3 3l-9.1 9.1a2 2 0 0 1-.71.44l-3.13 1.04a.5.5 0 0 1-.63-.63l1.04-3.13a2 2 0 0 1 .44-.71l9.1-9.1Zm2.12.88a1.121 1.121 0 0 0-1.59 0l-9.1 9.1a1 1 0 0 0-.22.36l-.9 2.7 2.7-.9a1 1 0 0 0 .36-.22l9.1-9.1a1.121 1.121 0 0 0 0-1.59Z" fill="var(--color-warning, #f59e42)"/>
  </svg>
);

const DeleteIcon = ({size=20}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="8" width="2" height="7" rx="1" fill="var(--color-status-error, #ef4444)"/>
    <rect x="9" y="8" width="2" height="7" rx="1" fill="var(--color-status-error, #ef4444)"/>
    <rect x="13" y="8" width="2" height="7" rx="1" fill="var(--color-status-error, #ef4444)"/>
    <rect x="3" y="4" width="14" height="2" rx="1" fill="var(--color-status-error, #ef4444)"/>
    <rect x="7" y="2" width="6" height="2" rx="1" fill="var(--color-status-error, #ef4444)"/>
    <rect x="4" y="6" width="12" height="2" rx="1" fill="var(--color-status-error, #ef4444)"/>
  </svg>
);

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchRoom, setSearchRoom] = useState('');
  const [selected, setSelected] = useState([]);
  const [editCase, setEditCase] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const casesPerPage = 5;
  const [user, setUser] = useState({});
  // เพิ่ม state สำหรับประเภทที่เลือก
  const [selectedType, setSelectedType] = useState('');

  // สร้างรายการประเภททั้งหมดจากข้อมูล cases
  const allTypes = Array.from(new Set(cases.map(c => c.behavior_type).filter(Boolean)));

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch('https://student-main-behavior-backend.onrender.com/api/cases' + (searchName ? `?q=${encodeURIComponent(searchName)}` : ''))
      .then(res => res.json())
      .then(data => {
        setCases(data);
        setLoading(false);
      })
      .catch(() => {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        setLoading(false);
      });
  }, [searchName]);

  const handleSelectAll = e => {
    setSelected(e.target.checked ? filteredCases.map(c => c.id) : []);
  };
  const handleSelect = id => {
    setSelected(selected.includes(id) ? selected.filter(i => i !== id) : [...selected, id]);
  };

  // Filter by name, room, และประเภท (frontend)
  const filteredCases = cases.filter(c => {
    const nameMatch = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase().includes(searchName.toLowerCase());
    // Normalize class_level and class_room for search
    const classLevelStr = String(c.class_level);
    const classLevelLabel = c.class_level ? `ม.${c.class_level}` : '';
    const classRoomStr = String(c.class_room || '');
    const searchRoomTrim = searchRoom.trim();

    // Support search like '6/4' or 'ม.6/4'
    let roomMatch = false;
    if (searchRoomTrim.includes('/')) {
      // Split by /
      const [searchLevel, searchRoomNum] = searchRoomTrim.replace('ม.', '').split('/');
      roomMatch = (
        (classLevelStr === searchLevel.trim() || classLevelLabel === `ม.${searchLevel.trim()}`)
        && classRoomStr === searchRoomNum.trim()
      );
    } else {
      roomMatch =
        searchRoomTrim === '' ||
        classLevelStr.includes(searchRoomTrim) ||
        classLevelLabel.includes(searchRoomTrim) ||
        classRoomStr.includes(searchRoomTrim);
    }
    // filter ประเภท
    const typeMatch = !selectedType || c.behavior_type === selectedType;
    return nameMatch && roomMatch && typeMatch;
  });
  // Pagination logic
  const totalPages = Math.ceil(filteredCases.length / casesPerPage) || 1;
  const paginatedCases = filteredCases.slice((currentPage - 1) * casesPerPage, currentPage * casesPerPage);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, searchRoom]);

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
    setAddModalOpen(false); // Always close Add modal before opening Edit
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

  // MODAL ADD
  const handleAddClick = () => {
    setEditCase(null); // Always close Edit modal before opening Add
    setAddModalOpen(true);
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
          <h2 style={{ fontWeight: 800, fontSize: 32, color: 'var(--primary, #222)', letterSpacing: 1, margin: 0 , color: '#222'}}>จัดการเคส/เหตุการณ์</h2>
          <button
            onClick={handleAddClick}
            style={{ background: 'var(--color-primary)', color: 'var(--color-primary-contrast)', padding: '8px 16px', borderRadius: 10, fontWeight: 700, fontSize: 15, boxShadow: '0 2px 8px var(--color-primary, #2563eb22)', transition: 'background 0.2s', border: 'none', cursor: 'pointer', width: '100%', maxWidth: 200 }}
          >
            + เพิ่มเคส
          </button>
        </div>
        <div style={{ display: 'flex', gap: 14, marginBottom: 18, flexWrap: 'nowrap', alignItems: 'center', overflowX: 'auto' }}>
          {/* ปุ่มค้นหาประเภท */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', minWidth: 160, fontSize: 16 }}
          >
            <option value="">-- ค้นหาประเภท --</option>
            {allTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="ค้นหาชื่อ-นามสกุลนักเรียน"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', minWidth: 180, fontSize: 16 }}
          />
          <input
            type="text"
            placeholder="ค้นหา ชั้น / ห้อง"
            value={searchRoom}
            onChange={e => setSearchRoom(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', minWidth: 120, fontSize: 16 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => exportToCSV(filteredCases.filter(c => selected.includes(c.id)))}
              disabled={!selected.length}
              style={{ background: selected.length ? '#10b981' : '#cbd5e1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontWeight: 700, fontSize: 16, minWidth: 120, height: 50, boxShadow: selected.length ? '0 2px 8px #10b98133' : 'none', cursor: selected.length ? 'pointer' : 'not-allowed', transition: 'background 0.2s, box-shadow 0.2s'  }}
            >
              Export CSV
            </button>
            <PDFDownloadLink
              document={<CasePDFDocument rows={filteredCases.filter(c => selected.includes(c.id))} />}
              fileName="cases_export.pdf"
            >
              {({ loading }) => (
                <button
                  disabled={!selected.length}
                  style={{ background: selected.length ? '#ef4444' : '#cbd5e1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontWeight: 700, fontSize: 16, minWidth: 120, height: 50, boxShadow: selected.length ? '0 2px 8px #ef444433' : 'none', cursor: selected.length ? 'pointer' : 'not-allowed', transition: 'background 0.2s, box-shadow 0.2s' }}
                >
                  {loading ? 'กำลังสร้าง PDF...' : 'Export PDF'}
                </button>
              )}
            </PDFDownloadLink>
          </div>
        </div>
        {/* Pagination controls moved here */}
        {filteredCases.length > casesPerPage && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 18 }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: '6px 18px', borderRadius: 8, border: '1px solid #cbd5e1', background: currentPage === 1 ? '#f1f5f9' : '#fff', color: '#222', fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              ก่อนหน้า
            </button>
            <span style={{ fontWeight: 600, color: '#2563eb' }}>หน้า {currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: '6px 18px', borderRadius: 8, border: '1px solid #cbd5e1', background: currentPage === totalPages ? '#f1f5f9' : '#fff', color: '#222', fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              ถัดไป
            </button>
          </div>
        )}
        {loading ? (
          <SkeletonTable />
        ) : error ? (
          <div style={{ color: 'red', padding: 24, textAlign: 'center' }}>{error}</div>
        ) : (
          <div style={{ overflowX: 'auto', transition: 'box-shadow 0.3s' }} className="cases-table-scroll">
            <table style={{ width: '100%', minWidth: 1200, borderCollapse: 'collapse', fontSize: 15, background: 'transparent', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 8px #2563eb11', transition: 'box-shadow 0.3s' }} className="cases-table-responsive">
              <thead>
                <tr style={{ background: 'var(--table-head, #f1f5f9)', transition: 'background 0.3s' }}>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <input type="checkbox" checked={selected.length === filteredCases.length && filteredCases.length > 0} onChange={handleSelectAll} />
                  </th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>#</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>ประเภท</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>รายละเอียด</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>นักเรียน</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>ชั้น</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>ห้อง</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>พฤติกรรม</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>รอบ</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>แผนการดำเนินการ</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>ผู้รายงาน</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>สถานะ</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>วันที่รายงาน</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center', minWidth: 80 }}>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.length === 0 ? (
                  <tr><td colSpan={14} style={{ textAlign: 'center', padding: 24 }}>ไม่มีข้อมูล</td></tr>
                ) : paginatedCases.map((c, idx) => (
                  <tr key={c.id} style={{ transition: 'background 0.22s', background: selected.includes(c.id) ? '#e0f2fe' : 'transparent' }}>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                      <input type="checkbox" checked={selected.includes(c.id)} onChange={() => handleSelect(c.id)} />
                    </td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{(currentPage - 1) * casesPerPage + idx + 1}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{c.behavior_type || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{c.case_description || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{c.first_name ? `${c.first_name} ${c.last_name}` : '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{c.class_level || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{c.class_room || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{c.behavior_name || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{c.round || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{c.action_plan || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{c.reporter_name || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                      {c.status === 'open' ? (
                        <span style={{ color: '#10b981', fontWeight: 700 }}>ดำเนินการแล้ว</span>
                      ) : c.status === 'in_progress' ? (
                        <span style={{ color: '#f59e42', fontWeight: 700 }}>กำลังดำเนินการ</span>
                      ) : c.status === 'closed' ? (
                        <span style={{ color: '#ef4444', fontWeight: 700 }}>ละทิ้ง</span>
                      ) : c.status}
                    </td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{c.reported_at ? c.reported_at.split('T')[0] : '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center', minWidth: 80 }}>
                      <button
                        onClick={() => handleEdit(c.id)}
                        title={user.role === 'teacher' ? "ไม่มีสิทธิ์แก้ไข" : "แก้ไข"}
                        disabled={user.role === 'teacher'}
                        style={{
                          marginRight: 8,
                          background: 'none',
                          border: 'none',
                          padding: 6,
                          borderRadius: 8,
                          cursor: user.role === 'teacher' ? 'not-allowed' : 'pointer',
                          width: 36,
                          height: 36,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: user.role === 'teacher' ? 0.5 : 1
                        }}
                      >
                        <EditIcon size={28} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        title={user.role === 'teacher' ? "ไม่มีสิทธิ์ลบ" : "ลบ"}
                        disabled={user.role === 'teacher'}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 6,
                          borderRadius: 8,
                          cursor: user.role === 'teacher' ? 'not-allowed' : 'pointer',
                          width: 36,
                          height: 36,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: user.role === 'teacher' ? 0.5 : 1
                        }}
                      >
                        <DeleteIcon size={28} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination controls removed from here */}
          </div>
        )}
      </div>
      {editCase && <EditCaseModal caseData={editCase} onClose={handleEditModalClose} onSave={handleEditModalSave} />}
      {addModalOpen && <AddCaseModal onClose={() => setAddModalOpen(false)} onSave={handleAddModalSave} userRole={user.role} />}
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
        @media (max-width: 700px) {
          .cases-table-responsive {
            font-size: 13px !important;
            min-width: 900px !important;
          }
          .cases-table-responsive th, .cases-table-responsive td {
            padding: 7px !important;
          }
          .cases-table-responsive button {
            width: 32px !important;
            height: 32px !important;
            padding: 4px !important;
          }
          .cases-table-responsive svg {
            width: 22px !important;
            height: 22px !important;
          }
          input, select, textarea {
            font-size: 15px !important;
            padding: 7px !important;
          }
          .cases-table-responsive {
            min-width: 600px;
          }
          .cases-table-scroll {
            overflow-x: auto;
            width: 100vw;
            margin-left: -16px;
            padding-left: 8px;
          }
          .cases-table-responsive +div>button.btn.btn-primary, .cases-table-responsive ~ button.btn.btn-primary, .cases-table-responsive ~ div>button.btn.btn-primary {
            width: 100% !important;
            max-width: none !important;
            display: block !important;
            margin-bottom: 12px !important;
          }
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
            {/* 14 columns: checkbox, #, ประเภท, รายละเอียด, นักเรียน, ชั้น, ห้อง, พฤติกรรม, รอบ, แผนการดำเนินการ, ผู้รายงาน, สถานะ, วันที่รายงาน, การจัดการ */}
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th> {/* ประเภท */}
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th> {/* รายละเอียด */}
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
            <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, r) => (
            <tr key={r}>
              {/* 14 columns: checkbox, #, ประเภท, รายละเอียด, นักเรียน, ชั้น, ห้อง, พฤติกรรม, รอบ, แผนการดำเนินการ, ผู้รายงาน, สถานะ, วันที่รายงาน, การจัดการ */}
              {[...Array(14)].map((_, c) => (
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
        <label style={{ color: '#222' }}>รายละเอียด
          <textarea name="case_description" value={form.case_description || ''} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, minHeight: 60 }} />
        </label>
        <label style={{ color: '#222' }}>รอบ
          <select name="round" value={form.round} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </label>
        <label style={{ color: '#222' }}>แผนการดำเนินการ
          <select name="action_plan" value={form.action_plan || ''} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4 }}>
            <option value="">-- ไม่เลือก --</option>
            <option value="ควบคุมพฤติกรรม">ควบคุมพฤติกรรม</option>
            <option value="เรียนผ่านช่องทาง W.T.S Platform">เรียนผ่านช่องทาง W.T.S Platform</option>
            <option value="เข้าคณะ School Credits">เข้าคณะ School Credits</option>
          </select>
        </label>
        <label style={{ color: '#222' }}>สถานะ
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
function AddCaseModal({ onClose, onSave, userRole }) {
  const [form, setForm] = useState({
    student_id: '',
    behavior_id: '',
    reported_by: '',
    case_description: '',
    status: userRole === 'teacher' ? 'in_progress' : 'open',
    round: userRole === 'teacher' ? '1' : '1',
    action_plan: '',
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
          <label style={{ color: '#222' }}>นักเรียน <span style={{ color: 'red' }}>*</span></label>
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
          <label style={{ color: '#222' }}>พฤติกรรม <span style={{ color: 'red' }}>*</span></label>
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
          <label style={{ color: '#222' }}>ผู้รายงาน <span style={{ color: 'red' }}>*</span></label>
          <input
            type="text"
            value={reporterName}
            readOnly
            style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd', background: '#f1f5f9' }}
          />
        </div>
        <div>
          <label style={{ color: '#222' }}>รายละเอียด</label>
          <textarea
            name="case_description"
            value={form.case_description}
            onChange={handleChange}
            rows={3}
            style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ddd' }}
          />
        </div>
        <div style={{display: 'flex', gap: 12}}>
          <div style={{flex: 1}}>
            <label style={{ color: '#222' }}>รอบ</label>
            <select
              name="round"
              value={form.round}
              onChange={handleChange}
              disabled={userRole === 'teacher'}
              style={{
                width: '100%',
                padding: 8,
                marginTop: 4,
                borderRadius: 6,
                border: '1px solid #ddd',
                background: userRole === 'teacher' ? '#f1f5f9' : '#fff',
                cursor: userRole === 'teacher' ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
          <div style={{flex: 1}}>
            <label style={{ color: '#222' }}>สถานะ</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={userRole === 'teacher'}
              style={{
                width: '100%',
                padding: 8,
                marginTop: 4,
                borderRadius: 6,
                border: '1px solid #ddd',
                background: userRole === 'teacher' ? '#f1f5f9' : '#fff',
                cursor: userRole === 'teacher' ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="open">ดำเนินการแล้ว</option>
              <option value="in_progress">กำลังดำเนินการ</option>
              <option value="closed">ละทิ้ง</option>
            </select>
          </div>
        </div>
        <div>
          <label style={{ color: '#222' }}>แผนการดำเนินการ</label>
          <select
            name="action_plan"
            value={form.action_plan}
            onChange={handleChange}
            disabled={userRole === 'teacher'}
            style={{
              width: '100%',
              padding: 8,
              marginTop: 4,
              borderRadius: 6,
              border: '1px solid #ddd',
              background: userRole === 'teacher' ? '#f1f5f9' : '#fff',
              cursor: userRole === 'teacher' ? 'not-allowed' : 'pointer'
            }}
          >
            <option value="">-- ไม่เลือก --</option>
            <option value="ควบคุมพฤติกรรม">ควบคุมพฤติกรรม</option>
            <option value="เรียนผ่านช่องทาง W.T.S Platform">เรียนผ่านช่องทาง W.T.S Platform</option>
            <option value="เข้าคณะ School Credits">เข้าคณะ School Credits</option>
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