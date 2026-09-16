import React, { useState, useEffect } from 'react';
import StudentHeader from './StudentHeader';
import ProfileOnboardingModal from './ProfileOnboardingModal';
import { isProfileCompleted } from '../../services/profileService';

function StudentLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if profile is completed on mount
    if (!isProfileCompleted()) {
      setShowOnboarding(true);
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <StudentHeader mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} College Online Application & Services. All rights reserved.
        </div>
      </footer>
      
      {showOnboarding && (
        <ProfileOnboardingModal 
          open={showOnboarding} 
          onClose={() => setShowOnboarding(false)} 
        />
      )}
    </div>
  );
}

export default StudentLayout;
