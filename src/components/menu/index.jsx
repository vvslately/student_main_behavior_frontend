import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import logo from '../../assets/logo.png';

const menuItems = [
  { to: '/home', label: 'หน้าแรก' },
  { to: '/behaviors', label: 'ประเภทพฤติกรรม' },
  { to: '/cases', label: 'บันทึกเคส/เหตุการณ์' },
  { to: '/students', label: 'จัดการนักเรียน' },
  { to: '/admins', label: 'จัดการผู้ใช้งาน' },
  { to: '/logs', label: 'บันทึกการเข้าใช้' },
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

  // Filter menu by role (headteacher เหลือแค่ /home, /cases, /logs)
  let filteredMenuItems = menuItems;
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'headteacher' || user.role === 'teacher') {
      filteredMenuItems = menuItems.filter(item => ['/home','/cases','/logs'].includes(item.to));
    }
  } catch (e) {}

  // สร้างข้อความสวัสดี
  const displayName = user.full_name || user.username || '';
  const displayRole = user.role ? `(${user.role})` : '';
  const greeting = displayName ? `สวัสดี, ${displayName} ${displayRole}` : '';

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
            background: 'var(--gradient-primary)',
            borderRadius: '50%',
            boxShadow: '0 4px 16px var(--color-primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.22s, box-shadow 0.22s, transform 0.18s',
            outline: 'none',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.boxShadow = '0 8px 32px var(--color-primary-light)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 16px var(--color-primary-light)';
          }}
        >
          <div style={{
            width: 32,
            height: 32,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            position: 'relative',
          }}>
            {[0, 1, 2].map(i => (
              <span
                key={i}
                style={{
                  display: 'block',
                  width: 28,
                  height: 4,
                  borderRadius: 2,
                  background: 'var(--color-primary)',
                  transition: 'all 0.32s cubic-bezier(.4,2,.6,1), opacity 0.22s',
                  boxShadow: '0 1px 4px var(--color-primary-light)',
                  position: 'relative',
                  transform:
                    open
                      ? i === 0
                        ? 'translateY(10px) rotate(45deg)'
                        : i === 1
                          ? 'scaleX(0)'
                          : 'translateY(-10px) rotate(-45deg)'
                      : 'none',
                  opacity: open && i === 1 ? 0 : 1,
                }}
              />
            ))}
          </div>
        </button>
      )}
      <aside
        ref={sidebarRef}
        style={{
          width: isMobile ? '85vw' : 320,
          minWidth: isMobile ? '280px' : 320,
          maxWidth: isMobile ? '350px' : 400,
          height: '100vh',
          background: 'var(--gradient-background)',
          borderRight: 'none',
          border: 'none',
          padding: isMobile ? '20px 0 20px 0' : '48px 0',
          position: 'fixed',
          top: 0,
          left: open ? 0 : isMobile ? '-100vw' : 0,
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          boxShadow: open
            ? '4px 0 24px 0 var(--color-border-light)'
            : 'none',
          fontFamily: 'Prompt, Inter, "Segoe UI", Arial, sans-serif',
          transition: 'left 0.38s cubic-bezier(.4,2,.6,1), box-shadow 0.3s',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* Header Section - Fixed */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          margin: isMobile ? '0 16px 24px 16px' : '0 24px 32px 24px',
          paddingTop: 0,
          flexShrink: 0
        }}>
          <img
            src={logo}
            alt="โลโก้"
            style={{
              width: isMobile ? 120 : 150,
              height: 'auto',
              objectFit: 'contain',
              marginBottom: 8,
              marginTop: 0
            }}
          />
          <span style={{
            fontWeight: 800,
            fontSize: isMobile ? 24 : 32,
            color: 'var(--color-primary-light)',
            letterSpacing: 1,
            fontFamily: 'inherit',
            textShadow: '0 2px 8px var(--color-primary-contrast)',
            marginTop: 0,
            textAlign: 'center',
            lineHeight: 1.2
          }}>
            ระบบข้อมูลการบันทึกพฤติกรรมนักเรียน
          </span>
        </div>

        {/* Scrollable Content */}
        <div style={{ 
          flex: '1 1 0%', 
          overflowY: 'auto', 
          minHeight: 0, 
          display: 'flex', 
          flexDirection: 'column',
          paddingBottom: isMobile ? 20 : 24
        }}>
          <nav>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: isMobile ? 12 : 16 
            }}>
              {filteredMenuItems.map((item, idx) => (
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
        </div>
        {/* Logout button - Fixed at bottom */}
        <div style={{
          flexShrink: 0,
          padding: isMobile ? '16px 16px 0 16px' : '24px 24px 0 24px',
          marginTop: 'auto'
        }}>
          <button
            onClick={async () => {
              const result = await Swal.fire({
                title: 'ยืนยันการออกจากระบบ',
                text: 'คุณต้องการออกจากระบบใช่หรือไม่?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: 'var(--color-primary)',
                cancelButtonColor: 'var(--color-status-error)',
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
              width: '100%',
              padding: isMobile ? '14px 0' : '16px 0',
              background: 'var(--gradient-primary)',
              color: 'var(--color-primary-contrast)',
              border: 'none',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: isMobile ? 15 : 16,
              cursor: 'pointer',
              boxShadow: '0 4px 12px 0 var(--color-primary-light)',
              transition: 'all 0.2s ease',
              display: 'block',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px 0 var(--color-primary-light)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px 0 var(--color-primary-light)';
            }}
          >
            ออกจากระบบ
          </button>
        </div>
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
            width: 85vw !important;
            min-width: 280px !important;
            max-width: 350px !important;
            height: 100vh !important;
            flex-direction: column !important;
            padding: 20px 0 20px 0 !important;
            position: fixed !important;
            top: 0; left: 0; right: auto;
            box-shadow: 4px 0 24px 0 var(--color-border-light);
            z-index: 200;
            overflow-x: hidden !important;
            overflow-y: auto !important;
            transition: left 0.38s cubic-bezier(.4,2,.6,1);
            -webkit-overflow-scrolling: touch;
          }
          aside nav ul {
            flex-direction: column !important;
            gap: 12px !important;
            width: 100%;
            justify-content: flex-start;
          }
          aside nav ul li {
            width: 100%;
          }
        }
        
        /* Tablet responsive */
        @media (min-width: 701px) and (max-width: 1024px) {
          aside {
            width: 300px !important;
            min-width: 300px !important;
            max-width: 350px !important;
          }
        }
        /* Custom Scrollbar for aside */
        aside {
          scrollbar-width: thin;
          scrollbar-color: var(--color-primary) #f0f0f0;
        }
        aside::-webkit-scrollbar {
          width: 8px;
        }
        aside::-webkit-scrollbar-thumb {
          background: var(--color-primary);
          border-radius: 6px;
        }
        aside::-webkit-scrollbar-track {
          background: rgba(240, 240, 240, 0.3);
          border-radius: 6px;
        }
        /* Mobile scrollbar optimization */
        @media (max-width: 700px) {
          aside::-webkit-scrollbar {
            width: 6px;
          }
          aside::-webkit-scrollbar-thumb {
            background: var(--color-primary-light);
            border-radius: 4px;
          }
          aside::-webkit-scrollbar-track {
            background: rgba(240, 240, 240, 0.2);
            border-radius: 4px;
          }
        }
        
        /* Ensure proper scrolling behavior */
        aside {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        
        /* Fix for iOS Safari */
        @supports (-webkit-touch-callout: none) {
          aside {
            -webkit-overflow-scrolling: touch;
            overflow-y: scroll;
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
          background: active ? 'var(--gradient-secondary)' : 'transparent',
          boxShadow: active ? '0 2px 8px 0 var(--color-primary-light)' : undefined,
          transition: 'all 0.32s cubic-bezier(.4,2,.6,1)',
          opacity: active ? 1 : 0,
        }}
      />
      <Link
        ref={linkRef}
        to={to}
        onClick={onClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 0,
          width: '100%',
          minHeight: 56,
          height: 56,
          padding: '0 32px 0 28px',
          borderRadius: 12,
          fontSize: 20,
          color: active ? 'var(--color-primary-contrast)' : 'var(--color-text-primary)',
          background: active
            ? 'var(--gradient-secondary)'
            : 'rgba(255,255,255,0.7)',
          fontWeight: active ? 700 : 500,
          textDecoration: 'none',
          transition: 'background 0.22s, color 0.22s, transform 0.18s, box-shadow 0.18s',
          boxShadow: active
            ? '0 4px 16px 0 var(--color-primary-light)'
            : '0 1px 4px 0 var(--color-border-light)',
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
            ? 'var(--gradient-secondary)'
            : 'var(--gradient-background)';
          e.currentTarget.style.boxShadow = '0 6px 24px 0 var(--color-primary-light)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = active
            ? 'var(--gradient-secondary)'
            : 'rgba(255,255,255,0.7)';
          e.currentTarget.style.boxShadow = active
            ? '0 4px 16px 0 var(--color-primary-light)'
            : '0 1px 4px 0 var(--color-border-light)';
        }}
      >
        {children}
      </Link>
    </div>
  );
}