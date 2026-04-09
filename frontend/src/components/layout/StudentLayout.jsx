import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  BookOpen, History, LogOut, LayoutDashboard,
  Menu, X, Sun, Moon, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Results & History', path: '/results', icon: History },
];

/* ── Theme Toggle Button ─────────────────────────────────────── */
const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="theme-toggle"
      title={isDark ? 'Switch to Light' : 'Switch to Dark'}
    >
      <span className={`theme-toggle-thumb ${isDark ? 'dark-mode' : ''}`}>
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
};

/* ── Sidebar Content ─────────────────────────────────────────── */
const SidebarContent = ({ user, logout, onNavClick }) => {
  const location = useLocation();

  return (
    <>
      {/* Brand */}
      <div style={{ padding: '24px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="logo-icon">
            <BookOpen size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              margin: 0,
            }}>MCQ Bunker</h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--brand-400)', margin: 0, fontWeight: 500 }}>
              Student Portal
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0 16px 12px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(({ name, path, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              onClick={onNavClick}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{name}</span>
              {isActive && <ChevronRight size={14} style={{ opacity: 0.7 }} />}
            </NavLink>
          );
        })}
      </nav>

      {/* User card + logout */}
      <div style={{ padding: '12px 12px 20px' }}>
        <div style={{
          padding: '12px 14px',
          borderRadius: 14,
          background: 'var(--bg-muted)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 8,
        }}>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 2px' }}>
            Signed in as
          </p>
          <p style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {user?.email || 'Student'}
          </p>
        </div>

        <button
          onClick={logout}
          className="btn-outline-danger"
          style={{ padding: '10px 14px', fontSize: '0.82rem' }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  );
};

/* ── Main Layout ─────────────────────────────────────────────── */
const StudentLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  // Exam route — full-screen, no chrome
  if (location.pathname.includes('/exam/')) {
    return <Outlet />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* ── Animated mesh background ── */}
      <div className="bg-mesh" />

      {/* ══ SIDEBAR — Desktop (always visible) ═══════════════════ */}
      <aside
        className="sidebar"
        style={{ display: 'flex' }}
        // desktop: remove transform via CSS media query in index.css
      >
        <SidebarContent user={user} logout={logout} onNavClick={() => setSidebarOpen(false)} />
      </aside>

      {/* ══ MOBILE SIDEBAR + OVERLAY ══════════════════════════════ */}
      {/* We use a separate element stack for mobile so it can be hidden/shown */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="sidebar-overlay"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed',
                top: 0, left: 0, bottom: 0,
                width: 'var(--sidebar-w)',
                background: 'var(--gradient-sidebar)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                borderRight: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  position: 'absolute',
                  top: 16, right: 16,
                  padding: 8,
                  borderRadius: 10,
                  background: 'var(--bg-muted)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                }}
              >
                <X size={18} />
              </button>
              <SidebarContent user={user} logout={logout} onNavClick={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ══ MAIN CONTENT ══════════════════════════════════════════ */}
      <div id="__main-wrapper" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}>
        {/* ── Top bar ─────────────────────────────────────────── */}
        <header className="topbar">
          {/* Mobile: hamburger | Desktop: page title hint */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Hamburger — only on mobile */}
            <button
              id="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 5,
                padding: '8px',
                borderRadius: 10,
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-muted)',
                cursor: 'pointer',
                width: 40, height: 40,
              }}
              className="md-hidden"
            >
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
            </button>

            {/* Logo — mobile only */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="md-hidden">
              <div className="logo-icon" style={{ width: 30, height: 30, borderRadius: 8 }}>
                <BookOpen size={16} color="#fff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                MCQ Bunker
              </span>
            </div>
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ThemeToggle />
          </div>
        </header>

        {/* ── Page content ─────────────────────────────────────── */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{
                maxWidth: 1280,
                margin: '0 auto',
                padding: 'clamp(20px, 4vw, 48px)',
              }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global styles for layout responsiveness */}
      <style>{`
        /* Desktop: sidebar is fixed & visible, push main content */
        @media (min-width: 768px) {
          .sidebar { display: flex !important; }
          .md-hidden { display: none !important; }
          /* push main content right of sidebar */
          .sidebar ~ div, .sidebar ~ * {
            /* handled via parent flex, sidebar is fixed so we need margin */
          }
        }
        @media (max-width: 767px) {
          /* hide the static desktop sidebar on mobile */
          .sidebar { display: none !important; }
        }

        /* Make the main content area account for the fixed sidebar on desktop */
        @media (min-width: 768px) {
          #__main-wrapper {
            margin-left: var(--sidebar-w);
          }
        }
      `}</style>
    </div>
  );
};

export default StudentLayout;
