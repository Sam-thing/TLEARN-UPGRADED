// src/pages/auth/RegisterPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, MoveRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(
      formData.name,
      formData.email,
      formData.password
    );

    if (result.success) {
      toast.success('Welcome to T.Learn!');
    } else {
      toast.error(result.error || 'Registration failed');
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
          — Join the vault
        </div>
        <h1
          className="font-black tracking-[-0.035em] text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)] mb-2"
          style={{ fontFamily: 'Cabinet Grotesk, DM Sans, sans-serif', fontSize: '2rem' }}
        >
          Create your account.
        </h1>
        <p className="text-sm text-[oklch(0.52_0.008_255)] dark:text-[oklch(0.58_0.008_255)]">
          Join 10,000+ learners who teach to understand.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-[oklch(0.36_0.010_255)] dark:text-[oklch(0.65_0.008_255)] mb-1.5"
          >
            Full name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.72_0.005_255)]" />
            <input
              id="name"
              type="text"
              placeholder="Brian Kamau"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-md border border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/9%)] bg-white dark:bg-[oklch(0.16_0.008_255)] text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)] placeholder-[oklch(0.72_0.005_255)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.62_0.17_158/40%)] focus:border-[oklch(0.62_0.17_158)] transition-all"
            />
          </div>
        </div>

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
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[oklch(0.36_0.010_255)] dark:text-[oklch(0.65_0.008_255)] mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.72_0.005_255)]" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 6 characters"
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

        {/* Confirm password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-[oklch(0.36_0.010_255)] dark:text-[oklch(0.65_0.008_255)] mb-1.5"
          >
            Confirm password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.72_0.005_255)]" />
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-md border bg-white dark:bg-[oklch(0.16_0.008_255)] text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)] placeholder-[oklch(0.72_0.005_255)] focus:outline-none focus:ring-2 transition-all ${
                formData.confirmPassword && formData.password !== formData.confirmPassword
                  ? 'border-[oklch(0.60_0.22_25)] focus:ring-[oklch(0.60_0.22_25/40%)] focus:border-[oklch(0.60_0.22_25)]'
                  : formData.confirmPassword && formData.password === formData.confirmPassword
                  ? 'border-[oklch(0.62_0.17_158)] focus:ring-[oklch(0.62_0.17_158/40%)]'
                  : 'border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/9%)] focus:ring-[oklch(0.62_0.17_158/40%)] focus:border-[oklch(0.62_0.17_158)]'
              }`}
            />
          </div>
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="mt-1 text-xs text-[oklch(0.60_0.22_25)]">Passwords don't match</p>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2">
          <input
            id="terms"
            type="checkbox"
            required
            className="w-4 h-4 mt-0.5 rounded border-[oklch(0.91_0.004_240)] accent-[oklch(0.62_0.17_158)]"
          />
          <label htmlFor="terms" className="text-xs text-[oklch(0.52_0.008_255)] leading-relaxed">
            I agree to the{' '}
            <Link to="/terms" className="text-[oklch(0.62_0.17_158)] hover:underline">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-[oklch(0.62_0.17_158)] hover:underline">Privacy Policy</Link>
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
              Create account
              <MoveRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Sign in link */}
      <p className="mt-6 text-center text-sm text-[oklch(0.52_0.008_255)]">
        Already a member?{' '}
        <Link
          to="/login"
          className="font-semibold text-[oklch(0.62_0.17_158)] hover:text-[oklch(0.50_0.17_158)] transition-colors"
        >
          Sign in →
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;