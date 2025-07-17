import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from '../../components/menu';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';


export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentCases, setRecentCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
    } else {
      fetch('https://student-main-behavior-backend.onrender.com/api/statistics')
        .then(res => res.json())
        .then(data => {
          setStats(data);
          setLoading(false);
        })
        .catch(() => {
          setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
          setLoading(false);
        });
      fetch('https://student-main-behavior-backend.onrender.com/api/cases?limit=5&sort=desc')
        .then(res => res.json())
        .then(data => {
          setRecentCases(data);
          setLoadingCases(false);
        })
        .catch(() => setLoadingCases(false));
    }
  }, [navigate]);

  // เตรียมข้อมูลสำหรับกราฟแท่ง
  const pieData = stats ? [
    { name: 'นักเรียน', value: stats.students },
    { name: 'เคส', value: stats.cases },
  ] : [];
  const pieColors = ['#ff69b4', '#fbcfe8'];

  return (
    <>
      {/* <Menu /> ลบออกเพื่อไม่ให้เมนูแสดงซ้ำ */}
      <div style={{
        maxWidth: 1200,
        margin: '80px auto',
        marginLeft: 50,
        padding: 24,
        border: '1px solid #eee',
        borderRadius: 12,
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        gap: 40,
      }} className="home-container-responsive">
        <div>
          <h2 style={{ marginBottom: 24, color: 'var(--color-text-primary)' }}>สถิติภาพรวม</h2>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'row', gap: 24 }}>
              {[...Array(4)].map((_, i) => (
                <SkeletonStatCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div style={{ color: 'red' }}>{error}</div>
          ) : stats ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'row', gap: 24 }} className="stat-row-responsive">
                <StatCard label="นักเรียนทั้งหมด" value={stats.students} color="#2563eb" />
                <StatCard label="ผู้ใช้ (Admin/Teacher/Counselor)" value={stats.admins} color="#f59e42" />
                <StatCard label="พฤติกรรมที่มีการบันทึก" value={stats.behaviors} color="#10b981" />
                <StatCard label="เคส/เหตุการณ์ทั้งหมด" value={stats.cases} color="#ef4444" />
              </div>
              {/* กราฟแท่งสถิติภาพรวม */}
              <div style={{ width: '100%', minHeight: 260, height: '32vw', maxHeight: 400, marginTop: 32, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : null}
        </div>
        <div>
          <h2 style={{ marginBottom: 24, color: 'var(--color-text-primary)' }}>เคสล่าสุด</h2>
          {loadingCases ? (
            <div>
              {[...Array(5)].map((_, i) => (
                <SkeletonCaseCard key={i} />
              ))}
            </div>
          ) : recentCases && recentCases.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="case-col-responsive">
              {recentCases.map((c, i) => (
                <CaseCard key={c.id || i} caseData={c} />
              ))}
            </div>
          ) : (
            <div style={{ color: '#888', padding: 16 }}>ไม่พบข้อมูลเคสล่าสุด</div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes skeleton-loading {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
        @media (max-width: 700px) {
          .home-container-responsive {
            max-width: 100vw !important;
            margin: 70px 0 0 0 !important;
            padding: 10px 2vw 20px 2vw !important;
            border-radius: 0 !important;
            border: none !important;
            gap: 24px !important;
          }
          .stat-row-responsive {
            flex-direction: column !important;
            gap: 14px !important;
          }
          .case-col-responsive {
            gap: 10px !important;
          }
          .stat-row-responsive > div, .case-col-responsive > div {
            min-width: 0 !important;
            width: 100% !important;
            box-sizing: border-box !important;
            padding: 18px 10px !important;
          }
          .home-container-responsive .recharts-responsive-container {
            min-height: 220px !important;
            height: 48vw !important;
            max-height: 320px !important;
          }
          h2 {
            font-size: 1.1rem !important;
            margin-bottom: 12px !important;
          }
        }
      `}</style>
    </>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e0e7ef33', padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 120 }}>
      <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-text-primary)' }}>{value}</div>
      <div style={{ fontSize: 18, color: 'var(--color-text-primary)', marginTop: 8, textAlign: 'center' }}>{label}</div>
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e0e7ef33', padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 120 }}>
      <div style={{ height: 38, width: 80, borderRadius: 8, background: 'linear-gradient(90deg, #e0e7ff 25%, #f1f5f9 50%, #e0e7ff 75%)', marginBottom: 16, animation: 'skeleton-loading 1.2s infinite linear' }} />
      <div style={{ height: 18, width: 120, borderRadius: 6, background: 'linear-gradient(90deg, #e0e7ff 25%, #f1f5f9 50%, #e0e7ff 75%)', marginTop: 8, animation: 'skeleton-loading 1.2s infinite linear' }} />
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

function CaseCard({ caseData }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 6px #e0e7ef33', padding: 18, display: 'flex', flexDirection: 'column', minHeight: 60 }}>
      <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-text-primary)', marginBottom: 4 }}>{caseData.case_title || '-'}</div>
      <div style={{ fontSize: 15, color: 'var(--color-text-primary)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {caseData.case_description || '-'}
      </div>
      <div style={{ fontSize: 14, color: 'var(--color-text-primary)', marginTop: 2 }}>
        {caseData.first_name ? `${caseData.first_name} ${caseData.last_name}` : '-'} | {caseData.class_level || '-'}{caseData.class_room ? '/' + caseData.class_room : ''} | {caseData.status}
      </div>
      <div style={{ fontSize: 13, color: 'var(--color-text-primary)', marginTop: 2 }}>
        {caseData.reported_at ? caseData.reported_at.split('T')[0] : '-'}
      </div>
    </div>
  );
}

function SkeletonCaseCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 6px #e0e7ef33', padding: 18, minHeight: 60, marginBottom: 0 }}>
      <div style={{ height: 18, width: '60%', borderRadius: 6, background: 'linear-gradient(90deg, #e0e7ff 25%, #f1f5f9 50%, #e0e7ff 75%)', marginBottom: 8, animation: 'skeleton-loading 1.2s infinite linear' }} />
      <div style={{ height: 14, width: '90%', borderRadius: 6, background: 'linear-gradient(90deg, #e0e7ff 25%, #f1f5f9 50%, #e0e7ff 75%)', marginBottom: 6, animation: 'skeleton-loading 1.2s infinite linear' }} />
      <div style={{ height: 12, width: '50%', borderRadius: 6, background: 'linear-gradient(90deg, #e0e7ff 25%, #f1f5f9 50%, #e0e7ff 75%)', marginBottom: 4, animation: 'skeleton-loading 1.2s infinite linear' }} />
      <div style={{ height: 10, width: '30%', borderRadius: 6, background: 'linear-gradient(90deg, #e0e7ff 25%, #f1f5f9 50%, #e0e7ff 75%)', animation: 'skeleton-loading 1.2s infinite linear' }} />
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