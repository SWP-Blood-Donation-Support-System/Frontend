import { useState, useEffect } from 'react';
import { FaSearch, FaMapMarkerAlt, FaTint, FaPhone, FaEnvelope, FaHospital, FaUser, FaCalendarAlt, FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
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
        const distanceStr = result.distanceText || '';
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
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-full p-3 w-12 h-12 mx-auto flex items-center justify-center mb-3">
                <FaSearch className="text-white text-lg" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Bộ Lọc Tìm Kiếm</h3>
              <p className="text-gray-600">Tùy chỉnh tiêu chí tìm kiếm yêu cầu máu</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Blood Type Filter */}
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-red-100 rounded-full p-2">
                    <FaTint className="text-red-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Nhóm Máu
                    </label>
                    <p className="text-xs text-gray-500">Chọn nhóm máu cần tìm</p>
                  </div>
                </div>
                <select
                  value={filters.bloodType}
                  onChange={(e) => handleFilterChange('bloodType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 hover:bg-white transition-colors duration-200"
                >
                  <option value="Tất cả">🩸 Tất cả nhóm máu</option>
                  <option value="A+">🩸 A+</option>
                  <option value="A-">🩸 A-</option>
                  <option value="B+">🩸 B+</option>
                  <option value="B-">🩸 B-</option>
                  <option value="AB+">🩸 AB+</option>
                  <option value="AB-">🩸 AB-</option>
                  <option value="O+">🩸 O+</option>
                  <option value="O-">🩸 O-</option>
                </select>
              </div>

              {/* Distance Filter */}
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-blue-100 rounded-full p-2">
                    <FaMapMarkerAlt className="text-blue-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Khoảng Cách
                    </label>
                    <p className="text-xs text-gray-500">Bán kính tìm kiếm tối đa</p>
                  </div>
                </div>
                <select
                  value={filters.maxDistance}
                  onChange={(e) => handleFilterChange('maxDistance', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors duration-200"
                >
                  <option value={10}>📍 Dưới 10km</option>
                  <option value={20}>📍 Dưới 20km</option>
                  <option value={50}>📍 Dưới 50km</option>
                  <option value={100}>📍 Dưới 100km</option>
                  <option value={200}>📍 Dưới 200km</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-green-100 rounded-full p-2">
                    <FaSearch className="text-green-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Tìm Kiếm
                    </label>
                    <p className="text-xs text-gray-500">Thực hiện tìm kiếm</p>
                  </div>
                </div>
                <button
                  onClick={handleSearch}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaSearch className="text-lg" />
                  <span>Tìm Kiếm Ngay</span>
                </button>
              </div>
            </div>

            {/* Current Filters Display */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="text-sm text-gray-500">Bộ lọc hiện tại:</span>
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  🩸 {filters.bloodType}
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  📍 Dưới {filters.maxDistance}km
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  ✅ Đã xét duyệt
                </span>
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

        {/* No Results */}
        {hasSearched && !loading && searchResults.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FaInfoCircle className="text-gray-400 text-2xl mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Không có kết quả</h3>
            <p className="text-gray-600 text-sm mb-4">Hiện tại không có yêu cầu máu nào phù hợp với tiêu chí tìm kiếm.</p>
            
            {/* Debug Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Thông tin tìm kiếm:</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <div>• Điểm tham chiếu: 7 Đ. D1, Long Thạnh Mỹ, Thủ Đức</div>
                <div>• Khoảng cách tối đa: {filters.maxDistance}km</div>
                <div>• Nhóm máu: {filters.bloodType}</div>
                <div>• Trạng thái: Đã xét duyệt</div>
                <div>• Tổng số yêu cầu: 0</div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>💡 Gợi ý:</p>
              <ul className="text-left mt-2 space-y-1">
                <li>• Thử tăng khoảng cách tìm kiếm</li>
                <li>• Chọn "Tất cả" nhóm máu</li>
                <li>• Liên hệ bệnh viện trực tiếp</li>
              </ul>
            </div>
          </div>
        )}

        {/* Search Results */}
        {!loading && searchResults.length > 0 && (
          <>
            {/* Results Summary */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-6 mb-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <FaSearch className="text-green-600 text-lg" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Kết quả tìm kiếm
                    </h3>
                    <p className="text-sm text-gray-600">
                      Tìm thấy {searchResults.length} yêu cầu máu phù hợp
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Khoảng cách tối đa</div>
                  <div className="text-2xl font-bold text-green-600">{filters.maxDistance}km</div>
                </div>
              </div>
            </div>

            {/* Blood Request Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchResults.map((result) => (
                <div key={result.emergencyId || result.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white/20 rounded-full p-2">
                          <FaTint className="text-white text-lg" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold">Yêu cầu #{result.emergencyId || result.id}</h4>
                          <p className="text-red-100 text-sm">Cần máu khẩn cấp</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{result.bloodType}</div>
                        <div className="text-xs text-red-100">Nhóm máu</div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Blood Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-red-100 rounded-full p-2">
                          <FaTint className="text-red-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Số lượng cần</div>
                          <div className="text-xl font-bold text-red-600">{result.requiredUnits} ml</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Khoảng cách</div>
                        <div className="text-lg font-semibold text-gray-900">{result.distanceText}</div>
                        <div className="text-xs text-gray-400">{result.durationText}</div>
                      </div>
                    </div>

                    {/* Hospital Info */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 rounded-full p-2">
                          <FaHospital className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 mb-1">{result.hospitalName}</h5>
                          <p className="text-sm text-gray-600 mb-2">{result.hospitalAddress}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>📞 {result.hospitalPhone}</span>
                            <span>📅 {new Date(result.emergencyDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-gray-100 rounded-full p-2">
                          <FaUser className="text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 mb-1">Thông tin người yêu cầu</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-500">👤 Người yêu cầu:</span>
                              <span className="font-medium text-gray-900">{result.username}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-500">📅 Ngày yêu cầu:</span>
                              <span className="font-medium text-gray-900">{new Date(result.emergencyDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Note */}
                    {result.emergencyNote && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                        <div className="flex items-start space-x-2">
                          <FaInfoCircle className="text-yellow-600 mt-0.5" />
                          <div>
                            <h6 className="font-semibold text-yellow-800 mb-1">Ghi chú</h6>
                            <p className="text-sm text-yellow-700">{result.emergencyNote}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Status */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          result.emergencyStatus === 'Đã xét duyệt' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          <FaCheckCircle className="mr-1" />
                          {result.emergencyStatus}
                        </span>
                        <div className="text-xs text-gray-500">
                          Cập nhật: {new Date(result.emergencyDate).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BloodSearch;