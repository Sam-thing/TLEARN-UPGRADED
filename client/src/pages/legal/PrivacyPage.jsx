// src/pages/legal/PrivacyPage.jsx
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const LAST_UPDATED = 'May 25, 2026';
const APP_NAME     = 'T.Learn';
const CONTACT_EMAIL = 'privacy@tlearn.app';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.986_0.002_240)] dark:bg-[oklch(0.11_0.008_255)]">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[oklch(0.52_0.008_255)] hover:text-[oklch(0.62_0.17_158)] mb-10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-[oklch(0.62_0.17_158/10%)] flex items-center justify-center">
            <Shield className="w-5 h-5 text-[oklch(0.62_0.17_158)]" />
          </div>
          <h1 className="text-3xl font-bold text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)]">
            Privacy Policy
          </h1>
        </div>
        <p className="text-sm text-[oklch(0.56_0.008_255)] mb-10">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-[oklch(0.36_0.010_255)] dark:text-[oklch(0.65_0.008_255)]">

          <Section title="1. Who We Are">
            <p>
              {APP_NAME} is a learning platform that helps students master subjects by teaching
              them aloud and receiving AI-powered feedback. We are committed to protecting your
              personal information and being transparent about how we use it.
            </p>
            <p>
              For any privacy-related questions, contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[oklch(0.62_0.17_158)] underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <Subsection title="Information you provide">
              <ul>
                <li><strong>Account data</strong> — name, email address, password (stored as a bcrypt hash, never in plain text), institution, and education level.</li>
                <li><strong>Profile information</strong> — bio and any optional details you add.</li>
                <li><strong>Teaching sessions</strong> — audio recordings and transcripts you create while using the platform.</li>
                <li><strong>Study content</strong> — notes, flashcards, exam answers, and calendar events you create.</li>
                <li><strong>Messages</strong> — text, audio, and file messages sent in study rooms.</li>
              </ul>
            </Subsection>
            <Subsection title="Information collected automatically">
              <ul>
                <li><strong>Usage data</strong> — pages visited, features used, session durations, and scores.</li>
                <li><strong>Device data</strong> — browser type, operating system, and IP address (used for security and rate-limiting only).</li>
                <li><strong>Cookies</strong> — we use a single session cookie to keep you signed in. We do not use advertising cookies.</li>
              </ul>
            </Subsection>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul>
              <li>To provide and improve the {APP_NAME} service.</li>
              <li>To process your teaching sessions through AI models (Groq, Google Gemini) to generate feedback, scores, and notes. Your audio and transcripts are sent to these providers solely to generate your results — they are not used to train third-party models under our current agreements.</li>
              <li>To send you notifications about your sessions, achievements, and study reminders (you can turn these off in Settings).</li>
              <li>To detect and prevent abuse, spam, and security threats.</li>
              <li>To calculate and display your progress, streaks, and leaderboard rankings.</li>
            </ul>
          </Section>

          <Section title="4. AI Processing">
            <p>
              When you record a teaching session, your audio is transcribed locally in your browser
              using the Web Speech API. The resulting transcript is then sent to our server and
              forwarded to AI providers (currently Groq and Google Gemini) to generate feedback.
            </p>
            <p>
              We do not sell your transcripts or use them to train AI models beyond what is required
              to generate your immediate feedback. Please review the privacy policies of{' '}
              <a href="https://groq.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[oklch(0.62_0.17_158)] underline underline-offset-2">Groq</a> and{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[oklch(0.62_0.17_158)] underline underline-offset-2">Google</a> for
              information on how they handle submitted data.
            </p>
          </Section>

          <Section title="5. Data Sharing">
            <p>We do not sell your personal data. We share data only in these limited cases:</p>
            <ul>
              <li><strong>AI providers</strong> — transcripts are shared with Groq/Google solely to generate feedback (see Section 4).</li>
              <li><strong>Infrastructure providers</strong> — we use MongoDB Atlas (database) and Render (hosting). These providers process data on our behalf under data processing agreements.</li>
              <li><strong>Other users</strong> — your display name and leaderboard rank are visible to other members. Messages in study rooms are visible to room members. Your profile bio is visible according to your privacy settings.</li>
              <li><strong>Legal requirements</strong> — if required by law or to protect the safety of users.</li>
            </ul>
          </Section>

          <Section title="6. Data Retention">
            <ul>
              <li>Your account and all associated data are retained while your account is active.</li>
              <li>Session transcripts and audio are retained to power your progress analytics. You can delete individual sessions from the Sessions page.</li>
              <li>If you delete your account (Settings → Account → Delete Account), all your data is permanently deleted within 30 days.</li>
              <li>Backups may retain data for up to 90 days after deletion.</li>
            </ul>
          </Section>

          <Section title="7. Your Rights">
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access</strong> your data — use Settings → Export Data to download everything we hold about you.</li>
              <li><strong>Correct</strong> your data — update your profile at any time from the Profile page.</li>
              <li><strong>Delete</strong> your data — delete your account from Settings → Account.</li>
              <li><strong>Opt out</strong> of non-essential notifications — manage this in Settings → Notifications.</li>
            </ul>
            <p>
              To make a formal data request, email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[oklch(0.62_0.17_158)] underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>. We will respond within 30 days.
            </p>
          </Section>

          <Section title="8. Security">
            <p>
              We take security seriously. Passwords are hashed with bcrypt (cost factor 12).
              All data is transmitted over HTTPS. Authentication tokens are short-lived JWTs.
              We apply rate limiting to login and registration endpoints to prevent brute-force attacks.
            </p>
            <p>
              No system is perfectly secure. If you discover a vulnerability, please report it
              responsibly to {CONTACT_EMAIL}.
            </p>
          </Section>

          <Section title="9. Children">
            <p>
              {APP_NAME} is not directed at children under 13. We do not knowingly collect personal
              information from children under 13. If you believe a child has created an account,
              please contact us immediately.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this policy as the service evolves. We will notify registered users
              by email at least 14 days before material changes take effect. The "Last updated"
              date at the top of this page will always reflect the current version.
            </p>
          </Section>

        </div>

        <div className="mt-12 pt-8 border-t border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/9%)] text-sm text-[oklch(0.56_0.008_255)] flex gap-6">
          <Link to="/terms" className="hover:text-[oklch(0.62_0.17_158)] transition-colors">Terms of Service</Link>
          <Link to="/"      className="hover:text-[oklch(0.62_0.17_158)] transition-colors">Back to {APP_NAME}</Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)] mb-3">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Subsection({ title, children }) {
  return (
    <div className="mt-3">
      <h3 className="text-sm font-semibold text-[oklch(0.28_0.010_255)] dark:text-[oklch(0.80_0.008_255)] mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}