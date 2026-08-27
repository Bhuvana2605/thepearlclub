import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SanctuaryProvider, useSanctuary } from './context/SanctuaryContext';
import { Layout } from './components/Layout';

import { Auth } from './pages/Auth';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { ResetPassword } from './pages/ResetPassword';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';

import { Home } from './pages/Home';
import { Journal } from './pages/Journal';
import { MoodCanvas } from './pages/MoodCanvas';
import { FocusTimer } from './pages/FocusTimer';
import { FocusAquarium } from './pages/FocusAquarium';
import { SmallThings } from './pages/SmallThings';
import { Games } from './pages/Games';
import { Aquarium } from './pages/Aquarium';
import { DoNothing } from './pages/DoNothing';
import { Bottle } from './pages/Bottle';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';

import { Feed } from './pages/Feed';
import { PublicProfile } from './pages/PublicProfile';
import { AdminAnalytics } from './pages/AdminAnalytics';

const LoadingScreen = () => (
  <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#e1f5fe] via-[#b2dfdb] to-[#80cbc4] text-primary p-6 text-center">
    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
    <h2 className="font-headline-md text-xl font-semibold text-primary">Pearl Club Haven</h2>
    <p className="font-body-md text-xs text-on-surface-variant mt-1">Verifying authentication session...</p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { currentUser, authLoading } = useSanctuary();
  const location = useLocation();

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const PublicAuthRoute = ({ children }) => {
  const { currentUser, authLoading } = useSanctuary();

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export function App() {
  return (
    <SanctuaryProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/auth" element={<PublicAuthRoute><Auth /></PublicAuthRoute>} />
            <Route path="/login" element={<PublicAuthRoute><Login /></PublicAuthRoute>} />
            <Route path="/signup" element={<PublicAuthRoute><SignUp /></PublicAuthRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />

            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
            <Route path="/canvas" element={<ProtectedRoute><MoodCanvas /></ProtectedRoute>} />
            <Route path="/focus" element={<ProtectedRoute><FocusTimer /></ProtectedRoute>} />
            <Route path="/focus-aquarium" element={<ProtectedRoute><FocusAquarium /></ProtectedRoute>} />
            <Route path="/small-things" element={<ProtectedRoute><SmallThings /></ProtectedRoute>} />
            <Route path="/games" element={<ProtectedRoute><Games /></ProtectedRoute>} />
            <Route path="/music" element={<Navigate to="/focus" replace />} />
            <Route path="/world" element={<ProtectedRoute><Aquarium /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/do-nothing" element={<ProtectedRoute><DoNothing /></ProtectedRoute>} />
            <Route path="/bottle" element={<ProtectedRoute><Bottle /></ProtectedRoute>} />

            <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
            <Route path="/u/:username" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </Router>
    </SanctuaryProvider>
  );
}

export default App;
