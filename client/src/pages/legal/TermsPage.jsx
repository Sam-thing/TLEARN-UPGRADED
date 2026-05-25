// src/pages/legal/TermsPage.jsx
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const LAST_UPDATED  = 'May 25, 2026';
const APP_NAME      = 'T.Learn';
const CONTACT_EMAIL = 'legal@tlearn.app';

export default function TermsPage() {
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
            <FileText className="w-5 h-5 text-[oklch(0.62_0.17_158)]" />
          </div>
          <h1 className="text-3xl font-bold text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)]">
            Terms of Service
          </h1>
        </div>
        <p className="text-sm text-[oklch(0.56_0.008_255)] mb-10">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-[oklch(0.36_0.010_255)] dark:text-[oklch(0.65_0.008_255)]">

          <Section title="1. Acceptance of Terms">
            <p>
              By creating an account or using {APP_NAME}, you agree to these Terms of Service
              and our <Link to="/privacy" className="text-[oklch(0.62_0.17_158)] underline underline-offset-2">Privacy Policy</Link>.
              If you do not agree, do not use the service.
            </p>
            <p>
              We may update these terms. We will notify you by email at least 14 days before
              material changes take effect. Continued use after that date constitutes acceptance.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <ul>
              <li>You must be at least 13 years old to use {APP_NAME}.</li>
              <li>If you are under 18, you confirm that a parent or guardian has reviewed and agreed to these terms on your behalf.</li>
              <li>You must provide accurate registration information and keep it up to date.</li>
              <li>You may only hold one account. Creating duplicate accounts to circumvent restrictions is prohibited.</li>
            </ul>
          </Section>

          <Section title="3. Your Account">
            <ul>
              <li>You are responsible for keeping your password secure. Use a strong, unique password.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>Notify us immediately at {CONTACT_EMAIL} if you suspect unauthorised access.</li>
              <li>We reserve the right to suspend accounts that we reasonably believe have been compromised.</li>
            </ul>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree not to:</p>
            <ul>
              <li>Use {APP_NAME} for any unlawful purpose or in violation of any regulations.</li>
              <li>Upload or share content that is harmful, abusive, threatening, defamatory, obscene, or infringes any third-party rights.</li>
              <li>Attempt to gain unauthorised access to any part of the service or other users' accounts.</li>
              <li>Reverse-engineer, scrape, or systematically extract data from the platform.</li>
              <li>Use automated tools (bots, scripts) to create sessions, generate fake activity, or manipulate leaderboards.</li>
              <li>Impersonate any person or entity.</li>
              <li>Transmit viruses, malware, or any code designed to disrupt or damage the service.</li>
              <li>Harass, bully, or intimidate other users in study rooms or any other feature.</li>
            </ul>
            <p>
              We reserve the right to remove content and suspend or terminate accounts that violate
              these rules, without prior notice in serious cases.
            </p>
          </Section>

          <Section title="5. Your Content">
            <p>
              You retain ownership of all content you create on {APP_NAME} — including session
              transcripts, notes, flashcards, and messages.
            </p>
            <p>
              By using the service, you grant {APP_NAME} a limited, non-exclusive, royalty-free
              licence to store, process, and display your content solely for the purpose of
              providing the service to you. We do not claim ownership of your content and will
              not use it for advertising.
            </p>
            <p>
              You are responsible for ensuring your content does not violate any third-party
              intellectual property rights or applicable laws.
            </p>
          </Section>

          <Section title="6. AI-Generated Content">
            <p>
              {APP_NAME} uses AI models to generate feedback, notes, exam questions, and
              flashcards. This content is provided for educational purposes only.
            </p>
            <ul>
              <li>AI-generated feedback may contain errors or inaccuracies. Do not rely solely on it for academic assessments.</li>
              <li>We do not guarantee the accuracy, completeness, or fitness for any particular purpose of AI-generated content.</li>
              <li>AI-generated content does not constitute professional advice of any kind.</li>
            </ul>
          </Section>

          <Section title="7. Study Rooms & Community">
            <p>
              Study rooms are shared spaces. By participating, you agree to treat other members
              with respect. Content shared in rooms is visible to all room members.
            </p>
            <p>
              We are not responsible for content posted by other users. If you encounter abusive
              content, report it using the in-app tools or by emailing {CONTACT_EMAIL}.
            </p>
          </Section>

          <Section title="8. Intellectual Property">
            <p>
              The {APP_NAME} platform, including its design, code, branding, and original content,
              is owned by {APP_NAME} and protected by intellectual property laws.
            </p>
            <p>
              You may not copy, reproduce, distribute, or create derivative works from any part
              of the platform without our express written permission.
            </p>
          </Section>

          <Section title="9. Service Availability">
            <p>
              We aim to keep {APP_NAME} available at all times but do not guarantee uninterrupted
              access. We may suspend the service for maintenance, security updates, or reasons
              beyond our control.
            </p>
            <p>
              The free tier of our infrastructure provider may result in slower cold-start times
              after periods of inactivity. This is a known limitation and not a breach of these terms.
            </p>
          </Section>

          <Section title="10. Free & Paid Features">
            <p>
              {APP_NAME} is currently free to use. If we introduce paid features in the future,
              we will provide clear notice and update these terms accordingly. You will never be
              charged without explicit consent.
            </p>
          </Section>

          <Section title="11. Disclaimers">
            <p>
              {APP_NAME} is provided "as is" and "as available" without warranties of any kind,
              express or implied, including warranties of merchantability, fitness for a particular
              purpose, or non-infringement.
            </p>
            <p>
              We do not warrant that the service will be error-free, that AI feedback will be
              accurate, or that your use of the service will achieve any particular educational outcome.
            </p>
          </Section>

          <Section title="12. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, {APP_NAME} and its team shall
              not be liable for any indirect, incidental, special, consequential, or punitive
              damages arising from your use of the service — including loss of data, loss of
              revenue, or loss of educational opportunity.
            </p>
            <p>
              Our total liability for any claim arising from these terms or your use of the
              service shall not exceed the greater of (a) the amount you paid us in the 12 months
              preceding the claim, or (b) USD $10.
            </p>
          </Section>

          <Section title="13. Termination">
            <p>
              You may delete your account at any time from Settings → Account → Delete Account.
            </p>
            <p>
              We may suspend or terminate your account if you violate these terms, with or without
              notice depending on the severity. Upon termination, your right to use the service
              ends immediately. Sections 5, 8, 11, 12, and 14 survive termination.
            </p>
          </Section>

          <Section title="14. Governing Law">
            <p>
              These terms are governed by the laws of Kenya, without regard to conflict of law
              principles. Any disputes shall be resolved in the courts of Nairobi, Kenya, unless
              otherwise required by applicable consumer protection law in your jurisdiction.
            </p>
          </Section>

          <Section title="15. Contact">
            <p>
              For questions about these terms, email{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-[oklch(0.62_0.17_158)] underline underline-offset-2"
              >
                {CONTACT_EMAIL}
              </a>.
            </p>
          </Section>

        </div>

        <div className="mt-12 pt-8 border-t border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/9%)] text-sm text-[oklch(0.56_0.008_255)] flex gap-6">
          <Link to="/privacy" className="hover:text-[oklch(0.62_0.17_158)] transition-colors">Privacy Policy</Link>
          <Link to="/"        className="hover:text-[oklch(0.62_0.17_158)] transition-colors">Back to {APP_NAME}</Link>
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