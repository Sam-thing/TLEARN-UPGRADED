// src/layouts/DashboardLayout.jsx
import React, { useState, useEffect, useRef } from 'react';
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
  GraduationCap,
  Bell,
  Search,
  Moon,
  Calendar,
  Brain,
  Sun,
  User,
  ChevronDown,
  Loader2
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
import { topicService } from '@/services/topicService';
import { notesService } from '@/services/notesService';
import { sessionService } from '@/services/sessionService';
import { examService } from '@/services/examService';
import { flashcardService } from '@/services/flashcardService';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://tlearnapp.onrender.com';

// Resolve avatar URL — handles both relative (/uploaded/…) and absolute URLs
const resolveAvatar = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${SERVER_URL}${url}`;
};

const DashboardLayout = () => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  // ── Search state ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const navigation = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.topics'), href: '/topics', icon: BookOpen },
    { name: t('nav.sessions'), href: '/sessions', icon: Mic },
    { name: t('nav.studyRooms'), href: '/rooms', icon: Users },
    { name: t('nav.notes'), href: '/notes', icon: FileText },
    { name: t('nav.exams'), href: '/exams', icon: GraduationCap },
    { name: t('nav.flashcards'), href: '/flashcards', icon: Brain },
    { name: t('nav.calendar'), href: '/calendar', icon: Calendar },
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

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Global search across topics, notes, sessions, exams, flashcards ────────
  const runSearch = async (query) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const [topicsData, notesData, sessionsData, examsData, flashcardsData] = await Promise.all([
        topicService.getAll().catch(() => []),
        notesService.getAll().catch(() => []),
        sessionService.getAll().catch(() => []),
        examService.getAll().catch(() => ({ exams: [] })),
        flashcardService.getAll().catch(() => ({ flashcards: [] })),
      ]);

      const topics = Array.isArray(topicsData) ? topicsData : (topicsData?.topics || []);
      const notes = Array.isArray(notesData) ? notesData : (notesData?.notes || []);
      const sessions = Array.isArray(sessionsData) ? sessionsData : (sessionsData?.sessions || []);
      const exams = examsData?.exams || (Array.isArray(examsData) ? examsData : []);
      const flashcards = flashcardsData?.flashcards || (Array.isArray(flashcardsData) ? flashcardsData : []);

      const results = [];

      topics.forEach((topic) => {
        if (
          topic.name?.toLowerCase().includes(q) ||
          topic.description?.toLowerCase().includes(q) ||
          topic.subject?.toLowerCase().includes(q)
        ) {
          results.push({
            id: topic._id,
            type: 'Topic',
            title: topic.name,
            subtitle: topic.subject,
            icon: BookOpen,
            onClick: () => navigate(`/topics/${topic._id}`),
          });
        }
      });

      notes.forEach((note) => {
        if (
          note.title?.toLowerCase().includes(q) ||
          note.content?.toLowerCase().includes(q)
        ) {
          results.push({
            id: note._id,
            type: 'Note',
            title: note.title,
            subtitle: note.tags?.join(', ') || 'Note',
            icon: FileText,
            onClick: () => navigate('/notes'),
          });
        }
      });

      sessions.forEach((session) => {
        const topicName = session.topic?.name || '';
        if (topicName.toLowerCase().includes(q)) {
          results.push({
            id: session._id,
            type: 'Session',
            title: topicName,
            subtitle: `Score: ${session.feedback?.score ?? 0}%`,
            icon: Mic,
            onClick: () => navigate(`/sessions/${session._id}`),
          });
        }
      });

      exams.forEach((exam) => {
        if (
          exam.title?.toLowerCase().includes(q) ||
          exam.description?.toLowerCase().includes(q)
        ) {
          results.push({
            id: exam._id,
            type: 'Exam',
            title: exam.title,
            subtitle: exam.status,
            icon: GraduationCap,
            onClick: () => {
              const isCompleted = exam.status === 'graded' || exam.status === 'completed';
              navigate(isCompleted ? `/exams/${exam._id}/results` : `/exams/${exam._id}/take`);
            },
          });
        }
      });

      flashcards.forEach((card) => {
        if (
          card.front?.toLowerCase().includes(q) ||
          card.back?.toLowerCase().includes(q)
        ) {
          results.push({
            id: card._id,
            type: 'Flashcard',
            title: card.front,
            subtitle: card.topic?.name || 'Flashcard',
            icon: Brain,
            onClick: () => navigate('/flashcards'),
          });
        }
      });

      setSearchResults(results.slice(0, 15));
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSearchOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(value);
    }, 350);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    runSearch(searchQuery);
    setSearchOpen(true);
  };

  const handleResultClick = (result) => {
    result.onClick();
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const avatarSrc = resolveAvatar(user?.avatar);

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
            <div className="w-8 h-8 bg-gradient-to-br from-[oklch(0.62_0.17_158)] to-[oklch(0.55_0.17_158)] rounded-lg flex items-center justify-center shadow-lg overflow-hidden">
              <img src="/logo.png.png" alt="T.Learn Logo" className="w-5 h-5" />
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
              <div ref={searchRef} className="relative hidden md:block w-80">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center gap-2 px-4 py-2 bg-[oklch(0.96_0.004_240)] dark:bg-[oklch(0.20_0.008_255)] rounded-lg border border-transparent focus-within:border-[oklch(0.62_0.17_158/40%)] transition-colors"
                >
                  <button type="submit" className="flex-shrink-0">
                    {searchLoading ? (
                      <Loader2 className="w-4 h-4 text-[oklch(0.56_0.008_255)] animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 text-[oklch(0.56_0.008_255)]" />
                    )}
                  </button>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setSearchOpen(true)}
                    placeholder="Search topics, notes, sessions, exams..."
                    className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-[oklch(0.72_0.005_255)]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-[oklch(0.56_0.008_255)]" />
                    </button>
                  )}
                </form>

                {/* Results dropdown */}
                <AnimatePresence>
                  {searchOpen && searchQuery.trim() && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-[oklch(0.16_0.008_255)] border border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/9%)] rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
                    >
                      {searchLoading ? (
                        <div className="p-4 text-center text-sm text-[oklch(0.56_0.008_255)]">
                          loading.....
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="py-2">
                          {searchResults.map((result, i) => (
                            <button
                              key={`${result.type}-${result.id}-${i}`}
                              onClick={() => handleResultClick(result)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[oklch(0.96_0.004_240)] dark:hover:bg-[oklch(0.20_0.008_255)] transition-colors text-left"
                            >
                              <div className="w-8 h-8 rounded-lg bg-[oklch(0.62_0.17_158/10%)] dark:bg-[oklch(0.62_0.17_158/15%)] flex items-center justify-center flex-shrink-0">
                                <result.icon className="w-4 h-4 text-[oklch(0.62_0.17_158)]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)] truncate">
                                  {result.title}
                                </p>
                                <p className="text-xs text-[oklch(0.56_0.008_255)] truncate">
                                  {result.type} · {result.subtitle}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-sm text-[oklch(0.56_0.008_255)]">
                          No results found for "{searchQuery}"
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
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

              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-3 p-2 hover:bg-[oklch(0.96_0.004_240)] dark:hover:bg-[oklch(0.20_0.008_255)] rounded-lg transition-colors">
                  <Avatar className="w-8 h-8 border border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/9%)]">
                    <AvatarImage src={avatarSrc} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-[oklch(0.62_0.17_158)] to-[oklch(0.55_0.17_158)] text-white font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
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