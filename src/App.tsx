import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Report from './pages/Report';
import Missions from './pages/Missions';
import MissionDetails from './pages/MissionDetails';
import Prevention from './pages/Prevention';
import Timeline from './pages/Timeline';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import FieldMode from './pages/FieldMode';
import Monitoring from './pages/Monitoring';
import Pilots from './pages/Pilots';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Standalone Field Mode (Mobile Outdoor Optimized without Sidebar/BottomNav) */}
        <Route path="/field" element={<FieldMode />} />
        <Route path="/field/start" element={<FieldMode />} />
        <Route path="/field/:id" element={<FieldMode />} />
        <Route path="/field/:id/complete" element={<FieldMode />} />

        {/* Protected Routes (Wrapped in AppLayout) */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/report" element={<Report />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/missions/:id" element={<MissionDetails />} />
          <Route path="/missions/:id/prevention" element={<Prevention />} />
          <Route path="/prevention/:id" element={<Prevention />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/pilots" element={<Pilots />} />
          <Route path="/pilots/:id" element={<Pilots />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
