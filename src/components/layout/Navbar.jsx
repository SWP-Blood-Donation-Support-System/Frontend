import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaUser, FaSignInAlt, FaUserPlus, FaHeartbeat, FaCalendarAlt, FaHistory } from 'react-icons/fa';
import { isAuthenticated, logout, getUser } from '../../utils/api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      if (authenticated) {
        setUser(getUser());
      }
    };

    checkAuth();
    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkAuth);
    // Listen for custom auth state change event
    window.addEventListener('authStateChanged', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authStateChanged', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUser(null);
    setIsOpen(false);
  };

  // Base navigation links
  const baseNavLinks = [
    { path: '/', label: 'Trang chủ' },
    { path: '/blood-types', label: 'Nhóm máu' },
    { path: '/blood-search', label: 'Tìm kiếm máu' },
  ];

  // Navigation links for logged-in users
  const getLoggedInNavLinks = () => {
    const links = [...baseNavLinks];
    
    // Add Events link for all users
    links.push({ path: '/events', label: 'Sự kiện hiến máu' });
    
    // Add role-specific links
    if (user?.role === 'Admin' || user?.role === 'Staff') {
      links.push(
        { path: '/donor-registration', label: 'Đăng ký hiến máu' },
        { path: '/emergency', label: 'Cấp cứu' }
      );
    } else {
      // For regular users, add appointment history
      links.push({ path: '/appointment-history', label: 'Lịch hiến máu' });
    }
    
    return links;
  };

  const navLinks = isLoggedIn ? getLoggedInNavLinks() : baseNavLinks;

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                <FaHeartbeat className="text-white text-xl" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                BloodCare
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red-50 relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <Link
                  to={user?.role === 'Admin' || user?.role === 'Staff' ? '/dashboard' : '/profile'}
                  className="text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red-50 flex items-center space-x-2"
                >
                  <FaUser className="text-sm" />
                  <span>{user?.fullName || user?.username || 'Tài khoản'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red-50 flex items-center space-x-2"
                >
                  <FaSignInAlt className="text-sm" />
                  <span>Đăng nhập</span>
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2"
                >
                  <FaUserPlus className="text-sm" />
                  <span>Đăng ký</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-red-600 focus:outline-none p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
            >
              {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-red-600 hover:bg-red-50 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 flex items-center space-x-2"
                onClick={() => setIsOpen(false)}
              >
                {link.path === '/events' && <FaCalendarAlt className="text-sm" />}
                {link.path === '/appointment-history' && <FaHistory className="text-sm" />}
                <span>{link.label}</span>
              </Link>
            ))}
            
            {/* Mobile Auth Buttons */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              {isLoggedIn ? (
                <>
                  <Link
                    to={user?.role === 'Admin' || user?.role === 'Staff' ? '/dashboard' : '/profile'}
                    className="text-gray-700 hover:text-red-600 hover:bg-red-50 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 flex items-center space-x-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaUser className="text-sm" />
                    <span>{user?.fullName || user?.username || 'Tài khoản'}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 mt-2"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-red-600 hover:bg-red-50 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 flex items-center space-x-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaSignInAlt className="text-sm" />
                    <span>Đăng nhập</span>
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 mt-2 block text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaUserPlus className="inline text-sm mr-2" />
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 