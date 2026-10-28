import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-4 md:mt-24 border-t border-white/[0.06] bg-[#000000] pt-5 md:pt-14 pb-20 md:pb-14 px-4 sm:px-8 lg:px-12">
      
      {/* Mobile-Only Small Minimal Footer (Name, Email, Copyright) */}
      <div className="md:hidden flex flex-col items-center text-center gap-1.5 py-1">
        <Link 
          to="/" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="inline-block mb-0.5"
          aria-label="ANISTRA Home"
        >
          <img
            src="/anistra-logo.png"
            alt="ANISTRA"
            className="h-6 object-contain drop-shadow-[0_0_10px_rgba(30,144,255,0.4)]"
          />
        </Link>
        
        <a 
          href="mailto:mail@anistra.info"
          className="text-xs text-zinc-400 hover:text-[#1e90ff] transition-colors font-medium tracking-wide"
        >
          mail@anistra.info
        </a>
        
        <p className="text-[11px] text-zinc-500 font-normal">
          © {currentYear} ANISTRA. All rights reserved.
        </p>
      </div>

      {/* Desktop Full Footer */}
      <div className="hidden md:flex max-w-[1340px] mx-auto flex-col gap-8 sm:gap-10">
        
        {/* Top Row: Brand & Links */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          
          <div className="max-w-md">
            <Link 
              to="/" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-block mb-3.5"
            >
              <img
                src="/anistra-logo.png"
                alt="ANISTRA"
                className="h-8 object-contain drop-shadow-[0_0_12px_rgba(30,144,255,0.4)]"
              />
            </Link>
            <p className="text-xs sm:text-[13.5px] text-[#d8d8d8] leading-relaxed font-normal">
              High-contrast anime discovery, personal tracking, and verified critique ecosystem with dark cinematic depth and canonical episode tracking.
            </p>
            <p className="text-xs text-zinc-400 mt-2">
              Inquiries: <a href="mailto:mail@anistra.info" className="text-[#1e90ff] hover:underline">mail@anistra.info</a>
            </p>
          </div>

          {/* Navigation Links Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
            <div>
              <p className="font-bold text-white uppercase tracking-wider mb-3 font-heading">Explore</p>
              <ul className="flex flex-col gap-2.5 text-[#d8d8d8]">
                <li><Link to="/" className="hover:text-[#1e90ff] transition-colors">Trending Anime</Link></li>
                <li><Link to="/search" className="hover:text-[#1e90ff] transition-colors">Search & Filter</Link></li>
                <li><Link to="/my-list" className="hover:text-[#1e90ff] transition-colors">My Watchlist</Link></li>
                <li><Link to="/reviews" className="hover:text-[#1e90ff] transition-colors">Community Reviews</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-white uppercase tracking-wider mb-3 font-heading">Legal & Safety</p>
              <ul className="flex flex-col gap-2.5 text-[#d8d8d8]">
                <li><Link to="/privacy" className="hover:text-[#1e90ff] transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-[#1e90ff] transition-colors">Terms & Conditions</Link></li>
                <li><span className="text-zinc-500">Moderation Standards</span></li>
                <li><span className="text-zinc-500">Spoiler Shielding</span></li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-white uppercase tracking-wider mb-3 font-heading">Features</p>
              <ul className="flex flex-col gap-2.5 text-[#d8d8d8]">
                <li><span className="text-[#d8d8d8]">Canonical Episode Tracking</span></li>
                <li><span className="text-[#d8d8d8]">Universal Anime Catalog</span></li>
                <li><span className="text-[#d8d8d8]">Verified Member Reviews</span></li>
                <li><span className="text-[#d8d8d8]">Instant Cloud Sync</span></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Platform Mandate Notice (Angular Chamfered Cut) */}
        <div className="p-[1px] bg-white/[0.1] hover:bg-white/[0.18] transition-colors angular-cut">
          <div className="p-4 sm:p-5 angular-cut bg-[#0b0b0b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#d8d8d8]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 angular-cut-sm bg-[#1e90ff]/10 border border-[#1e90ff]/30 flex items-center justify-center text-[#1e90ff] shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <p className="leading-relaxed">
                <strong className="text-white">PLATFORM NOTICE:</strong> ANISTRA is strictly an anime discovery, personal tracking, and review platform. ANISTRA is <strong className="text-[#1e90ff]">NOT</strong> a streaming platform and does not host or stream video files.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <p>© {currentYear} ANISTRA. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#1e90ff] shadow-[0_0_6px_#1e90ff]" />
            <span>Next-Gen Anime Tracking</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
