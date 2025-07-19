import React, { useState, useEffect } from 'react';
import { getAuthToken } from '../utils/api';
import { FaTint, FaUser, FaHospital, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCalendarAlt, FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaClock, FaRoute, FaUserFriends, FaHeartbeat, FaShieldAlt, FaLocationArrow } from 'react-icons/fa';
import Toast from '../components/Toast';

const AdminBloodSearch = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({
    bloodType: '',
    location: '',
    sortBy: 'distance',
    sortOrder: 'asc'
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'requests') {
        await fetchRequests();
      } else {
        await fetchDonors();
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Không có token xác thực');
      }

      const response = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Search/requests/v2', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Lỗi API: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Admin Blood Search - Requests API Response:', data);
      const requestsData = data.bloodRequests || data || [];
      setRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(`Lỗi tải danh sách người cần máu: ${err.message}`);
      setRequests([]);
    }
  };

  const fetchDonors = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Không có token xác thực');
      }
      const response = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Search/donors/v2', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi API: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      console.log('Admin Blood Search - Donors API Response:', data);
      const donorsData = Array.isArray(data.donors) ? data.donors : (Array.isArray(data.bloodDonors) ? data.bloodDonors : []);
      setDonors(donorsData);
    } catch (err) {
      setError(`Lỗi tải danh sách người hiến máu: ${err.message}`);
      setDonors([]);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedData = (data) => {
    if (!data || data.length === 0) return data;

    return [...data].sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case 'distance': {
          // Extract numeric value from distanceText (e.g., "19 km" -> 19)
          const aDistance = a.distanceText ? parseFloat(a.distanceText.split(' ')[0]) : 0;
          const bDistance = b.distanceText ? parseFloat(b.distanceText.split(' ')[0]) : 0;
          aValue = isNaN(aDistance) ? 0 : aDistance;
          bValue = isNaN(bDistance) ? 0 : bDistance;
          break;
        }
        case 'bloodType':
          aValue = a.bloodType || '';
          bValue = b.bloodType || '';
          break;
        case 'date':
          aValue = new Date(a.emergencyDate || a.dateOfBirth || 0);
          bValue = new Date(b.emergencyDate || b.dateOfBirth || 0);
          break;
        default:
          aValue = a.distanceText ? parseFloat(a.distanceText.split(' ')[0]) : 0;
          bValue = b.distanceText ? parseFloat(b.distanceText.split(' ')[0]) : 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const getFilteredData = (data) => {
    if (!data || data.length === 0) return data;

    return data.filter(item => {
      const matchesBloodType = !filters.bloodType || 
        (item.bloodType && item.bloodType.toLowerCase().includes(filters.bloodType.toLowerCase()));
      
      const matchesLocation = !filters.location || 
        (item.hospitalName && item.hospitalName.toLowerCase().includes(filters.location.toLowerCase())) ||
        (item.hospitalAddress && item.hospitalAddress.toLowerCase().includes(filters.location.toLowerCase())) ||
        (item.address && item.address.toLowerCase().includes(filters.location.toLowerCase()));

      return matchesBloodType && matchesLocation;
    });
  };

  const currentData = activeTab === 'requests' ? requests : donors;
  const filteredData = getFilteredData(currentData);
  const sortedData = getSortedData(filteredData);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã xét duyệt':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Chờ xét duyệt':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Từ chối':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Sẵn sàng hiến máu':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBloodTypeColor = (bloodType) => {
    const colors = {
      'A+': 'bg-red-100 text-red-800 border-red-200',
      'A-': 'bg-red-50 text-red-700 border-red-100',
      'B+': 'bg-blue-100 text-blue-800 border-blue-200',
      'B-': 'bg-blue-50 text-blue-700 border-blue-100',
      'AB+': 'bg-purple-100 text-purple-800 border-purple-200',
      'AB-': 'bg-purple-50 text-purple-700 border-purple-100',
      'O+': 'bg-green-100 text-green-800 border-green-200',
      'O-': 'bg-green-50 text-green-700 border-green-100'
    };
    return colors[bloodType] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <FaHeartbeat className="text-red-600" />
                Tìm kiếm máu
              </h1>
              <p className="text-lg text-gray-600">
                Quản lý và tìm kiếm người cần máu và người hiến máu
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">{requests.length + donors.length}</div>
              <div className="text-sm text-gray-600">Tổng số kết quả</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Người cần máu</p>
                <p className="text-3xl font-bold text-red-600">{requests.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Người hiến máu</p>
                <p className="text-3xl font-bold text-green-600">{donors.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaUserFriends className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-3 ${
                activeTab === 'requests'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <FaExclamationTriangle />
              Người cần máu ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('donors')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-3 ${
                activeTab === 'donors'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <FaCheckCircle />
              Người hiến máu ({donors.length})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nhóm máu</label>
              <div className="relative">
                <FaTint className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo nhóm máu..."
                  value={filters.bloodType}
                  onChange={(e) => handleFilterChange('bloodType', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Địa điểm</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo bệnh viện hoặc địa chỉ..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSort('distance')}
                className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                  filters.sortBy === 'distance'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaRoute />
                Khoảng cách
                {filters.sortBy === 'distance' && (
                  filters.sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />
                )}
              </button>
              <button
                onClick={() => handleSort('date')}
                className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                  filters.sortBy === 'date'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaCalendarAlt />
                Ngày
                {filters.sortBy === 'date' && (
                  filters.sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center">
              <FaExclamationTriangle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-600 mx-auto mb-4"></div>
              <div className="text-center">
                <p className="text-gray-600 text-lg font-medium">Đang tải dữ liệu...</p>
                <p className="text-gray-400 text-sm mt-2">Vui lòng chờ trong giây lát</p>
              </div>
            </div>
          </div>
        ) : sortedData.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16">
            <div className="text-center">
              <FaInfoCircle className="text-gray-400 text-6xl mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {activeTab === 'requests' 
                  ? 'Không có người cần máu nào' 
                  : 'Không có người hiến máu nào'
                }
              </h3>
              <p className="text-gray-500">
                {error ? 'Vui lòng kiểm tra lại kết nối hoặc thử lại sau' : 'Hãy thử thay đổi bộ lọc tìm kiếm'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeTab === 'requests' 
              ? sortedData.map((item, index) => (
                  <div key={item.emergencyId || item.id || index} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                            <FaExclamationTriangle className="text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.username}</h3>
                            <p className="text-sm text-gray-600">Yêu cầu khẩn cấp</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.emergencyStatus)}`}>
                          {item.emergencyStatus}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      {/* Blood Type & Units */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getBloodTypeColor(item.bloodType)}`}>
                            <FaTint className="mr-1" />
                            {item.bloodType}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600">{item.requiredUnits}</div>
                          <div className="text-sm text-gray-600">đơn vị</div>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaCalendarAlt className="text-gray-400" />
                        <span className="text-sm">
                          {item.emergencyDate ? new Date(item.emergencyDate).toLocaleDateString('vi-VN') : 'Không có ngày'}
                        </span>
                      </div>

                      {/* Hospital Info */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <FaHospital className="text-blue-600 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">{item.hospitalName}</h4>
                            <p className="text-sm text-gray-600 mt-1">{item.hospitalAddress}</p>
                            {item.hospitalPhone && (
                              <div className="flex items-center gap-2 mt-2">
                                <FaPhone className="text-gray-400 text-xs" />
                                <a href={`tel:${item.hospitalPhone}`} className="text-sm text-blue-600 hover:text-blue-800">
                                  {item.hospitalPhone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Distance & Duration */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaRoute className="text-gray-400" />
                          <span>{item.distanceText}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaClock className="text-gray-400" />
                          <span>{item.durationText}</span>
                        </div>
                      </div>

                      {/* Note */}
                      {item.emergencyNote && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                          <p className="text-sm text-yellow-800">{item.emergencyNote}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              : sortedData.map((item, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                            <FaUser className="text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.fullName}</h3>
                            <p className="text-sm text-gray-600">@{item.username}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.profileStatus)}`}>
                          {item.profileStatus}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      {/* Blood Type */}
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getBloodTypeColor(item.bloodType)}`}>
                          <FaTint className="mr-1" />
                          {item.bloodType}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.status)}`}>
                          <FaShieldAlt className="mr-1" />
                          {item.status}
                        </span>
                      </div>

                      {/* Personal Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaCalendarAlt className="text-gray-400" />
                          <span>{item.dateOfBirth ? new Date(item.dateOfBirth).toLocaleDateString('vi-VN') : 'Không có ngày sinh'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaUser className="text-gray-400" />
                          <span>{item.gender}</span>
                        </div>
                        {item.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <FaPhone className="text-gray-400" />
                            <a href={`tel:${item.phone}`} className="text-blue-600 hover:text-blue-800">
                              {item.phone}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Address */}
                      {item.address && (
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="flex items-start gap-2">
                            <FaMapMarkerAlt className="text-gray-400 mt-1" />
                            <p className="text-sm text-gray-600">{item.address}</p>
                          </div>
                        </div>
                      )}

                      {/* Distance & Duration */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaRoute className="text-gray-400" />
                          <span>{item.distanceText}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaClock className="text-gray-400" />
                          <span>{item.durationText}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBloodSearch; 