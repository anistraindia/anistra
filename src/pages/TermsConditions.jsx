import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function TermsConditions() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="p-8 sm:p-12 angular-cut bg-[#0b0b0b] border border-white/[0.08]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 angular-cut-sm bg-[#1e90ff]/10 border border-[#1e90ff]/25 text-[#1e90ff]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1e90ff]">
              Legal Documentation
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading">
              ANISTRA Terms & Conditions
            </h1>
          </div>
        </div>

        <p className="text-xs text-zinc-500 mb-8">
          Last Updated: October 2024 • Version 1.0
        </p>

        <div className="space-y-8 text-sm text-[#d8d8d8] leading-relaxed font-normal">
          
          <section>
            <h2 className="text-base font-bold text-white mb-2">1. Nature of the Service</h2>
            <p>
              ANISTRA is strictly an anime discovery, information, personal watchlist management, and community review platform. <strong>Under no circumstances does ANISTRA stream, download, broadcast, or host copyrighted video files or episode streams.</strong> All references to "Mark Episodes" and "Continue Tracking" refer exclusively to individual user logs.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">2. Acceptable Use Policy</h2>
            <p>
              By accessing ANISTRA, you agree not to engage in malicious activities including scraping, automated bot attacks, rate limit evasion, injecting harmful scripts, or attempting unauthorized access to database records via client tampering.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">3. Review Rules & Content Moderation</h2>
            <p>
              Users may post reviews and ratings on anime titles. All submitted content is filtered through automated and manual moderation checks. We enforce a zero-tolerance policy towards:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400 pl-2">
              <li>Hate speech, racism, slurs, harassment, or personal threats</li>
              <li>Sexually explicit, pornographic, or non-consensual content</li>
              <li>Spam, commercial solicitation, or referral URLs</li>
              <li>Attempts to bypass moderation via leet speak, character insertions, or punctuation tricks</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">4. Mandatory Spoiler Compliance</h2>
            <p>
              Reviews disclosing crucial plot twists, character deaths, or ending climaxes must be marked with the "Contains spoilers" checkbox. Deliberate unflagged spoiling may result in review deletion or account suspension.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">5. Username Policies & 14-Day Modification Restriction</h2>
            <p>
              Usernames must consist of at least 4 alphanumeric characters and must not impersonate staff or infringe upon trademarks. To protect the integrity of community records, usernames may only be modified once every 14 calendar days.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">6. Intellectual Property & API Disclaimer</h2>
            <p>
              Anime titles, character artwork, cover images, and synopses displayed on ANISTRA are the intellectual property of their respective creators, publishers, and studios. These materials are displayed for informational and transformative critique purposes under fair use via public anime databases and open data archives.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">7. Account Termination</h2>
            <p>
              ANISTRA reserves the right to terminate or restrict access to any account found violating these terms, engaging in harassment, or submitting abusive content.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">8. Modifications to Terms</h2>
            <p>
              We may update these terms from time to time to reflect operational or legal updates. Continued use of ANISTRA following any revisions signifies your acceptance of the updated terms.
            </p>
          </section>

        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.06] text-xs text-zinc-500 flex items-center justify-between">
          <span>ANISTRA Legal Team</span>
          <Link to="/privacy" className="text-[#1e90ff] hover:underline">
            Read Privacy Policy →
          </Link>
        </div>

      </div>

    </div>
  );
}
