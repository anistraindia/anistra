import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, ArrowLeft, Database, Key, Trash2 } from 'lucide-react';

export default function PrivacyPolicy() {
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
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1e90ff]">
              Legal Documentation
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading">
              ANISTRA Privacy Policy
            </h1>
          </div>
        </div>

        <p className="text-xs text-zinc-500 mb-8">
          Last Updated: October 2024 • Effective Date: October 2024
        </p>

        <div className="space-y-8 text-sm text-[#d8d8d8] leading-relaxed font-normal">
          
          <section>
            <h2 className="text-base font-bold text-white mb-2">1. Overview & Purpose</h2>
            <p>
              ANISTRA ("we", "our", or "the platform") is dedicated to protecting your personal information. ANISTRA is a personal anime discovery, watchlist tracking, and review platform. <strong>ANISTRA is NOT an anime streaming website and does not host or transmit video streams.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">2. Account Information & Google Authentication</h2>
            <p>
              When you sign in to ANISTRA using Google Single Sign-On, we receive basic authentication credentials including your primary email address, display name, and profile avatar. We do not receive, store, or have access to your Google account password.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">3. Profile Data & Usernames</h2>
            <p>
              Your public profile consists of your chosen username, profile picture (either your Google avatar, a default avatar, or custom uploaded image), and your member registration date. Usernames must adhere to community standards and are restricted to one modification per 14 days.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">4. Anime Tracking & Watchlist Records</h2>
            <p>
              When you add titles to My List or mark individual episodes as watched, this tracking data is associated with your account ID and stored in our database. We store individual episode logs to ensure seamless resumption across all devices.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">5. User Reviews & Spoiler Flags</h2>
            <p>
              Reviews and star ratings you post are published publicly with your username and avatar. When you mark a review with the spoiler flag, the text is shielded from other community members until explicitly unmasked. All review submissions pass through our automated moderation and anti-abuse verification engine.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">6. Cookies & Client-Side Storage</h2>
            <p>
              We utilize browser localStorage and session tokens strictly to keep you authenticated, preserve UI preferences (such as spoiler shielding), and provide instant offline caching for anime catalog queries. We do not use invasive tracking cookies for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">7. Data Aggregation & Open Archives</h2>
            <p>
              ANISTRA aggregates anime metadata, imagery, and synopsis data from verified public archives and open databases. All artwork remains the property of original studios and licensors.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">8. Data Retention & Account Deletion</h2>
            <p>
              You have the right to request deletion of your ANISTRA account and all associated watchlist items, episode tracking timestamps, and written reviews. You can trigger data removal through your profile settings or by contacting <a href="mailto:mail@anistra.info" className="text-[#1e90ff] hover:underline">mail@anistra.info</a>.
            </p>
          </section>

        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.06] text-xs text-zinc-500 flex items-center justify-between">
          <span>ANISTRA Privacy Team</span>
          <Link to="/terms" className="text-[#1e90ff] hover:underline">
            Read Terms & Conditions →
          </Link>
        </div>

      </div>

    </div>
  );
}
