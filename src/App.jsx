import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import BloodTypes from './pages/BloodTypes';
import DonorRegistration from './pages/DonorRegistration';
import BloodSearch from './pages/BloodSearch';
import EmergencyRequests from './pages/EmergencyRequests';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

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
              <Route path="/donor-registration" element={<DonorRegistration />} />
              <Route path="/blood-search" element={<BloodSearch />} />
              <Route path="/emergency" element={<EmergencyRequests />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
