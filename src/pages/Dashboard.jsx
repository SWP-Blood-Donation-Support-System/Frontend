import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTint, FaUserPlus, FaExclamationTriangle, FaChartLine, FaCalendarAlt, FaMapMarkerAlt, FaSpinner, FaExclamationCircle, FaFileAlt, FaDownload, FaUsers, FaClock, FaHospital, FaSignOutAlt } from 'react-icons/fa';
import { getBloodInventory, getAllReports, isAuthenticated, getUser, logout } from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [bloodInventory, setBloodInventory] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportsError, setReportsError] = useState('');

  useEffect(() => {
    // Kiểm tra authentication trước khi fetch data
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const user = getUser();
    if (!user || !user.role || !['Admin', 'Staff'].includes(user.role)) {
      navigate('/login');
      return;
    }

    fetchBloodInventory();
    fetchReports();
  }, [navigate]);

  const fetchBloodInventory = async () => {
    try {
      setLoading(true);
      const data = await getBloodInventory();
      setBloodInventory(data.inventory || []);
    } catch (err) {
      console.error('Error fetching blood inventory:', err);
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        // Auto logout after 3 seconds
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 3000);
      } else {
        setError(err.message || 'Lỗi tải thông tin kho máu');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      const data = await getAllReports();
      setReports(data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        setReportsError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        // Auto logout after 3 seconds
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 3000);
      } else {
        setReportsError(err.message || 'Lỗi tải báo cáo');
      }
    } finally {
      setReportsLoading(false);
    }
  };

  // Kiểm tra authentication và role
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Bạn cần đăng nhập</h2>
          <p className="text-gray-600 mb-6">Vui lòng đăng nhập để truy cập Dashboard</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  const user = getUser();
  if (!user || !user.role || !['Admin', 'Staff'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Không có quyền truy cập</h2>
          <p className="text-gray-600 mb-6">Bạn không có quyền truy cập Dashboard</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Tính toán tổng hợp theo nhóm máu
  const calculateBloodSummary = () => {
    const summary = {};
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    // Khởi tạo với 0
    bloodTypes.forEach(type => {
      summary[type] = {
        total: 0,
        available: 0,
        expired: 0
      };
    });

    // Tính toán từ dữ liệu inventory
    bloodInventory.forEach(item => {
      const type = item.bloodType;
      if (summary[type]) {
        summary[type].total += item.volume || 0;
        if (item.bloodDetailStatus === 'Còn hạn') {
          summary[type].available += item.volume || 0;
        } else if (item.bloodDetailStatus === 'Hết hạn') {
          summary[type].expired += item.volume || 0;
        }
      }
    });

    return summary;
  };

  // Mock data for other stats (có thể thay thế bằng API thực tế sau)
  const stats = {
    totalDonors: 1250,
    activeDonors: 850,
    totalDonations: 3500,
    emergencyRequests: 12,
    upcomingDonations: 25,
  };

  const recentDonations = [
    {
      id: 1,
      donorName: 'Nguyễn Văn A',
      bloodType: 'A+',
      date: '2024-03-15',
      location: 'Bệnh viện Chợ Rẫy',
      status: 'completed',
    },
    {
      id: 2,
      donorName: 'Trần Thị B',
      bloodType: 'O+',
      date: '2024-03-14',
      location: 'Bệnh viện Nhân dân 115',
      status: 'completed',
    },
    {
      id: 3,
      donorName: 'Lê Văn C',
      bloodType: 'B+',
      date: '2024-03-16',
      location: 'Bệnh viện Đại học Y Dược',
      status: 'scheduled',
    },
  ];

  const emergencyRequests = [
    {
      id: 1,
      patientName: 'Phạm Thị D',
      bloodType: 'AB+',
      units: 2,
      hospital: 'Bệnh viện Chợ Rẫy',
      deadline: '2024-03-17',
      status: 'pending',
    },
    {
      id: 2,
      patientName: 'Hoàng Văn E',
      bloodType: 'O-',
      units: 1,
      hospital: 'Bệnh viện Nhân dân 115',
      deadline: '2024-03-18',
      status: 'fulfilled',
    },
  ];

  const bloodSummary = calculateBloodSummary();
  const totalBloodUnits = Object.values(bloodSummary).reduce((sum, type) => sum + type.total, 0);
  const totalAvailableUnits = Object.values(bloodSummary).reduce((sum, type) => sum + type.available, 0);
  const totalExpiredUnits = Object.values(bloodSummary).reduce((sum, type) => sum + type.expired, 0);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-8">
            <div></div>
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                Dashboard Quản lý
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Tổng quan hệ thống hiến máu và quản lý kho máu
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Xin chào,</p>
                <p className="font-semibold text-gray-800">{user?.fullName || user?.username}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                <FaSignOutAlt className="mr-2" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex items-center">
              <FaExclamationCircle className="text-red-500 mr-3" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {reportsError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex items-center">
              <FaExclamationCircle className="text-red-500 mr-3" />
              <p className="text-red-700 font-medium">{reportsError}</p>
            </div>
          </div>
        )}

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Blood Units */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Tổng đơn vị máu</p>
                <p className="text-3xl font-bold text-blue-600">
                  {loading ? (
                    <FaSpinner className="animate-spin text-2xl" />
                  ) : (
                    totalBloodUnits.toLocaleString()
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Đơn vị</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FaTint className="text-white text-xl" />
              </div>
            </div>
          </div>

          {/* Available Blood */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Máu còn hạn</p>
                <p className="text-3xl font-bold text-green-600">
                  {loading ? (
                    <FaSpinner className="animate-spin text-2xl" />
                  ) : (
                    totalAvailableUnits.toLocaleString()
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Đơn vị</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <FaUserPlus className="text-white text-xl" />
              </div>
            </div>
          </div>

          {/* Expired Blood */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Máu hết hạn</p>
                <p className="text-3xl font-bold text-red-600">
                  {loading ? (
                    <FaSpinner className="animate-spin text-2xl" />
                  ) : (
                    totalExpiredUnits.toLocaleString()
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Đơn vị</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <FaExclamationTriangle className="text-white text-xl" />
              </div>
            </div>
          </div>

          {/* Upcoming Donations */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Lịch hiến máu</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.upcomingDonations}
                </p>
                <p className="text-xs text-gray-500 mt-1">Sắp tới</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaCalendarAlt className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Blood Inventory Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaTint className="text-blue-600 mr-3" />
              Tồn kho máu theo nhóm
            </h2>
            {loading && (
              <div className="flex items-center text-sm text-gray-500">
                <FaSpinner className="animate-spin mr-2" />
                Đang tải...
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                <div key={type} className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-2xl font-bold text-gray-400">{type}</p>
                  <p className="text-gray-500">...</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Object.entries(bloodSummary).map(([type, data]) => (
                <div key={type} className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <p className="text-3xl font-bold text-blue-600 mb-3">{type}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Còn hạn:</span>
                      <span className="font-semibold text-green-600">{data.available}</span>
                    </div>
                    {data.expired > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Hết hạn:</span>
                        <span className="font-semibold text-red-600">{data.expired}</span>
                      </div>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${data.total > 0 ? (data.available / data.total * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Tổng: {data.total} đơn vị
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reports Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaFileAlt className="text-indigo-600 mr-3" />
              Báo cáo hệ thống
            </h2>
            {reportsLoading && (
              <div className="flex items-center text-sm text-gray-500">
                <FaSpinner className="animate-spin mr-2" />
                Đang tải...
              </div>
            )}
          </div>
          
          {reportsLoading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-3xl text-indigo-600 mr-4" />
              <span className="text-gray-600 text-lg">Đang tải báo cáo...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-600 mb-3">Chưa có báo cáo nào</h3>
              <p className="text-gray-500">Báo cáo sẽ được tạo tự động theo định kỳ</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-50 to-purple-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Loại báo cáo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ngày tạo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Mô tả</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reports.map((report) => (
                    <tr key={report.reportId || report.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{report.reportId || report.id}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-indigo-600">
                          {report.reportType || report.type || 'Báo cáo tổng hợp'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(report.createdDate || report.date)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            (report.status || report.reportStatus) === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {report.status || report.reportStatus || 'Đang xử lý'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {report.description || report.note || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <button className="flex items-center text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors duration-200">
                          <FaDownload className="mr-2" />
                          Tải xuống
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Donations */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaUsers className="text-green-600 mr-3" />
              Hiến máu gần đây
            </h2>
            <div className="space-y-4">
              {recentDonations.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                      <FaTint className="text-white text-sm" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{donation.donorName}</p>
                      <div className="flex items-center text-gray-600 text-sm mt-1">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium mr-3">
                          {donation.bloodType}
                        </span>
                        <FaMapMarkerAlt className="mr-1" />
                        <span>{donation.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">{donation.date}</p>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        donation.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {donation.status === 'completed' ? 'Hoàn thành' : 'Đã lên lịch'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Requests */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaExclamationTriangle className="text-red-600 mr-3" />
              Yêu cầu cấp cứu
            </h2>
            <div className="space-y-4">
              {emergencyRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                      <FaHospital className="text-white text-sm" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{request.patientName}</p>
                      <div className="flex items-center text-gray-600 text-sm mt-1">
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium mr-3">
                          {request.bloodType} - {request.units} đơn vị
                        </span>
                        <FaMapMarkerAlt className="mr-1" />
                        <span>{request.hospital}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Hạn: {request.deadline}</p>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'fulfilled'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {request.status === 'fulfilled' ? 'Đã đáp ứng' : 'Đang chờ'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Blood Inventory Table */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaChartLine className="text-purple-600 mr-3" />
            Chi tiết kho máu
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-3xl text-purple-600 mr-4" />
              <span className="text-gray-600 text-lg">Đang tải...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nhóm máu</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Thể tích</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ngày hiến</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ghi chú</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Bệnh viện</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bloodInventory.map((item) => (
                    <tr key={item.bloodDetailId} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{item.bloodDetailId}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {item.bloodType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {item.volume} đơn vị
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(item.bloodDetailDate)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            item.bloodDetailStatus === 'Còn hạn'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.bloodDetailStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {item.note || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        BV {item.hospitalId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 