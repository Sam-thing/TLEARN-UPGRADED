// src/layouts/AuthLayout.jsx
import { Outlet, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Mic, TrendingUp, Award } from 'lucide-react';

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[oklch(0.986_0.002_240)] dark:bg-[oklch(0.11_0.008_255)]">

      {/* ── LEFT — Brand Panel ── */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-[oklch(0.14_0.012_255)] dark:bg-[oklch(0.09_0.010_255)]">

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(oklch(1_0_0) 1px, transparent 1px),
              linear-gradient(90deg, oklch(1_0_0) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Ambient glow */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] rounded-full bg-[oklch(0.62_0.17_158/12%)] blur-[100px] pointer-events-none" />
        <div className="absolute top-20 right-0 w-[300px] h-[300px] rounded-full bg-[oklch(0.80_0.17_72/6%)] blur-[80px] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group w-fit">
            <div className="w-9 h-9 rounded-lg bg-[oklch(0.62_0.17_158)] flex items-center justify-center shadow-[0_0_16px_oklch(0.62_0.17_158/40%)]">
              <span
                className="text-white font-bold text-lg"
                style={{ fontFamily: 'Cabinet Grotesk, DM Sans, sans-serif' }}
              >
                T
              </span>
            </div>
            <span
              className="font-bold text-xl text-white"
              style={{ fontFamily: 'Cabinet Grotesk, DM Sans, sans-serif', letterSpacing: '-0.02em' }}
            >
              T.Learn
            </span>
          </Link>

          {/* Headline */}
          <div className="mt-16 mb-12">
            <div
              className="text-xs font-semibold text-[oklch(0.62_0.17_158)] uppercase tracking-[0.15em] mb-5"
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              — The Vault
            </div>
            <h1
              className="font-black leading-[1.04] tracking-[-0.04em] text-white mb-5"
              style={{
                fontFamily: 'Cabinet Grotesk, DM Sans, sans-serif',
                fontSize: 'clamp(2.5rem, 4vw, 3.5rem)'
              }}
            >
              Learn by{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, oklch(0.62 0.17 158), oklch(0.72 0.14 168))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                teaching.
              </span>
            </h1>
            <p className="text-base text-[oklch(0.70_0.008_255)] leading-relaxed max-w-sm">
              The fastest way to actually understand what you study. Explain it. Get scored. Master it.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              { icon: Mic,       text: 'Teach out loud — AI listens & scores in real-time' },
              { icon: TrendingUp, text: 'Track mastery across every topic you study' },
              { icon: BookOpen,  text: 'AI-generated prep notes from your syllabus' },
              { icon: Award,     text: 'Compete, collaborate, and grow with peers' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-[oklch(0.62_0.17_158/15%)] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-[oklch(0.62_0.17_158)]" />
                </div>
                <span className="text-sm text-[oklch(0.65_0.008_255)]">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4 pt-8 border-t border-[oklch(1_0_0/8%)]">
          {[
            { value: '10k+', label: 'Members' },
            { value: '92%', label: 'Pass rate' },
            { value: '50k+', label: 'Sessions' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div
                className="font-black text-2xl text-white tracking-[-0.03em]"
                style={{ fontFamily: 'Cabinet Grotesk, DM Sans, sans-serif' }}
              >
                {value}
              </div>
              <div className="text-xs text-[oklch(0.55_0.008_255)] mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT — Form Panel ── */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-12">

        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-[oklch(0.62_0.17_158)] flex items-center justify-center">
            <span className="text-white font-bold" style={{ fontFamily: 'Cabinet Grotesk, DM Sans, sans-serif' }}>T</span>
          </div>
          <span className="font-bold text-lg text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)]" style={{ fontFamily: 'Cabinet Grotesk, DM Sans, sans-serif' }}>
            T.Learn
          </span>
        </Link>

        {/* Form container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;