import { useState, useEffect } from 'react';
import { FaSearch, FaMapMarkerAlt, FaTint, FaPhone, FaEnvelope, FaHospital, FaUser, FaCalendarAlt, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { getAuthToken, getUser } from '../utils/api';

const BloodSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({
    bloodType: 'Tất cả',
    maxDistance: 50
  });
  const user = getUser();
  const isAllowed = user && ['Admin', 'Staff', 'User'].includes(user.role);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (isAllowed) {
      handleSearch();
    }
  }, [isAllowed]);

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setHasSearched(true);
    try {
      const response = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Search/requests/v2', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách yêu cầu máu');
      }

      const data = await response.json();
      console.log('Blood Search API Response:', data);
      let filteredResults = data.bloodRequests || [];

      if (filters.bloodType !== 'Tất cả') {
        filteredResults = filteredResults.filter(result => 
          result.bloodType === filters.bloodType
        );
      }

      filteredResults = filteredResults.filter(result => {
        const distanceStr = result.distance || '';
        const distanceNum = parseFloat(distanceStr.replace(/[^\d.]/g, ''));
        return distanceNum <= filters.maxDistance;
      });

      setSearchResults(filteredResults);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tìm kiếm.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'khẩn cấp':
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cấp bách':
      case 'urgent':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center shadow-lg mb-4">
              <FaSearch className="text-white text-xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tìm Kiếm Người Cần Máu
          </h1>
          <p className="text-gray-600 mb-3">
            Danh sách yêu cầu máu được sắp xếp theo khoảng cách
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 inline-block">
            <div className="flex items-center space-x-2 text-sm text-blue-800">
              <FaMapMarkerAlt className="text-blue-600" />
              <span className="font-medium">Điểm tham chiếu:</span>
              <span>7 Đ. D1, Long Thạnh Mỹ, Thủ Đức</span>
            </div>
          </div>
        </div>

        {/* Permission Check */}
        {!isAllowed && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <FaExclamationTriangle className="text-red-500" />
              <div>
                <h4 className="text-red-800 font-semibold">Không có quyền truy cập</h4>
                <p className="text-red-700 text-sm">Bạn cần đăng nhập để sử dụng chức năng này.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <FaExclamationTriangle className="text-red-500" />
              <div>
                <h4 className="text-red-800 font-semibold">Có lỗi xảy ra</h4>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Section */}
        {isAllowed && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bộ lọc tìm kiếm</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Blood Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhóm máu
                </label>
                <select
                  value={filters.bloodType}
                  onChange={(e) => handleFilterChange('bloodType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="Tất cả">Tất cả</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              {/* Distance Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khoảng cách tối đa
                </label>
                <select
                  value={filters.maxDistance}
                  onChange={(e) => handleFilterChange('maxDistance', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value={10}>Dưới 10km</option>
                  <option value={20}>Dưới 20km</option>
                  <option value={50}>Dưới 50km</option>
                  <option value={100}>Dưới 100km</option>
                  <option value={200}>Dưới 200km</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <FaSearch className="text-sm" />
                  <span>Tìm kiếm</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Đang tải dữ liệu...</p>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && !loading && searchResults.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FaInfoCircle className="text-gray-400 text-2xl mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Không có kết quả</h3>
            <p className="text-gray-600 text-sm">Hiện tại không có yêu cầu máu nào.</p>
          </div>
        )}

        {/* Compact Table Layout */}
        {!loading && searchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thông tin
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nhóm máu
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số lượng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bệnh viện
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Liên hệ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khoảng cách
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchResults.map((result) => (
                    <tr key={result.emergencyId || result.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="bg-red-100 rounded-full p-2">
                            <FaUser className="text-red-600 text-sm" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              #{result.emergencyId || result.id}
                            </div>
                            <div className="text-xs text-gray-500">
                              {result.patientName || 'Không có tên'}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(result.emergencyDate).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <FaTint className="text-red-500 text-sm" />
                          <span className="text-sm font-semibold text-red-600">
                            {result.bloodType}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">
                          {result.requiredUnits} ml
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{result.hospitalName}</div>
                          <div className="text-xs text-gray-500 flex items-center space-x-1">
                            <FaMapMarkerAlt className="text-gray-400" />
                            <span>{result.hospitalAddress}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <a
                            href={`tel:${result.patientPhone}`}
                            className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
                          >
                            <FaPhone className="text-xs" />
                            <span>{result.patientPhone}</span>
                          </a>
                          <a
                            href={`mailto:${result.patientEmail}`}
                            className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
                          >
                            <FaEnvelope className="text-xs" />
                            <span>{result.patientEmail}</span>
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1">
                          <FaMapMarkerAlt className="text-gray-400 text-xs" />
                          <span className="text-sm text-gray-900">{result.distance}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {result.urgency && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(result.urgency)}`}>
                            <FaExclamationTriangle className="mr-1 text-xs" />
                            {result.urgency}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodSearch;