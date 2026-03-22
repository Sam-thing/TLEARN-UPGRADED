// src/layouts/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import NotificationBell from '@/components/NotificationBell';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
  LayoutDashboard,
  BookOpen,
  Mic,
  Users,
  FileText,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Moon,
  Sun,
  User,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DashboardLayout = () => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const navigation = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.topics'), href: '/topics', icon: BookOpen },
    { name: t('nav.studyRooms'), href: '/rooms', icon: Users },
    { name: t('nav.notes'), href: '/notes', icon: FileText },
    { name: t('nav.sessions'), href: '/sessions', icon: Mic },
    { name: t('nav.progress'), href: '/progress', icon: TrendingUp },
  ];

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Auto-close sidebar when switching to desktop
      if (!mobile) {
        setSidebarOpen(false);
      }
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[oklch(0.986_0.002_240)] dark:bg-[oklch(0.11_0.008_255)]">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={isMobile ? { x: sidebarOpen ? 0 : '-100%' } : { x: 0 }}
        className="fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-[oklch(0.13_0.008_255)] border-r border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/9%)] lg:translate-x-0 transition-transform"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/9%)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-[oklch(0.62_0.17_158)] to-[oklch(0.55_0.17_158)] rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>T</span>
            </div>
            <span className="DM Mono, monospace text-lg text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)]" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              T.Learn
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-[oklch(0.96_0.004_240)] dark:hover:bg-[oklch(0.20_0.008_255)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all text-sm ${
                  isActive
                    ? 'bg-[oklch(0.62_0.17_158/10%)] dark:bg-[oklch(0.62_0.17_158/15%)] text-[oklch(0.62_0.17_158)] dark:text-[oklch(0.68_0.17_158)]'
                    : 'text-[oklch(0.36_0.010_255)] dark:text-[oklch(0.60_0.008_255)] hover:bg-[oklch(0.96_0.004_240)] dark:hover:bg-[oklch(0.20_0.008_255)] hover:text-[oklch(0.14_0.012_255)] dark:hover:text-[oklch(0.96_0.004_240)]'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/9%)] p-3">
          <NavLink
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm text-[oklch(0.36_0.010_255)] dark:text-[oklch(0.60_0.008_255)] hover:bg-[oklch(0.96_0.004_240)] dark:hover:bg-[oklch(0.20_0.008_255)] hover:text-[oklch(0.14_0.012_255)] dark:hover:text-[oklch(0.96_0.004_240)] transition-all"
          >
            <Settings className="w-5 h-5" />
            {t('nav.settings')}
          </NavLink>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[oklch(0.13_0.008_255/0.92)] backdrop-blur-xl border-b border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/9%)]">
          <div className="h-full px-6 flex items-center justify-between max-w-[1800px] mx-auto">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-[oklch(0.96_0.004_240)] dark:hover:bg-[oklch(0.20_0.008_255)] rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Search Bar */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[oklch(0.96_0.004_240)] dark:bg-[oklch(0.20_0.008_255)] rounded-lg w-80 border border-transparent focus-within:border-[oklch(0.62_0.17_158/40%)] transition-colors">
                <Search className="w-4 h-4 text-[oklch(0.56_0.008_255)]" />
                <input
                  type="text"
                  placeholder="Search topics, notes, rooms..."
                  className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-[oklch(0.72_0.005_255)]"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-[oklch(0.96_0.004_240)] dark:hover:bg-[oklch(0.20_0.008_255)] rounded-lg transition-colors"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-[oklch(0.80_0.17_72)]" />
                ) : (
                  <Moon className="w-5 h-5 text-[oklch(0.36_0.010_255)]" />
                )}
              </button>

              {/* ADD LANGUAGE SWITCHER HERE! */}
              <LanguageSwitcher />

              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-3 p-2 hover:bg-[oklch(0.96_0.004_240)] dark:hover:bg-[oklch(0.20_0.008_255)] rounded-lg transition-colors">
                  <Avatar className="w-8 h-8 border border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/9%)]">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-[oklch(0.62_0.17_158)] to-[oklch(0.55_0.17_158)] text-white font-semibold">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)]">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-[oklch(0.56_0.008_255)]">
                      {user?.email || 'user@email.com'}
                    </p>
                  </div>
                  <ChevronDown className="hidden md:block w-4 h-4 text-[oklch(0.56_0.008_255)]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-[oklch(0.60_0.22_25)]">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content - Centered with max width */}
        <main className="p-6 max-w-[1600px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;