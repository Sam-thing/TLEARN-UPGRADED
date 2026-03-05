// src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, MoveRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success('Welcome back!');
    } else {
      toast.error(result.error || 'Invalid credentials');
    }

    setLoading(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div
          className="text-xs font-semibold text-[oklch(0.62_0.17_158)] uppercase tracking-[0.15em] mb-3"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          — Member access
        </div>
        <h1
          className="font-black tracking-[-0.035em] text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)] mb-2"
          style={{ fontFamily: 'Cabinet Grotesk, DM Sans, sans-serif', fontSize: '2rem' }}
        >
          Welcome back.
        </h1>
        <p className="text-sm text-[oklch(0.52_0.008_255)] dark:text-[oklch(0.58_0.008_255)]">
          Sign in to continue your learning session.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[oklch(0.36_0.010_255)] dark:text-[oklch(0.65_0.008_255)] mb-1.5"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.72_0.005_255)]" />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-md border border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/9%)] bg-white dark:bg-[oklch(0.16_0.008_255)] text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)] placeholder-[oklch(0.72_0.005_255)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.62_0.17_158/40%)] focus:border-[oklch(0.62_0.17_158)] transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[oklch(0.36_0.010_255)] dark:text-[oklch(0.65_0.008_255)]"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-[oklch(0.62_0.17_158)] hover:text-[oklch(0.50_0.17_158)] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.72_0.005_255)]" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full pl-9 pr-10 py-2.5 text-sm rounded-md border border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/9%)] bg-white dark:bg-[oklch(0.16_0.008_255)] text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)] placeholder-[oklch(0.72_0.005_255)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.62_0.17_158/40%)] focus:border-[oklch(0.62_0.17_158)] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.72_0.005_255)] hover:text-[oklch(0.52_0.008_255)] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            className="w-4 h-4 rounded border-[oklch(0.91_0.004_240)] accent-[oklch(0.62_0.17_158)]"
          />
          <label htmlFor="remember" className="text-sm text-[oklch(0.52_0.008_255)]">
            Remember me for 30 days
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="group w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-[oklch(0.62_0.17_158)] hover:bg-[oklch(0.55_0.17_158)] text-white font-semibold text-sm transition-all hover:shadow-[0_0_20px_oklch(0.62_0.17_158/35%)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ fontFamily: 'Cabinet Grotesk, DM Sans, sans-serif' }}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Sign in
              <MoveRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-[oklch(0.91_0.004_240)] dark:bg-[oklch(1_0_0/9%)]" />
        <span className="text-xs text-[oklch(0.72_0.005_255)]" style={{ fontFamily: 'DM Mono, monospace' }}>
          or
        </span>
        <div className="flex-1 h-px bg-[oklch(0.91_0.004_240)] dark:bg-[oklch(1_0_0/9%)]" />
      </div>

      {/* Sign up link */}
      <p className="text-center text-sm text-[oklch(0.52_0.008_255)]">
        New to T.Learn?{' '}
        <Link
          to="/register"
          className="font-semibold text-[oklch(0.62_0.17_158)] hover:text-[oklch(0.50_0.17_158)] transition-colors"
        >
          Request access →
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;