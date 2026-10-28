import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import { ReviewsProvider } from './context/ReviewsContext';

import Navbar from './components/Navbar';
import MobileNavbar from './components/MobileNavbar';
import MobileTopHeader from './components/MobileTopHeader';
import Footer from './components/Footer';
import OnboardingModal from './components/OnboardingModal';
import GoogleLoginModal from './components/GoogleLoginModal';
import QuickSearchModal from './components/QuickSearchModal';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

import Home from './pages/Home';
import Search from './pages/Search';
import MyList from './pages/MyList';
import Reviews from './pages/Reviews';
import AnimeDetails from './pages/AnimeDetails';
import AnimeReviews from './pages/AnimeReviews';
import Profile from './pages/Profile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import Login from './pages/Login';

function AppContent() {
  const { needsOnboarding, googleLoginOpen, closeGoogleLogin, handleGoogleSuccess } = useAuth();
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="relative min-h-screen bg-[#000000] text-[#ffffff] flex flex-col selection:bg-[#1e90ff]/30 selection:text-[#1e90ff] overflow-x-hidden font-sans">
      
      {/* ========================================================
          ENMA NEON CINEMA ATMOSPHERE
          Deep pure black foundation with faint electric blue cinema aura
          ======================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(30,144,255,0.08)_0%,rgba(0,0,0,0)_70%)] filter blur-[90px]"
          aria-hidden="true"
        />
      </div>

      {/* Mobile Top Header (floating pill with space above) */}
      <MobileTopHeader onOpenSearch={() => setQuickSearchOpen(true)} />

      {/* Desktop Top Floating Glass Navbar (kept floating with top space) */}
      <div className="hidden md:block fixed top-3.5 sm:top-4.5 inset-x-0 z-50 pointer-events-none">
        <Navbar onOpenSearch={() => setQuickSearchOpen(true)} />
      </div>

      {/* Main Content Area */}
      <main className={`relative z-10 flex-1 w-full pb-0 md:pb-6 ${isHome ? '' : 'pt-20 sm:pt-28'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/my-list" element={<MyList />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/anime/:id" element={<AnimeDetails />} />
          <Route path="/anime/:id/reviews" element={<AnimeReviews />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Footer */}
      <div className="relative z-10">
        <Footer />
      </div>

      {/* Mobile Bottom Fixed iOS Glass Navbar */}
      <MobileNavbar />

      {/* Google Login Popup Modal */}
      <GoogleLoginModal
        isOpen={googleLoginOpen}
        onClose={closeGoogleLogin}
      />

      {/* Global First Time Onboarding / Avatar Check Modal */}
      <OnboardingModal isOpen={needsOnboarding} />

      {/* Global Quick Spotlight Search */}
      <QuickSearchModal
        isOpen={quickSearchOpen}
        onClose={() => setQuickSearchOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <WatchlistProvider>
          <ReviewsProvider>
            <Router>
              <ScrollToTop />
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
            </Router>
          </ReviewsProvider>
        </WatchlistProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
