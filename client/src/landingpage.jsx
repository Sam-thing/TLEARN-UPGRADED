// src/pages/LandingPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Mic, Users, TrendingUp, Zap, BookOpen,
  Brain, Menu, X, Check, ChevronRight, MoveRight, Star
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[oklch(0.986_0.002_240)] dark:bg-[oklch(0.11_0.008_255)] overflow-x-hidden">
      <Nav scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} navigate={navigate} />
      <Hero navigate={navigate} />
      <Ticker />
      <Features />
      <HowItWorks />
      <SocialProof />
      <FinalCTA navigate={navigate} />
      <Footer />
    </div>
  );
};

/* ── NAV ── */
const Nav = ({ scrolled, menuOpen, setMenuOpen, navigate }) => (
  <motion.header
    initial={{ y: -80, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/90 dark:bg-[oklch(0.13_0.008_255/0.92)] backdrop-blur-lg border-b border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/8%)] shadow-sm'
        : ''
    }`}
  >
    <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="w-8 h-8 rounded-lg bg-[oklch(0.62_0.17_158)] flex items-center justify-center shadow-sm group-hover:shadow-[0_0_16px_oklch(0.62_0.17_158/40%)] transition-shadow">
          <span className="text-white font-bold text-base" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>T</span>
        </div>
        <span className="font-bold text-lg text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)] tracking-tight" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
          T.Learn
        </span>
      </Link>

      {/* Desktop links */}
      <nav className="hidden md:flex items-center gap-8">
        {['Features', 'How It Works', 'Community'].map(link => (
          <a
            key={link}
            href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
            className="text-sm font-medium text-[oklch(0.36_0.010_255)] dark:text-[oklch(0.60_0.008_255)] hover:text-[oklch(0.62_0.17_158)] dark:hover:text-[oklch(0.68_0.17_158)] transition-colors"
          >
            {link}
          </a>
        ))}
      </nav>

      {/* CTA */}
      <div className="hidden md:flex items-center gap-3">
        <button
          onClick={() => navigate('/login')}
          className="text-sm font-medium text-[oklch(0.36_0.010_255)] dark:text-[oklch(0.60_0.008_255)] hover:text-[oklch(0.14_0.012_255)] dark:hover:text-white transition-colors px-3 py-2"
        >
          Sign in
        </button>
        <button
          onClick={() => navigate('/register')}
          className="flex items-center gap-2 text-sm font-semibold text-white bg-[oklch(0.62_0.17_158)] hover:bg-[oklch(0.55_0.17_158)] px-4 py-2 rounded-md transition-all hover:shadow-[0_0_20px_oklch(0.62_0.17_158/35%)] active:scale-95"
        >
          Get access <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mobile menu button */}
      <button
        className="md:hidden p-2 text-[oklch(0.36_0.010_255)]"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
    </div>

    {/* Mobile drawer */}
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-[oklch(0.91_0.004_240)] bg-white dark:bg-[oklch(0.13_0.008_255)] px-6 pb-6 pt-4 space-y-4"
        >
          {['Features', 'How It Works', 'Community'].map(link => (
            <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
              className="block text-sm font-medium text-[oklch(0.36_0.010_255)]"
              onClick={() => setMenuOpen(false)}
            >
              {link}
            </a>
          ))}
          <button
            onClick={() => navigate('/register')}
            className="w-full text-sm font-semibold text-white bg-[oklch(0.62_0.17_158)] px-4 py-2.5 rounded-md"
          >
            Get access
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.header>
);

/* ── HERO ── */
const Hero = ({ navigate }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 400], [0, 60]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 pb-20 overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.14_0.012_255) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.14_0.012_255) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
      />

      {/* Ambient glow */}
      <motion.div
        style={{ y }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[oklch(0.62_0.17_158/12%)] dark:bg-[oklch(0.62_0.17_158/8%)] blur-[100px] pointer-events-none"
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Members badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-[oklch(0.62_0.17_158/10%)] dark:bg-[oklch(0.62_0.17_158/15%)] border border-[oklch(0.62_0.17_158/25%)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.62_0.17_158)] animate-pulse" />
          <span className="text-sm font-medium text-[oklch(0.62_0.17_158)] dark:text-[oklch(0.68_0.17_158)]" style={{ fontFamily: 'DM Mono, monospace' }}>
            10,000+ learners — members only
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-bold leading-[1.05] tracking-[-0.04em] mb-6"
          style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontSize: 'clamp(3rem, 8vw, 6rem)' }}
        >
          <span className="text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)]">
            The fastest way to
          </span>
          <br />
          <span className="text-gradient">actually understand</span>
          <br />
          <span className="text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)]">
            what you study.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl leading-relaxed text-[oklch(0.36_0.010_255)] dark:text-[oklch(0.60_0.008_255)] max-w-2xl mx-auto mb-10"
        >
          Teach it out loud. Get instant AI feedback. Master it for life.
          <br className="hidden md:block" />
          T.Learn turns passive studying into active understanding.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={() => navigate('/register')}
            className="group flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[oklch(0.62_0.17_158)] hover:bg-[oklch(0.55_0.17_158)] text-white font-semibold rounded-md transition-all hover:shadow-[0_0_28px_oklch(0.62_0.17_158/40%)] active:scale-[0.98]"
          >
            Start learning free
            <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-2 px-7 py-3.5 border border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/10%)] text-[oklch(0.36_0.010_255)] dark:text-[oklch(0.60_0.008_255)] font-semibold rounded-md hover:border-[oklch(0.62_0.17_158/50%)] hover:text-[oklch(0.62_0.17_158)] transition-all"
          >
            Sign in
          </button>
        </motion.div>

        {/* Trust row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-[oklch(0.56_0.008_255)]"
        >
          {['Free to start', 'No credit card', '92% success rate'].map((item, i) => (
            <span key={item} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[oklch(0.62_0.17_158)]" />
              {item}
            </span>
          ))}
        </motion.div>

        {/* Hero card mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 relative max-w-3xl mx-auto"
        >
          {/* Main card */}
          <div className="rounded-xl border border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/9%)] bg-white dark:bg-[oklch(0.15_0.008_255)] shadow-[0_24px_80px_oklch(0_0_0/10%)] dark:shadow-[0_24px_80px_oklch(0_0_0/40%)] overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/8%)]">
              <div className="w-3 h-3 rounded-full bg-[oklch(0.85_0.005_240)] dark:bg-[oklch(0.25_0.008_255)]" />
              <div className="w-3 h-3 rounded-full bg-[oklch(0.85_0.005_240)] dark:bg-[oklch(0.25_0.008_255)]" />
              <div className="w-3 h-3 rounded-full bg-[oklch(0.85_0.005_240)] dark:bg-[oklch(0.25_0.008_255)]" />
              <div className="flex-1 mx-4 h-6 rounded-md bg-[oklch(0.96_0.004_240)] dark:bg-[oklch(0.20_0.008_255)] flex items-center justify-center">
                <span className="text-xs text-[oklch(0.56_0.008_255)]" style={{ fontFamily: 'DM Mono, monospace' }}>
                  tlearn.app/teach/osi-model
                </span>
              </div>
            </div>

            {/* Mock teaching interface */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-[oklch(0.56_0.008_255)] uppercase tracking-widest mb-1">
                    Current Topic
                  </div>
                  <div className="font-bold text-xl text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)]" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                    OSI Model — 7 Layers
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/50 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">Recording</span>
                </div>
              </div>

              {/* Transcript */}
              <div className="p-4 rounded-lg bg-[oklch(0.96_0.004_240)] dark:bg-[oklch(0.11_0.008_255)] text-sm text-[oklch(0.36_0.010_255)] dark:text-[oklch(0.60_0.008_255)] leading-relaxed min-h-[80px]">
                "The OSI model has seven layers. Starting from the bottom, the physical layer handles actual transmission of raw bits over a physical medium. Above that, the data link layer is responsible for..."
                <span className="inline-block w-0.5 h-4 bg-[oklch(0.62_0.17_158)] ml-1 animate-pulse align-middle" />
              </div>

              {/* Score bars */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Accuracy', value: 88 },
                  { label: 'Clarity', value: 76 },
                  { label: 'Depth', value: 82 }
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[oklch(0.56_0.008_255)]">{label}</span>
                      <span className="font-semibold text-[oklch(0.62_0.17_158)]">{value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[oklch(0.91_0.004_240)] dark:bg-[oklch(0.20_0.008_255)]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full bg-[oklch(0.62_0.17_158)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating score badge */}
          <motion.div
            className="animate-float-y absolute -top-5 -right-5 bg-white dark:bg-[oklch(0.16_0.008_255)] border border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/9%)] rounded-xl px-4 py-3 shadow-lg"
          >
            <div className="text-xs text-[oklch(0.56_0.008_255)] mb-0.5">Session Score</div>
            <div className="font-bold text-2xl text-[oklch(0.62_0.17_158)]" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              88%
            </div>
          </motion.div>

          {/* Floating streak badge */}
          <motion.div
            className="animate-float-y-slow absolute -bottom-5 -left-5 bg-white dark:bg-[oklch(0.16_0.008_255)] border border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/9%)] rounded-xl px-4 py-3 shadow-lg"
          >
            <div className="text-xs text-[oklch(0.56_0.008_255)] mb-0.5">Current streak</div>
            <div className="font-bold text-2xl text-[oklch(0.80_0.17_72)]" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              🔥 14 days
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

/* ── TICKER ── */
const Ticker = () => {
  const items = [
    '92% success rate',
    'Voice teaching',
    'AI feedback in seconds',
    '50k+ sessions completed',
    'Real-time transcription',
    'Study rooms',
    'Smart prep notes',
    'Progress analytics',
  ];

  return (
    <div className="border-y border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/9%)] py-4 bg-[oklch(0.62_0.17_158/4%)] dark:bg-[oklch(0.62_0.17_158/6%)]">
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {[...items, ...items].map((item, i) => (
            <span
              key={i}
              className="mx-10 text-sm font-medium text-[oklch(0.56_0.008_255)] dark:text-[oklch(0.60_0.008_255)] flex items-center gap-3"
            >
              <span className="w-1 h-1 rounded-full bg-[oklch(0.62_0.17_158)] inline-block" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── FEATURES ── */
const Features = () => {
  const features = [
    {
      icon: Mic,
      tag: 'Core',
      title: 'Teach it out loud',
      desc: 'Record yourself explaining any topic. Our AI listens in real-time, building a live transcript as you speak.',
    },
    {
      icon: Zap,
      tag: 'AI',
      title: 'Instant deep feedback',
      desc: 'Get scored on accuracy, clarity, and depth within seconds. Know exactly what you missed and why.',
    },
    {
      icon: Brain,
      tag: 'Smart',
      title: 'AI prep notes',
      desc: 'Upload your syllabus or pick a topic. T.Learn generates targeted prep notes so you know what to cover.',
    },
    {
      icon: Users,
      tag: 'Community',
      title: 'Study rooms',
      desc: 'Auto-matched with learners at your level. Real-time chat, voice sessions, and shared progress.',
    },
    {
      icon: TrendingUp,
      tag: 'Analytics',
      title: 'Weakness radar',
      desc: 'See exactly which concepts you struggle with most. Targeted repetition built into every session.',
    },
    {
      icon: BookOpen,
      tag: 'Content',
      title: 'Smart notes vault',
      desc: 'All your AI-generated and manual notes, searchable, organized, and linked to your sessions.',
    },
  ];

  return (
    <section id="features" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="max-w-xl mb-16">
          <div className="text-xs font-semibold text-[oklch(0.62_0.17_158)] uppercase tracking-[0.15em] mb-4" style={{ fontFamily: 'DM Mono, monospace' }}>
            — Features
          </div>
          <h2
            className="font-bold leading-tight tracking-[-0.035em] text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)] mb-4"
            style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Built for people who actually want to understand.
          </h2>
          <p className="text-[oklch(0.36_0.010_255)] dark:text-[oklch(0.60_0.008_255)] text-lg leading-relaxed">
            Not just memorize. Every feature is engineered around one idea — teaching is the most powerful way to learn.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="card-vault group p-6 rounded-xl cursor-default"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-10 h-10 rounded-lg bg-[oklch(0.62_0.17_158/10%)] dark:bg-[oklch(0.62_0.17_158/15%)] flex items-center justify-center group-hover:bg-[oklch(0.62_0.17_158/20%)] transition-colors">
                  <f.icon className="w-5 h-5 text-[oklch(0.62_0.17_158)] dark:text-[oklch(0.68_0.17_158)]" />
                </div>
                <span
                  className="text-[10px] font-semibold text-[oklch(0.56_0.008_255)] uppercase tracking-widest"
                  style={{ fontFamily: 'DM Mono, monospace' }}
                >
                  {f.tag}
                </span>
              </div>
              <h3
                className="font-bold text-lg text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)] mb-2 tracking-[-0.02em]"
                style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}
              >
                {f.title}
              </h3>
              <p className="text-sm text-[oklch(0.52_0.008_255)] dark:text-[oklch(0.58_0.008_255)] leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── HOW IT WORKS ── */
const HowItWorks = () => {
  const steps = [
    {
      n: '01',
      title: 'Pick your topic',
      desc: 'Browse our library or paste your syllabus. T.Learn generates tailored prep notes in seconds.',
    },
    {
      n: '02',
      title: 'Teach out loud',
      desc: 'Hit record and explain the topic like you\'re teaching someone else. Speak freely.',
    },
    {
      n: '03',
      title: 'Get scored instantly',
      desc: 'AI scores your explanation on accuracy, clarity, depth, and highlights what you missed.',
    },
    {
      n: '04',
      title: 'Lock it in',
      desc: 'Retry weak points, review AI notes, and watch your mastery compound session over session.',
    },
  ];

  return (
    <section id="how-it-works" className="py-28 px-6 border-t border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/9%)]">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="text-xs font-semibold text-[oklch(0.62_0.17_158)] uppercase tracking-[0.15em] mb-4" style={{ fontFamily: 'DM Mono, monospace' }}>
              — How It Works
            </div>
            <h2
              className="font-bold leading-tight tracking-[-0.035em] text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)] mb-6"
              style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              Four steps to real understanding.
            </h2>
            <p className="text-[oklch(0.36_0.010_255)] dark:text-[oklch(0.60_0.008_255)] leading-relaxed mb-10">
              The Feynman Technique, supercharged. If you can't explain it simply, you don't understand it yet — and T.Learn will tell you exactly what's missing.
            </p>
            <button
              onClick={() => window.location.href = '/register'}
              className="group flex items-center gap-2 text-sm font-semibold text-[oklch(0.62_0.17_158)] dark:text-[oklch(0.68_0.17_158)] hover:gap-3 transition-all"
            >
              Try it now — it's free
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right — steps */}
          <div className="space-y-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex gap-5 p-5 rounded-xl border border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/9%)] bg-white dark:bg-[oklch(0.15_0.008_255)] hover:border-[oklch(0.62_0.17_158/40%)] transition-colors group cursor-default"
              >
                <div
                  className="flex-shrink-0 text-2xl font-black text-[oklch(0.91_0.004_240)] dark:text-[oklch(0.20_0.008_255)] group-hover:text-[oklch(0.62_0.17_158/30%)] transition-colors leading-none pt-0.5"
                  style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}
                >
                  {step.n}
                </div>
                <div>
                  <h3
                    className="font-bold text-base text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)] mb-1 tracking-[-0.02em]"
                    style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-[oklch(0.52_0.008_255)] dark:text-[oklch(0.58_0.008_255)] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── SOCIAL PROOF ── */
const SocialProof = () => {
  const stats = [
    { value: '10k+', label: 'Active members' },
    { value: '50k+', label: 'Sessions completed' },
    { value: '92%', label: 'Score improvement' },
    { value: '14 days', label: 'Avg. streak length' },
  ];

  const testimonials = [
    {
      quote: "My grades went from a C to an A in networking after just 3 weeks of teaching sessions. Nothing else came close.",
      name: "Brian K.",
      role: "Year 2 — Computer Science"
    },
    {
      quote: "I used to re-read my notes 10 times and still blank in exams. With T.Learn I explain it once and it sticks.",
      name: "Amara T.",
      role: "KCSE Candidate"
    },
    {
      quote: "The AI catches exactly what I've glossed over. It's like having a strict professor available at 2am.",
      name: "James M.",
      role: "Self-learner — Cloud & DevOps"
    },
  ];

  return (
    <section id="community" className="py-28 px-6 bg-[oklch(0.62_0.17_158/4%)] dark:bg-[oklch(0.62_0.17_158/5%)] border-y border-[oklch(0.62_0.17_158/12%)] dark:border-[oklch(0.62_0.17_158/15%)]">
      <div className="max-w-6xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <div
                className="font-black text-4xl lg:text-5xl text-gradient mb-2 tracking-[-0.04em]"
                style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}
              >
                {s.value}
              </div>
              <div className="text-sm text-[oklch(0.52_0.008_255)] dark:text-[oklch(0.58_0.008_255)]">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-vault p-6 rounded-xl"
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-[oklch(0.80_0.17_72)] text-[oklch(0.80_0.17_72)]" />
                ))}
              </div>
              <p className="text-sm text-[oklch(0.36_0.010_255)] dark:text-[oklch(0.65_0.008_255)] leading-relaxed mb-5 italic">
                "{t.quote}"
              </p>
              <div>
                <div className="font-semibold text-sm text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)]" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                  {t.name}
                </div>
                <div className="text-xs text-[oklch(0.56_0.008_255)]" style={{ fontFamily: 'DM Mono, monospace' }}>
                  {t.role}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── FINAL CTA ── */
const FinalCTA = ({ navigate }) => (
  <section className="py-28 px-6">
    <div className="max-w-3xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div
          className="text-xs font-semibold text-[oklch(0.62_0.17_158)] uppercase tracking-[0.15em] mb-6"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          — Request access
        </div>
        <h2
          className="font-black leading-tight tracking-[-0.04em] text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)] mb-5"
          style={{ fontFamily: 'Cabinet Grotesk, sans-serif', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
        >
          The club is open.
          <br />
          <span className="text-gradient">Are you in?</span>
        </h2>
        <p className="text-lg text-[oklch(0.36_0.010_255)] dark:text-[oklch(0.60_0.008_255)] mb-10 leading-relaxed">
          Join thousands of serious learners who stopped re-reading and started actually understanding. It's free to start.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/register')}
            className="group flex items-center justify-center gap-2.5 px-8 py-4 bg-[oklch(0.62_0.17_158)] hover:bg-[oklch(0.55_0.17_158)] text-white font-bold rounded-md transition-all hover:shadow-[0_0_36px_oklch(0.62_0.17_158/40%)] active:scale-[0.98] text-base"
            style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}
          >
            Get access — it's free
            <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <p className="mt-6 text-sm text-[oklch(0.56_0.008_255)]">
          No credit card. No catch. Just better learning.
        </p>
      </motion.div>
    </div>
  </section>
);

/* ── FOOTER ── */
const Footer = () => (
  <footer className="border-t border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/9%)] py-10 px-6">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-[oklch(0.62_0.17_158)] flex items-center justify-center">
          <span className="text-white font-bold text-sm" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>T</span>
        </div>
        <span className="font-bold text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)]" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
          T.Learn
        </span>
        <span className="text-[oklch(0.72_0.005_255)] text-sm">
          — Learn by teaching.
        </span>
      </div>
      <div className="flex gap-6 text-sm text-[oklch(0.56_0.008_255)]">
        <a href="#" className="hover:text-[oklch(0.62_0.17_158)] transition-colors">Privacy</a>
        <a href="#" className="hover:text-[oklch(0.62_0.17_158)] transition-colors">Terms</a>
        <a href="#" className="hover:text-[oklch(0.62_0.17_158)] transition-colors">Contact</a>
      </div>
      <span className="text-sm text-[oklch(0.72_0.005_255)]">© 2025 T.Learn</span>
    </div>
  </footer>
);

export default LandingPage;