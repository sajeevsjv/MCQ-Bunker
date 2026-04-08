import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, History, LogOut, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Results & History', path: '/results', icon: History },
  ];

  // We don't want to show the sidebar if we are actually taking an exam
  // to maximize focus. We can check the path for this.
  const isExamRoute = location.pathname.includes('/exam/');

  if (isExamRoute) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 text-indigo-600">
            <div className="bg-indigo-100 p-2 rounded-xl">
              <BookOpen size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">MCQ Bunker</h1>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                  isActive 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon size={18} className={cn(
                  isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="mb-4 px-4 py-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 font-medium tracking-wider uppercase mb-1">Signed in as</p>
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user?.email || 'Student'}
            </p>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl transition-colors duration-200 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-indigo-600">
            <BookOpen size={20} />
            <h1 className="text-lg font-bold">MCQ Bunker</h1>
          </div>
          <button onClick={logout} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <LogOut size={20} />
          </button>
        </header>

        {/* Page Content with Transitions */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-8 lg:p-12 w-full max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
