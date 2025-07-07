import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const menuItems = [
  { to: '/home', label: 'หน้าแรก' },
  { to: '/behaviors', label: 'จัดการพฤติกรรม' },
  { to: '/cases', label: 'จัดการเคส/เหตุการณ์' },
  { to: '/students', label: 'จัดการนักเรียน' },
  { to: '/admins', label: 'จัดการผู้ใช้ ' },
];

export default function Menu() {
  const location = useLocation();
  const sidebarRef = useRef(null);
  const [open, setOpen] = useState(window.innerWidth > 700);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);
  const navigate = useNavigate(); 

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 700);
      if (window.innerWidth > 700) setOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {isMobile && (
        <button
          aria-label="เปิดเมนู"
          onClick={() => setOpen(o => !o)}
          style={{
            position: 'fixed',
            top: 18,
            left: 18,
            zIndex: 201,
            width: 54,
            height: 54,
            border: 'none',
            background: 'rgba(37,99,235,0.97)',
            borderRadius: '50%',
            boxShadow: '0 4px 16px #2563eb44',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.22s, box-shadow 0.22s, transform 0.18s',
            outline: 'none',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.boxShadow = '0 8px 32px #2563eb33';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 16px #2563eb44';
          }}
        >
          <div style={{ width: 32, height: 32, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{
              position: 'absolute',
              top: 7,
              left: 2,
              width: 28,
              height: 4,
              borderRadius: 2,
              background: '#fff',
              transition: 'transform 0.32s cubic-bezier(.4,2,.6,1), opacity 0.22s',
              transform: open ? 'rotate(45deg) translateY(10px)' : 'none',
              boxShadow: '0 1px 4px #0002',
            }} />
            <span style={{
              position: 'absolute',
              top: 14,
              left: 2,
              width: 28,
              height: 4,
              borderRadius: 2,
              background: '#fff',
              opacity: open ? 0 : 1,
              transition: 'opacity 0.22s',
              boxShadow: '0 1px 4px #0002',
            }} />
            <span style={{
              position: 'absolute',
              top: 21,
              left: 2,
              width: 28,
              height: 4,
              borderRadius: 2,
              background: '#fff',
              transition: 'transform 0.32s cubic-bezier(.4,2,.6,1), opacity 0.22s',
              transform: open ? 'rotate(-45deg) translateY(-10px)' : 'none',
              boxShadow: '0 1px 4px #0002',
            }} />
          </div>
        </button>
      )}
      <aside
        ref={sidebarRef}
        style={{
          width: isMobile ? '80vw' : 320,
          minWidth: isMobile ? '0' : 320,
          maxWidth: 400,
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)',
          borderRight: 'none',
          border: 'none',
          padding: isMobile ? '24px 0 24px 0' : '48px 0',
          position: isMobile ? 'fixed' : 'fixed',
          top: 0,
          left: open ? 0 : isMobile ? '-100vw' : 0,
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          boxShadow: open
            ? '4px 0 24px 0 rgba(30,41,59,0.13)'
            : 'none',
          fontFamily: 'Prompt, Inter, "Segoe UI", Arial, sans-serif',
          transition: 'left 0.38s cubic-bezier(.4,2,.6,1), box-shadow 0.3s',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: isMobile ? '0 18px 32px 18px' : '0 32px 40px 32px' }}>
          <span style={{ fontWeight: 800, fontSize: 32, color: '#2563eb', letterSpacing: 1, fontFamily: 'inherit', textShadow: '0 2px 8px #c7d2fe' }}>
            ระบบข้อมูลการบันทึกพฤติกรรมนักเรียน
          </span>
        </div>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {menuItems.map((item, idx) => (
              <li key={item.to} style={{position:'relative'}}>
                <MenuLink
                  to={item.to}
                  active={location.pathname === item.to}
                  delay={idx * 60}
                  onClick={() => isMobile && setOpen(false)}
                >
                  {item.label}
                </MenuLink>
              </li>
            ))}
          </ul>
        </nav>
        <button
          onClick={async () => {
            const result = await Swal.fire({
              title: 'ยืนยันการออกจากระบบ',
              text: 'คุณต้องการออกจากระบบใช่หรือไม่?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#2563eb',
              cancelButtonColor: '#d33',
              confirmButtonText: 'ใช่, ออกจากระบบ',
              cancelButtonText: 'ยกเลิก',
            });
            if (result.isConfirmed) {
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              navigate('/login');
            }
          }}
          style={{
            width: '90%',
            margin: '24px auto 0 auto',
            padding: '12px 0',
            background: '#e0e7ff',
            color: '#334155',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 8px 0 #cbd5e1',
            transition: 'background 0.2s, color 0.2s',
            display: 'block',
          }}
        >
          ออกจากระบบ
        </button>
      </aside>
      {/* Overlay for mobile */}
      {isMobile && open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(30,41,59,0.18)',
            zIndex: 199,
            transition: 'background 0.3s',
          }}
        />
      )}
      <style>{`
        aside, aside * {
          border: none !important;
          box-shadow: none !important;
        }
        @media (max-width: 700px) {
          aside {
            width: 80vw !important;
            min-width: 0 !important;
            max-width: 100vw !important;
            min-height: 100vh !important;
            flex-direction: column !important;
            padding: 24px 0 24px 0 !important;
            position: fixed !important;
            top: 0; left: 0; right: auto;
            box-shadow: 4px 0 24px 0 rgba(30,41,59,0.13);
            z-index: 200;
            overflow-x: hidden;
            transition: left 0.38s cubic-bezier(.4,2,.6,1);
          }
          aside nav ul {
            flex-direction: column !important;
            gap: 16px !important;
            width: 100%;
            justify-content: flex-start;
          }
          aside nav ul li {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}

function MenuLink({ to, active, children, delay, onClick }) {
  const linkRef = useRef(null);
  useEffect(() => {
    if (linkRef.current) {
      linkRef.current.animate([
        { opacity: 0, transform: 'translateX(-24px)' },
        { opacity: 1, transform: 'translateX(0)' }
      ], {
        duration: 400,
        delay,
        fill: 'forwards',
        easing: 'cubic-bezier(.4,2,.6,1)'
      });
    }
  }, [delay]);
  return (
    <div style={{position:'relative', display:'flex', alignItems:'center'}}>
      {/* Animated left indicator for active */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: active ? 'translateY(-50%) scaleY(1)' : 'translateY(-50%) scaleY(0.2)',
          width: 6,
          height: 38,
          borderRadius: 6,
          background: active ? 'linear-gradient(180deg, #2563eb 60%, #60a5fa 100%)' : 'transparent',
          boxShadow: active ? '0 2px 8px 0 rgba(37,99,235,0.13)' : undefined,
          transition: 'all 0.32s cubic-bezier(.4,2,.6,1)',
          opacity: active ? 1 : 0,
        }}
      />
      <Link
        ref={linkRef}
        to={to}
        onClick={onClick}
        style={{
          display: 'block',
          padding: '14px 32px 14px 28px',
          borderRadius: 12,
          fontSize: 20,
          color: active ? '#fff' : '#1e293b',
          background: active
            ? 'linear-gradient(90deg, #2563eb 80%, #60a5fa 100%)'
            : 'rgba(255,255,255,0.7)',
          fontWeight: active ? 700 : 500,
          textDecoration: 'none',
          transition: 'background 0.22s, color 0.22s, transform 0.18s, box-shadow 0.18s',
          boxShadow: active
            ? '0 4px 16px 0 rgba(37,99,235,0.13)'
            : '0 1px 4px 0 rgba(30,41,59,0.04)',
          marginLeft: 8,
          marginRight: 8,
          marginTop: 2,
          marginBottom: 2,
          position: 'relative',
          overflow: 'hidden',
          letterSpacing: 0.2,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.045)';
          e.currentTarget.style.background = active
            ? 'linear-gradient(90deg, #2563eb 80%, #60a5fa 100%)'
            : 'linear-gradient(90deg, #e0e7ff 60%, #f1f5f9 100%)';
          e.currentTarget.style.boxShadow = '0 6px 24px 0 rgba(37,99,235,0.13)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = active
            ? 'linear-gradient(90deg, #2563eb 80%, #60a5fa 100%)'
            : 'rgba(255,255,255,0.7)';
          e.currentTarget.style.boxShadow = active
            ? '0 4px 16px 0 rgba(37,99,235,0.13)'
            : '0 1px 4px 0 rgba(30,41,59,0.04)';
        }}
      >
        {children}
      </Link>
    </div>
  );
}