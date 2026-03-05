// src/layouts/DashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Topics', href: '/topics', icon: BookOpen },
    { name: 'Study Rooms', href: '/rooms', icon: Users },
    { name: 'Notes', href: '/notes', icon: FileText },
    { name: 'Sessions', href: '/sessions', icon: Mic },
    { name: 'Progress', href: '/progress', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-cream dark:bg-background">
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
        animate={window.innerWidth < 1024 ? { x: sidebarOpen ? 0 : '-100%' } : { x: 0 }}
        className="fixed top-0 left-0 z-50 h-screen w-64 bg-paper dark:bg-card border-r border-border lg:translate-x-0 transition-transform"
      >
        {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-border">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png.png" 
                alt="T.Learn Logo" 
                className="w-8 h-8 rounded-lg p-0 shadow-sm justify-center items-center"
              />
              <span className="font-DM Mono, monospace text-2xl font-semibold text-forest dark:text-foreground">
                T.Learn
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-DM Mono, monospace, font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-forest/10 to-forest-light/10 text-forest dark:from-primary/20 dark:to-primary/20 dark:text-primary'
                    : 'text-text-medium hover:bg-muted hover:text-forest dark:hover:text-foreground'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-border p-4">
          <NavLink
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-text-medium hover:bg-muted hover:text-forest dark:hover:text-foreground transition-all"
          >
            <Settings className="w-5 h-5" />
            Settings
          </NavLink>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 h-16 bg-paper/80 dark:bg-card/80 backdrop-blur-xl border-b border-border">
          <div className="h-full px-6 flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-muted rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Search Bar */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted rounded-xl w-80">
                <Search className="w-4 h-4 text-text-light" />
                <input
                  type="text"
                  placeholder="Search topics, notes, rooms..."
                  className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-text-light"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-sand" />
                ) : (
                  <Moon className="w-5 h-5 text-text-medium" />
                )}
              </button>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-muted rounded-lg">
                <Bell className="w-5 h-5 text-text-medium" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-3 p-2 hover:bg-muted rounded-xl transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-forest to-forest-light text-white">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-text-dark dark:text-foreground">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-text-light">
                      {user?.email || 'user@email.com'}
                    </p>
                  </div>
                  <ChevronDown className="hidden md:block w-4 h-4 text-text-light" />
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
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;