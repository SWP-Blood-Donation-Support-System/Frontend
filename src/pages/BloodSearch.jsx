import { useState, useEffect } from 'react';
import { FaSearch, FaMapMarkerAlt, FaTint, FaHospital, FaUser, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
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
      if (!response.ok) throw new Error('Không thể tải danh sách yêu cầu máu');
      const data = await response.json();
      let filteredResults = data.bloodRequests || [];
      if (filters.bloodType !== 'Tất cả') {
        filteredResults = filteredResults.filter(result => result.bloodType === filters.bloodType);
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 py-4 px-2">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 rounded-full p-2 w-10 h-10 shadow mb-2">
            <FaSearch className="text-white text-base" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Tìm Kiếm Người Cần Máu</h1>
          <p className="text-gray-500 text-xs mb-2">Danh sách yêu cầu máu được sắp xếp theo khoảng cách</p>
          <div className="bg-blue-50 border border-blue-100 rounded px-2 py-1 inline-flex items-center text-xs text-blue-800">
            <FaMapMarkerAlt className="text-blue-600 mr-1" />
            <span>Điểm tham chiếu: 7 Đ. D1, Long Thạnh Mỹ, Thủ Đức</span>
          </div>
        </div>

        {/* Filter Section */}
        {isAllowed && (
          <div className="bg-white rounded-lg shadow p-3 mb-4 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
              {/* Blood Type Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nhóm máu</label>
                <select
                  value={filters.bloodType}
                  onChange={(e) => handleFilterChange('bloodType', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-400"
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Khoảng cách tối đa</label>
                <select
                  value={filters.maxDistance}
                  onChange={(e) => handleFilterChange('maxDistance', parseInt(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option value={10}>Dưới 10km</option>
                  <option value={20}>Dưới 20km</option>
                  <option value={50}>Dưới 50km</option>
                  <option value={100}>Dưới 100km</option>
                  <option value={200}>Dưới 200km</option>
                </select>
              </div>
              {/* Search Button */}
              <div>
                <button
                  onClick={handleSearch}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 rounded text-sm flex items-center justify-center space-x-1 transition-all"
                >
                  <FaSearch className="text-xs" />
                  <span>Tìm kiếm</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 flex items-center text-sm text-red-700">
            <FaInfoCircle className="mr-2" />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded shadow p-4 text-center text-sm">Đang tải dữ liệu...</div>
        )}

        {/* No Results */}
        {hasSearched && !loading && searchResults.length === 0 && (
          <div className="bg-white rounded shadow p-4 text-center text-sm">
            <FaInfoCircle className="text-gray-400 text-xl mx-auto mb-1" />
            <div className="font-semibold text-gray-700 mb-1">Không có kết quả</div>
            <div className="text-gray-500">Hiện tại không có yêu cầu máu nào phù hợp.</div>
          </div>
        )}

        {/* Search Results */}
        {!loading && searchResults.length > 0 && (
          <div className="space-y-3 mt-2">
            {searchResults.map((result) => (
              <div key={result.emergencyId || result.id} className="bg-white rounded-lg shadow border border-gray-100 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 hover:shadow-md transition-all">
                {/* Left: Blood Info */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="bg-red-100 rounded-full p-2 flex items-center justify-center">
                    <FaTint className="text-red-500 text-base" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-bold text-red-600 leading-tight">{result.bloodType}</div>
                    <div className="text-xs text-gray-500 truncate">{result.requiredUnits} ml</div>
                  </div>
                </div>
                {/* Center: Hospital Info */}
                <div className="flex-1 min-w-0 md:pl-4">
                  <div className="font-semibold text-gray-900 text-sm truncate">{result.hospitalName}</div>
                  <div className="text-xs text-gray-500 truncate">{result.hospitalAddress}</div>
                  <div className="text-xs text-gray-400">{result.distanceText} • {result.durationText}</div>
                </div>
                {/* Right: Status & Note */}
                <div className="flex flex-col items-end min-w-[120px]">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-1 ${
                    result.emergencyStatus === 'Đã xét duyệt' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <FaCheckCircle className="mr-1 text-xs" />
                    {result.emergencyStatus}
                  </span>
                  {result.emergencyNote && (
                    <div className="text-xs text-yellow-700 bg-yellow-50 rounded px-2 py-1 mt-1 max-w-[180px] truncate" title={result.emergencyNote}>
                      {result.emergencyNote}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodSearch;