import React, { useState, useEffect } from 'react';
import { getAuthToken } from '../utils/api';
import { FaTint, FaUser, FaHospital, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCalendarAlt, FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown, FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
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

      const response = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Search/requests/all', {
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
      console.log('Requests data:', data);
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
      const response = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Search/donors/all', {
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
          const aDistance = typeof a.distance === 'string' ? parseFloat(a.distance) : (a.distance || 0);
          const bDistance = typeof b.distance === 'string' ? parseFloat(b.distance) : (b.distance || 0);
          aValue = isNaN(aDistance) ? 0 : aDistance;
          bValue = isNaN(bDistance) ? 0 : bDistance;
          break;
        }
        case 'bloodType':
          aValue = a.bloodType || '';
          bValue = b.bloodType || '';
          break;
        case 'date':
          aValue = new Date(a.emergencyDate || a.lastDonationDate || 0);
          bValue = new Date(b.emergencyDate || b.lastDonationDate || 0);
          break;
        default:
          aValue = a.distance || 0;
          bValue = b.distance || 0;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent flex items-center gap-3">
            <FaTint className="text-red-600" />
            Tìm kiếm máu
          </h1>
          <p className="text-gray-600 mt-2">Quản lý và tìm kiếm người cần máu và người hiến máu</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'requests'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <FaExclamationTriangle />
              Người cần máu ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('donors')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'donors'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <FaCheckCircle />
              Người hiến máu ({donors.length})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nhóm máu</label>
              <input
                type="text"
                placeholder="Tìm theo nhóm máu..."
                value={filters.bloodType}
                onChange={(e) => handleFilterChange('bloodType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm</label>
              <input
                type="text"
                placeholder="Tìm theo bệnh viện hoặc địa chỉ..."
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSort('distance')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  filters.sortBy === 'distance'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaSort />
                Khoảng cách
                {filters.sortBy === 'distance' && (
                  filters.sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />
                )}
              </button>
              <button
                onClick={() => handleSort('date')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  filters.sortBy === 'date'
                    ? 'bg-red-600 text-white'
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
          <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-500 mr-3" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}

        {/* Content: chỉ hiện 1 bảng theo tab */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
            </div>
          ) : sortedData.length === 0 ? (
            <div className="text-center py-16">
              <FaInfoCircle className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {activeTab === 'requests' 
                  ? 'Không có người cần máu nào' 
                  : 'Không có người hiến máu nào'
                }
              </p>
              {error && (
                <p className="text-sm text-gray-400 mt-2">Vui lòng kiểm tra lại kết nối hoặc thử lại sau</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {activeTab === 'requests' ? (
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên bệnh nhân</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày yêu cầu</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhóm máu</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bệnh viện</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa chỉ BV</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liên hệ</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khoảng cách</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày sinh</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giới tính</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SĐT</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa chỉ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhóm máu</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lần hiến gần nhất</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng số lần</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khoảng cách</th>
                    </tr>
                  )}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeTab === 'requests'
                    ? sortedData.map((item, index) => (
                        <tr key={item.emergencyId || item.id || index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">{item.emergencyId || item.id}</td>
                          <td className="px-4 py-3">{item.patientName || 'Không có tên'}</td>
                          <td className="px-4 py-3">{item.emergencyDate ? new Date(item.emergencyDate).toLocaleDateString('vi-VN') : ''}</td>
                          <td className="px-4 py-3">{item.bloodType}</td>
                          <td className="px-4 py-3">{item.requiredUnits} ml</td>
                          <td className="px-4 py-3">{item.hospitalName}</td>
                          <td className="px-4 py-3">{item.hospitalAddress}</td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <a href={`tel:${item.patientPhone}`} className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800">
                                <FaPhone className="text-xs" />
                                <span>{item.patientPhone}</span>
                              </a>
                              <a href={`mailto:${item.patientEmail}`} className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800">
                                <FaEnvelope className="text-xs" />
                                <span>{item.patientEmail}</span>
                              </a>
                            </div>
                          </td>
                          <td className="px-4 py-3">{item.distance}</td>
                          <td className="px-4 py-3">
                            {item.urgency && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-800 border-yellow-200">
                                <FaExclamationTriangle className="mr-1 text-xs" />
                                {item.urgency}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    : sortedData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">{item.fullName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.dateOfBirth ? new Date(item.dateOfBirth).toLocaleDateString('vi-VN') : ''}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.gender}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.address}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.bloodType}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.profileStatus}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.lastDonationDate ? new Date(item.lastDonationDate).toLocaleDateString('vi-VN') : ''}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.totalDonations}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.distance}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{requests.length}</div>
              <div className="text-sm text-gray-600">Người cần máu</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{donors.length}</div>
              <div className="text-sm text-gray-600">Người hiến máu</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBloodSearch; 