import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaUser, FaSignInAlt, FaUserPlus, FaHeartbeat, FaCalendarAlt, FaHistory, FaClipboardList, FaBell, FaCheck } from 'react-icons/fa';
import { isAuthenticated, logout, getUser } from '../../utils/api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userNotifications, setUserNotifications] = useState([]);
  const [userNotificationsOpen, setUserNotificationsOpen] = useState(false);
  const [userUnreadCount, setUserUnreadCount] = useState(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      if (authenticated) {
        const currentUser = getUser();
        setUser(currentUser);
        // Fetch notifications for admin/staff
        if (currentUser?.role === 'Admin' || currentUser?.role === 'Staff') {
          fetchNotifications();
        } else if (currentUser?.role === 'User') {
          fetchUserNotifications();
        }
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

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Notification/GetNotifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        // Đếm số thông báo chưa được phản hồi hoàn toàn
        const unreadCount = data.filter(n => 
          n.recipients && n.recipients.some(r => r.responseStatus === 'Chưa phản hồi')
        ).length;
        setUnreadCount(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUserNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Notification/GetMyNotifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserNotifications(data);
        // Đếm số thông báo chưa phản hồi
        const unreadCount = data.filter(n => n.responseStatus === 'Chưa phản hồi').length;
        setUserUnreadCount(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching user notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Notification/MarkAsRead/${notificationId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        // Cập nhật trạng thái local - đánh dấu tất cả recipients đã phản hồi
        setNotifications(prev => 
          prev.map(n => 
            n.notificationId === notificationId 
              ? { 
                  ...n, 
                  recipients: n.recipients?.map(r => ({ ...r, responseStatus: 'Đã xử lý' }))
                } 
              : n
          )
        );
        // Cập nhật số thông báo chưa đọc
        const updatedNotifications = notifications.map(n => 
          n.notificationId === notificationId 
            ? { 
                ...n, 
                recipients: n.recipients?.map(r => ({ ...r, responseStatus: 'Đã xử lý' }))
              } 
            : n
        );
        const newUnreadCount = updatedNotifications.filter(n => 
          n.recipients && n.recipients.some(r => r.responseStatus === 'Chưa phản hồi')
        ).length;
        setUnreadCount(newUnreadCount);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleUserResponse = async (notificationId, response) => {
    try {
      const token = localStorage.getItem('token');
      const responseData = {
        notificationId: notificationId,
        response: response // 'accept' hoặc 'decline'
      };

      const apiResponse = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Notification/RespondToNotification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(responseData),
      });

      if (apiResponse.ok) {
        // Cập nhật trạng thái local
        setUserNotifications(prev => 
          prev.map(n => 
            n.notificationId === notificationId 
              ? { ...n, responseStatus: response === 'accept' ? 'Chấp nhận' : 'Từ chối' }
              : n
          )
        );
        // Cập nhật số thông báo chưa đọc
        const newUnreadCount = userNotifications.filter(n => n.responseStatus === 'Chưa phản hồi').length;
        setUserUnreadCount(Math.max(0, newUnreadCount - 1));
      }
    } catch (error) {
      console.error('Error responding to notification:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUser(null);
    setIsOpen(false);
    setNotifications([]);
    setUnreadCount(0);
    setUserNotifications([]);
    setUserUnreadCount(0);
  };

  // Base navigation links
  const baseNavLinks = [
    { path: '/', label: 'Trang chủ' },
    { path: '/blood-types', label: 'Nhóm máu' },
  ];

  // Navigation links for logged-in users
  const getLoggedInNavLinks = () => {
    let links = [...baseNavLinks];
    if (user?.role === 'Admin' || user?.role === 'Staff') {
      // Loại bỏ Trang chủ và Nhóm máu cho admin/staff
      links = links.filter(l => l.path !== '/' && l.path !== '/blood-types');
      links.push(
        { path: '/blood-donation-management', label: 'Quản lý hiến máu' },
        { path: '/blog-management', label: 'Quản lý blog' },
        { path: '/admin/events', label: 'Quản lý sự kiện' },
        { path: '/admin/emergencies', label: 'Quản lý đơn khẩn cấp' },
        { path: '/admin/blood-search', label: 'Tìm máu' }
      );
    } else {
      // For regular users, add blood-related features to navigation
      links.push(
        { path: '/emergency', label: 'Đơn khẩn cấp' },
        { path: '/events', label: 'Sự kiện hiến máu' },
        { path: '/appointment-history', label: 'Lịch hiến máu' },
        { path: '/blood-search', label: 'Tìm kiếm máu' }
      );
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
                {(user?.role === 'Admin' || user?.role === 'Staff') ? (
                  <>
                    {/* Notifications */}
                    <div className="relative">
                      <button
                        className="relative p-2 text-gray-700 hover:text-red-600 rounded-lg transition-all duration-200 hover:bg-red-50"
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                        onBlur={() => setTimeout(() => setNotificationsOpen(false), 150)}
                      >
                        <FaBell className="text-lg" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </button>
                      
                      {/* Notifications Dropdown */}
                      {notificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                          <div className="p-3 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-900">Thông báo</h3>
                          </div>
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                              Không có thông báo nào
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-100">
                              {notifications.map((notification) => {
                                const hasUnresponded = notification.recipients?.some(r => r.responseStatus === 'Chưa phản hồi');
                                
                                
                                return (
                                  <div
                                    key={notification.notificationId}
                                    className={`p-3 hover:bg-gray-50 transition-colors duration-200 ${
                                      hasUnresponded ? 'bg-blue-50' : ''
                                    }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                          {notification.notificationTitle}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                          {notification.notificationContent}
                                        </p>
                                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                          <span>📅 {new Date(notification.notificationDate).toLocaleDateString('vi-VN')}</span>
                                          <span>🏥 {notification.hospitalName}</span>
                                          <span>🩸 {notification.bloodType} ({notification.requiredUnits} đơn vị)</span>
                                        </div>
                                        <div className="mt-2 text-xs">
                                          
                                         
                                        </div>
                                      </div>
                                      {hasUnresponded && (
                                        <button
                                          onClick={() => markAsRead(notification.notificationId)}
                                          className="ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors duration-200"
                                          title="Đánh dấu đã xử lý"
                                        >
                                          <FaCheck className="text-xs" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Admin Dropdown */}
                    <div className="relative">
                      <button
                        className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red-50"
                        onClick={() => setAdminDropdownOpen((open) => !open)}
                        onBlur={() => setTimeout(() => setAdminDropdownOpen(false), 150)}
                        tabIndex={0}
                      >
                        <FaUser className="text-sm" />
                        <span>{user?.fullName || user?.username || 'Tài khoản'}</span>
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {adminDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                          <Link to="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-red-50" onClick={() => setAdminDropdownOpen(false)}>Dashboard</Link>
                          {user?.role === 'Admin' && (
                            <Link to="/admin/users" className="block px-4 py-2 text-gray-700 hover:bg-red-50" onClick={() => setAdminDropdownOpen(false)}>Danh sách user</Link>
                          )}
                          <Link to="/admin/hospitals" className="block px-4 py-2 text-gray-700 hover:bg-red-50" onClick={() => setAdminDropdownOpen(false)}>Quản lý bệnh viện</Link>
                          {user?.role === 'Admin' && (
                            <Link to="/deferral-reason-management" className="block px-4 py-2 text-gray-700 hover:bg-red-50" onClick={() => setAdminDropdownOpen(false)}>Quản lý lý do hoãn</Link>
                          )}
                          <button onClick={() => { setAdminDropdownOpen(false); handleLogout(); }} className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50">Đăng xuất</button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* User Notifications */}
                    <div className="relative">
                      <button
                        className="relative p-2 text-gray-700 hover:text-red-600 rounded-lg transition-all duration-200 hover:bg-red-50"
                        onClick={() => setUserNotificationsOpen(!userNotificationsOpen)}
                        onBlur={() => setTimeout(() => setUserNotificationsOpen(false), 150)}
                      >
                        <FaBell className="text-lg" />
                        {userUnreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                            {userUnreadCount > 99 ? '99+' : userUnreadCount}
                          </span>
                        )}
                      </button>
                      
                      {/* User Notifications Dropdown */}
                      {userNotificationsOpen && (
                        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                          <div className="p-3 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-900">Thông báo của tôi</h3>
                          </div>
                          {userNotifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                              Chưa có thông báo nào
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-100">
                              {userNotifications.map((notification) => (
                                <div
                                  key={notification.notificationId}
                                  className={`p-3 hover:bg-gray-50 transition-colors duration-200 ${
                                    notification.responseStatus === 'Chưa phản hồi' ? 'bg-blue-50' : ''
                                  }`}
                                >
                                  <div className="space-y-2">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">
                                          {notification.notificationTitle}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                          {notification.notificationContent}
                                        </p>
                                        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                                          <span>🏥 {notification.hospitalName}</span>
                                          <span>🩸 {notification.bloodType}</span>
                                          <span>📅 {new Date(notification.notificationDate).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        notification.responseStatus === 'Chấp nhận' 
                                          ? 'bg-green-100 text-green-800' 
                                          : notification.responseStatus === 'Từ chối'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {notification.responseStatus}
                                      </span>
                                      
                                      {notification.responseStatus === 'Chưa phản hồi' && (
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={() => handleUserResponse(notification.notificationId, 'accept')}
                                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                          >
                                            Chấp nhận
                                          </button>
                                          <button
                                            onClick={() => handleUserResponse(notification.notificationId, 'decline')}
                                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                          >
                                            Từ chối
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* User Dropdown */}
                    <div className="relative">
                      <button
                        className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red-50"
                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                        onBlur={() => setTimeout(() => setUserDropdownOpen(false), 150)}
                        tabIndex={0}
                      >
                        <FaUser className="text-sm" />
                        <span>{user?.fullName || user?.username || 'Tài khoản'}</span>
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {userDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                          <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-red-50" onClick={() => setUserDropdownOpen(false)}>
                            Hồ sơ cá nhân
                          </Link>
                          <div className="border-t border-gray-200"></div>
                          <button onClick={() => { setUserDropdownOpen(false); handleLogout(); }} className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50">
                            Đăng xuất
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
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
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Notifications for Admin/Staff */}
            {isLoggedIn && (user?.role === 'Admin' || user?.role === 'Staff') && (
              <button
                className="relative p-2 text-gray-700 hover:text-red-600 rounded-lg transition-all duration-200 hover:bg-red-50"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <FaBell className="text-lg" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            )}
            
            {/* Mobile Notifications for User */}
            {isLoggedIn && user?.role === 'User' && (
              <button
                className="relative p-2 text-gray-700 hover:text-red-600 rounded-lg transition-all duration-200 hover:bg-red-50"
                onClick={() => setUserNotificationsOpen(!userNotificationsOpen)}
              >
                <FaBell className="text-lg" />
                {userUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {userUnreadCount > 99 ? '99+' : userUnreadCount}
                  </span>
                )}
              </button>
            )}
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-red-600 focus:outline-none p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
            >
              {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Notifications Dropdown */}
      {notificationsOpen && (user?.role === 'Admin' || user?.role === 'Staff') && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Thông báo</h3>
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Không có thông báo nào
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {notifications.map((notification) => {
                const hasUnresponded = notification.recipients?.some(r => r.responseStatus === 'Chưa phản hồi');
                const acceptedCount = notification.recipients?.filter(r => r.responseStatus === 'Chấp nhận').length || 0;
                const totalRecipients = notification.recipients?.length || 0;
                
                return (
                  <div
                    key={notification.notificationId}
                    className={`p-3 border-b border-gray-100 ${
                      hasUnresponded ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.notificationTitle}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.notificationContent}
                        </p>
                        <div className="flex flex-col space-y-1 mt-2 text-xs text-gray-500">
                          <span>📅 {new Date(notification.notificationDate).toLocaleDateString('vi-VN')}</span>
                          <span>🏥 {notification.hospitalName}</span>
                          <span>🩸 {notification.bloodType} ({notification.requiredUnits} đơn vị)</span>
                        </div>
                        <div className="mt-2 text-xs">
                          <span className={`px-2 py-1 rounded-full ${
                            hasUnresponded 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {hasUnresponded ? 'Chờ phản hồi' : 'Đã hoàn thành'}
                          </span>
                          <span className="ml-2 text-gray-500">
                            {acceptedCount}/{totalRecipients} đã chấp nhận
                          </span>
                        </div>
                      </div>
                      {hasUnresponded && (
                        <button
                          onClick={() => markAsRead(notification.notificationId)}
                          className="ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors duration-200"
                          title="Đánh dấu đã xử lý"
                        >
                          <FaCheck className="text-xs" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Mobile User Notifications Dropdown */}
      {userNotificationsOpen && user?.role === 'User' && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Thông báo của tôi</h3>
          </div>
          {userNotifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Chưa có thông báo nào
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {userNotifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  className={`p-3 border-b border-gray-100 ${
                    notification.responseStatus === 'Chưa phản hồi' ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {notification.notificationTitle}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.notificationContent}
                      </p>
                      <div className="flex flex-col space-y-1 mt-2 text-xs text-gray-500">
                        <span>🏥 {notification.hospitalName}</span>
                        <span>🩸 {notification.bloodType}</span>
                        <span>📅 {new Date(notification.notificationDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        notification.responseStatus === 'Chấp nhận' 
                          ? 'bg-green-100 text-green-800' 
                          : notification.responseStatus === 'Từ chối'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {notification.responseStatus}
                      </span>
                      
                      {notification.responseStatus === 'Chưa phản hồi' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUserResponse(notification.notificationId, 'accept')}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          >
                            Chấp nhận
                          </button>
                          <button
                            onClick={() => handleUserResponse(notification.notificationId, 'decline')}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          >
                            Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
                {link.path === '/admin/events' && <FaCalendarAlt className="text-sm" />}
                {link.path === '/blood-donation-management' && <FaClipboardList className="text-sm" />}
                {link.path === '/appointment-history' && <FaHistory className="text-sm" />}
                <span>{link.label}</span>
              </Link>
            ))}
            
            {/* Mobile Auth Buttons */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              {isLoggedIn ? (
                <>
                  {(user?.role === 'Admin' || user?.role === 'Staff') ? (
                    <>
                      <Link to="/dashboard" className="text-gray-700 hover:text-red-600 hover:bg-red-50 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200" onClick={() => setIsOpen(false)}>
                        Dashboard
                      </Link>
                      {user?.role === 'Admin' && (
                        <Link to="/admin/users" className="text-gray-700 hover:text-red-600 hover:bg-red-50 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200" onClick={() => setIsOpen(false)}>
                          Danh sách user
                        </Link>
                      )}
                      <Link to="/admin/hospitals" className="text-gray-700 hover:text-red-600 hover:bg-red-50 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200" onClick={() => setIsOpen(false)}>
                        Quản lý bệnh viện
                      </Link>
                      <button onClick={() => { setIsOpen(false); handleLogout(); }} className="w-full text-left text-gray-700 hover:text-red-600 hover:bg-red-50 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200">
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/profile" className="text-gray-700 hover:text-red-600 hover:bg-red-50 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                        <FaUser className="text-sm" />
                        <span>{user?.fullName || user?.username || 'Tài khoản'}</span>
                      </Link>
                      <Link to="/events" className="text-gray-700 hover:text-red-600 hover:bg-red-50 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                        <FaCalendarAlt className="text-sm" />
                        <span>Sự kiện hiến máu</span>
                      </Link>
                      <Link to="/appointment-history" className="text-gray-700 hover:text-red-600 hover:bg-red-50 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                        <FaHistory className="text-sm" />
                        <span>Lịch hiến máu</span>
                      </Link>
                      <Link to="/blood-search" className="text-gray-700 hover:text-red-600 hover:bg-red-50 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                        <FaTint className="text-sm" />
                        <span>Tìm kiếm máu</span>
                      </Link>
                      <button onClick={() => { setIsOpen(false); handleLogout(); }} className="w-full text-left text-gray-700 hover:text-red-600 hover:bg-red-50 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200">
                        Đăng xuất
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-red-600 hover:bg-red-50 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                    <FaSignInAlt className="text-sm" />
                    <span>Đăng nhập</span>
                  </Link>
                  <Link to="/register" className="text-gray-700 hover:text-red-600 hover:bg-red-50 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                    <FaUserPlus className="text-sm" />
                    <span>Đăng ký</span>
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