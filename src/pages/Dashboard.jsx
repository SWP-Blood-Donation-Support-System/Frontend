import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTint, FaUserPlus, FaExclamationTriangle, FaChartLine, FaCalendarAlt, FaMapMarkerAlt, FaSpinner, FaExclamationCircle, FaFileAlt, FaDownload, FaUsers, FaClock, FaHospital, FaSignOutAlt, FaEye, FaPlus, FaChartBar, FaBell } from 'react-icons/fa';
import { getBloodInventory, getAllReports, isAuthenticated, getUser, logout } from '../utils/api';
import BloodInventoryDetail from './BloodInventoryDetail';

const Dashboard = () => {
  const navigate = useNavigate();
  const [bloodInventory, setBloodInventory] = useState([]);
  const [reports, setReports] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportsError, setReportsError] = useState('');
  const [showBloodDetail, setShowBloodDetail] = useState(false);
  const [selectedBloodType, setSelectedBloodType] = useState(null);
  const [bloodInventoryDetail, setBloodInventoryDetail] = useState([]);
  const [showAddBloodModal, setShowAddBloodModal] = useState(false);
  const [addBloodForm, setAddBloodForm] = useState({ bloodType: '', volume: '', bloodDetailDate: '', note: '' });
  const [addBloodLoading, setAddBloodLoading] = useState(false);
  const [addBloodError, setAddBloodError] = useState('');

  useEffect(() => {
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
    fetchHospitals();
  }, [navigate]);

  const fetchBloodInventory = async () => {
    try {
      setLoading(true);
      const data = await getBloodInventory();
      setBloodInventory(data || []);
    } catch (err) {
      console.error('Error fetching blood inventory:', err);
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
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

  const fetchHospitals = async () => {
    try {
      const response = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Hospital/GetAll');
      if (!response.ok) throw new Error('Không thể tải danh sách bệnh viện');
      const data = await response.json();
      setHospitals(data || []);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      setHospitals([]);
    }
  };

  const getHospitalName = (hospitalId) => {
    const hospital = hospitals.find(h => h.id === hospitalId || h.hospitalId === hospitalId);
    return hospital ? (hospital.name || hospital.hospitalName) : `ID: ${hospitalId}`;
  };

  // Calculate blood statistics
  const calculateBloodStats = () => {
    // Chỉ tính những máu còn trong kho (bloodBankStatus === 'Còn')
    const availableBlood = bloodInventory.filter(item => item.bloodBankStatus === 'Còn');
    
    const totalVolume = availableBlood.reduce((sum, item) => sum + (item.bloodVolumeTotal || 0), 0);
    const availableVolume = availableBlood.reduce((sum, item) => sum + (item.bloodVolumeTotal || 0), 0);
    const lowStockTypes = bloodInventory.filter(item => item.bloodBankStatus === 'Hết').length;
    
    return { totalVolume, availableVolume, lowStockTypes };
  };

  const bloodStats = calculateBloodStats();

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaHospital className="text-white text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Cần đăng nhập</h2>
          <p className="text-gray-600 mb-6">Vui lòng đăng nhập để truy cập Dashboard</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle className="text-white text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Không có quyền truy cập</h2>
          <p className="text-gray-600 mb-6">Bạn không có quyền truy cập Dashboard</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Xin chào, {user.name || user.email}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors">
                <FaBell className="text-xl" />
              </button>
              <button 
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex items-center px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-gray-700 hover:text-red-600"
              >
                <FaSignOutAlt className="mr-2" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {(error || reportsError) && (
          <div className="mb-6 space-y-3">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <FaExclamationCircle className="text-red-500 mr-3 flex-shrink-0" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}
            {reportsError && (
              <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <FaExclamationCircle className="text-red-500 mr-3 flex-shrink-0" />
                  <p className="text-red-700 font-medium">{reportsError}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Máu trong kho</p>
                <p className="text-2xl font-bold text-blue-600">
                  {loading ? (
                    <FaSpinner className="animate-spin text-xl" />
                  ) : (
                    `${(bloodStats.totalVolume / 1000).toFixed(1)}L`
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Còn trong kho</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <FaTint className="text-white text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Máu sẵn sàng</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? (
                    <FaSpinner className="animate-spin text-xl" />
                  ) : (
                    `${(bloodStats.availableVolume / 1000).toFixed(1)}L`
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Có thể sử dụng</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <FaUserPlus className="text-white text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Nhóm máu hết</p>
                <p className="text-2xl font-bold text-red-600">
                  {loading ? (
                    <FaSpinner className="animate-spin text-xl" />
                  ) : (
                    bloodStats.lowStockTypes
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Cần bổ sung</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <FaExclamationTriangle className="text-white text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Báo cáo mới</p>
                <p className="text-2xl font-bold text-purple-600">
                  {reportsLoading ? (
                    <FaSpinner className="animate-spin text-xl" />
                  ) : (
                    reports.filter(r => (r.status || r.reportStatus) === 'Completed').length
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Đã hoàn thành</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FaFileAlt className="text-white text-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Admin Only */}
        {user?.role === 'Admin' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <FaChartBar className="text-orange-500 mr-3" />
                Quản lý nhanh
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/admin/events')}
                className="group p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200 hover:shadow-md transition-all duration-300 text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FaCalendarAlt className="text-white text-sm" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Quản lý sự kiện</h3>
                <p className="text-gray-600 text-sm">Tạo và quản lý sự kiện hiến máu</p>
              </button>

              <button
                onClick={() => navigate('/blog-management')}
                className="group p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-all duration-300 text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FaFileAlt className="text-white text-sm" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Quản lý blog</h3>
                <p className="text-gray-600 text-sm">Tạo và quản lý bài viết</p>
              </button>

              <button
                onClick={() => navigate('/blood-donation-management')}
                className="group p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-md transition-all duration-300 text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FaTint className="text-white text-sm" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Quản lý hiến máu</h3>
                <p className="text-gray-600 text-sm">Theo dõi quá trình hiến máu</p>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Blood Inventory */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <FaTint className="text-purple-500 mr-3" />
                Tổng quan kho máu
              </h2>
              <button
                onClick={() => setShowAddBloodModal(true)}
                className="flex items-center px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-md transition-all duration-200 text-sm"
              >
                <FaPlus className="mr-2 text-xs" />
                Thêm máu
              </button>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="animate-spin text-2xl text-purple-600 mr-3" />
                <span className="text-gray-600">Đang tải...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {bloodInventory.map((item, index) => {
                  // Xác định màu sắc và trạng thái dựa trên bloodBankStatus
                  const isAvailable = item.bloodBankStatus === 'Còn';
                  const statusColor = isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
                  const statusText = isAvailable ? 'Còn máu' : 'Hết máu';
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                          {item.bloodType}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.bloodVolumeTotal.toLocaleString()} ml
                          </p>
                          <p className="text-sm text-gray-500">
                            {statusText}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/blood-inventory', {
                              method: 'GET',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${localStorage.getItem('token')}`,
                              },
                            });
                            if (!response.ok) throw new Error('Không thể tải chi tiết kho máu');
                            const detailData = await response.json();
                            setSelectedBloodType(item.bloodType);
                            const filteredInventory = (detailData.inventory || []).filter(
                              detail => detail.bloodType === item.bloodType
                            );
                            setBloodInventoryDetail(filteredInventory);
                            setShowBloodDetail(true);
                          } catch (err) {
                            console.error('Error fetching blood inventory detail:', err);
                            alert('Có lỗi khi tải chi tiết kho máu');
                          }
                        }}
                        className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <FaEye className="mr-1" />
                        Chi tiết
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reports */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <FaFileAlt className="text-indigo-500 mr-3" />
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
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="animate-spin text-2xl text-indigo-600 mr-3" />
                <span className="text-gray-600">Đang tải báo cáo...</span>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8">
                <FaFileAlt className="text-4xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Chưa có báo cáo</h3>
                <p className="text-gray-500 text-sm">Báo cáo sẽ được tạo tự động</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {reports.slice(0, 5).map((report) => (
                  <div key={report.reportId || report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-medium text-gray-900">
                          #{report.reportId || report.id}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (report.status || report.reportStatus) === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.status || report.reportStatus || 'Đang xử lý'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-indigo-600 mb-1">
                        {report.reportType || report.type || 'Báo cáo tổng hợp'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(report.createdDate || report.date)}
                      </p>
                    </div>
                    <button className="flex items-center text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors">
                      <FaDownload className="mr-1" />
                      Tải
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {showBloodDetail && (
          <BloodInventoryDetail
            bloodInventory={bloodInventoryDetail}
            selectedBloodType={selectedBloodType}
            onClose={() => setShowBloodDetail(false)}
            getHospitalName={getHospitalName}
          />
        )}

        {showAddBloodModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full relative">
              <button 
                onClick={() => setShowAddBloodModal(false)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold transition-colors"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-6 text-center text-gray-800">Thêm lượng máu mới</h2>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setAddBloodLoading(true);
                setAddBloodError('');
                try {
                  const res = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/blood-inventory', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify(addBloodForm),
                  });
                  if (!res.ok) throw new Error(await res.text());
                  setShowAddBloodModal(false);
                  setAddBloodForm({ bloodType: '', volume: '', bloodDetailDate: '', note: '' });
                  fetchBloodInventory();
                } catch (err) {
                  setAddBloodError(err.message);
                } finally {
                  setAddBloodLoading(false);
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nhóm máu</label>
                    <input 
                      required 
                      value={addBloodForm.bloodType} 
                      onChange={e => setAddBloodForm(f => ({ ...f, bloodType: e.target.value }))} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                      placeholder="A+" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thể tích (ml)</label>
                    <input 
                      required 
                      type="number" 
                      min="1" 
                      value={addBloodForm.volume} 
                      onChange={e => setAddBloodForm(f => ({ ...f, volume: e.target.value }))} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                      placeholder="1000" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày nhập</label>
                    <input 
                      required 
                      type="date" 
                      value={addBloodForm.bloodDetailDate} 
                      onChange={e => setAddBloodForm(f => ({ ...f, bloodDetailDate: e.target.value }))} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                    <input 
                      value={addBloodForm.note} 
                      onChange={e => setAddBloodForm(f => ({ ...f, note: e.target.value }))} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                      placeholder="Ghi chú (nếu có)" 
                    />
                  </div>
                  {addBloodError && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                      {addBloodError}
                    </div>
                  )}
                  <button 
                    type="submit" 
                    disabled={addBloodLoading} 
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
                  >
                    {addBloodLoading ? 'Đang thêm...' : 'Thêm vào kho máu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 