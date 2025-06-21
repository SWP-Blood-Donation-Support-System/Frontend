import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import Home from './pages/Home';
import BloodTypes from './pages/BloodTypes';
import DonorRegistration from './pages/DonorRegistration';
import BloodSearch from './pages/BloodSearch';
import EmergencyRequests from './pages/EmergencyRequests';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import AppointmentHistory from './pages/AppointmentHistory';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blood-types" element={<BloodTypes />} />
              <Route path="/events" element={<Events />} />
              <Route path="/appointment-history" element={
                <ProtectedRoute>
                  <AppointmentHistory />
                </ProtectedRoute>
              } />
              <Route path="/donor-registration" element={
                <ProtectedRoute>
                  <DonorRegistration />
                </ProtectedRoute>
              } />
              <Route path="/blood-search" element={<BloodSearch />} />
              <Route path="/emergency" element={
                <ProtectedRoute>
                  <EmergencyRequests />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                  <Dashboard />
                </RoleBasedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
