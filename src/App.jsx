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
import ForgotPassword from './pages/ForgotPassword';
import Events from './pages/Events';
import BloodDonationManagement from './pages/BloodDonationManagement';
import AppointmentHistory from './pages/AppointmentHistory';
import CreateBlog from './pages/CreateBlog';
import BlogManagement from './pages/BlogManagement';
import EventsManagement from './pages/EventsManagement';
import EmergencyManagement from './pages/EmergencyManagement';
import AdminUsers from './pages/AdminUsers';
import AdminHospitals from './pages/AdminHospitals';
import BloodDonorSearch from './pages/BloodDonorSearch';
import AdminBloodSearch from './pages/AdminBloodSearch';

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
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/blood-donation-management" element={
                <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                  <BloodDonationManagement />
                </RoleBasedRoute>
              } />
              <Route path="/create-blog" element={
                <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                  <CreateBlog />
                </RoleBasedRoute>
              } />
              <Route path="/blog-management" element={
                <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                  <BlogManagement />
                </RoleBasedRoute>
              } />
              <Route path="/admin/events" element={
                <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                  <EventsManagement />
                </RoleBasedRoute>
              } />
              <Route path="/admin/emergencies" element={
                <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                  <EmergencyManagement />
                </RoleBasedRoute>
              } />
              <Route path="/admin/users" element={
                <RoleBasedRoute allowedRoles={['Admin']}>
                  <AdminUsers />
                </RoleBasedRoute>
              } />
              <Route path="/admin/hospitals" element={
                <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                  <AdminHospitals />
                </RoleBasedRoute>
              } />
              <Route path="/admin/blood-donor-search" element={
                <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                  <BloodDonorSearch />
                </RoleBasedRoute>
              } />
              <Route path="/admin/blood-search" element={
                <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                  <AdminBloodSearch />
                </RoleBasedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
