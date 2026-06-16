import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/tasks',     icon: '✓', label: 'Tasks' },
  { to: '/products',  icon: '◈', label: 'Products' },
  { to: '/users',     icon: '◎', label: 'Team' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const pageTitle = NAV.find(n => location.pathname.startsWith(n.to))?.label || 'TaskFlow';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 68 : 240,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? '20px 16px' : '20px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12,
          minHeight: 64,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent), #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0, boxShadow: '0 0 20px var(--accent-glow)',
          }}>⚡</div>
          {!collapsed && (
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>
              TaskFlow
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 'var(--radius-md)',
                fontSize: 14, fontWeight: 500,
                color: isActive ? '#fff' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent)' : 'transparent',
                boxShadow: isActive ? '0 4px 15px var(--accent-glow)' : 'none',
                transition: 'all 0.15s',
                textDecoration: 'none',
                whiteSpace: 'nowrap', overflow: 'hidden',
              })}
              title={collapsed ? item.label : ''}
            >
              <span style={{ fontSize: 16, flexShrink: 0, width: 20, textAlign: 'center' }}>{item.icon}</span>
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px', borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--accent-soft)', border: '2px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, flexShrink: 0,
            }}>{user?.avatar || '👤'}</div>
            {!collapsed && (
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {user?.role}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', borderRadius: 'var(--radius-md)',
              background: 'none', border: 'none', color: 'var(--text-muted)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.15s', marginTop: 2,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-soft)'; e.currentTarget.style.color = 'var(--red)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            title="Sign out"
          >
            <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>↩</span>
            {!collapsed && 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          height: 64, borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', background: 'var(--bg-surface)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => setCollapsed(c => !c)}
              style={{
                background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '6px 10px',
                color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >☰</button>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>
              {pageTitle}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              padding: '4px 12px', borderRadius: 'var(--radius-sm)',
              background: 'var(--green-soft)', color: 'var(--green)',
              fontSize: 12, fontWeight: 600,
            }}>● Live</span>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 28 }} className="page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
