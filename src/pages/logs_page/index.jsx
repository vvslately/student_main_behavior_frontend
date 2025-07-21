import { useEffect, useState } from 'react';

function SkeletonTable() {
  // 7 columns for login logs
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
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

export default function LoginLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;
  const totalPages = Math.ceil(logs.length / logsPerPage);
  const paginatedLogs = logs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('กรุณาเข้าสู่ระบบใหม่');
      setLoading(false);
      return;
    }
    fetch('https://student-main-behavior-backend.onrender.com/api/login-logs/me', {
      headers: {  
        'Authorization': 'Bearer ' + token
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        return res.json();
      })
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(() => {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        setLoading(false);
      });
  }, []);

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
        <h2 style={{ fontWeight: 800, fontSize: 32, color: '#222', letterSpacing: 1, margin: 0, marginBottom: 24 }}>ประวัติการเข้าสู่ระบบ</h2>
        {loading ? (
          <SkeletonTable />
        ) : error ? (
          <div style={{ color: 'red', padding: 24, textAlign: 'center' }}>{error}</div>
        ) : (
          <div style={{ overflowX: 'auto', transition: 'box-shadow 0.3s' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, background: 'transparent', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 8px #2563eb11', transition: 'box-shadow 0.3s' }}>
              <thead>
                <tr style={{ background: 'var(--table-head, #f1f5f9)' }}>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>ลำดับ</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>ชื่อผู้ใช้</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>ชื่อ-นามสกุล</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>เวลาเข้าใช้งาน</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>IP Address</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb' }}>User Agent</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>สถานะ</th>
                  <th style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>ดูแผนที่</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24 }}>ไม่มีข้อมูล</td></tr>
                ) : paginatedLogs.map((log, i) => (
                  <tr key={log.id}>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{log.username || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{log.full_name || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>{log.login_time ? new Date(log.login_time).toLocaleString('th-TH', { hour12: false }) : '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{log.ip_address || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb' }}>{log.user_agent || '-'}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                      {log.status === 'success' ? (
                        <span style={{ color: '#10b981', fontWeight: 700 }}>สำเร็จ</span>
                      ) : (
                        <span style={{ color: '#ef4444', fontWeight: 700 }}>ล้มเหลว</span>
                      )}
                    </td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                      {log.ip_address ? (
                        <a
                          href={`https://ipinfo.io/${log.ip_address.split(',')[0].trim()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 600 }}
                        >
                          ดูแผนที่
                        </a>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ marginRight: 8, padding: '6px 16px', borderRadius: 6, border: '1px solid #2563eb', background: currentPage === 1 ? '#e5e7eb' : '#2563eb', color: currentPage === 1 ? '#888' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                ก่อนหน้า
              </button>
              <span style={{ alignSelf: 'center', fontWeight: 600 }}>
                หน้า {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ marginLeft: 8, padding: '6px 16px', borderRadius: 6, border: '1px solid #2563eb', background: currentPage === totalPages ? '#e5e7eb' : '#2563eb', color: currentPage === totalPages ? '#888' : '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
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
        @media (max-width: 700px) {
          table { font-size: 13px !important; }
          th, td { padding: 7px !important; }
        }
      `}</style>
    </div>
  );
}
