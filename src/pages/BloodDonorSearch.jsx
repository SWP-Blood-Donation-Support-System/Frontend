import { useState } from 'react';
import { FaSearch, FaMapMarkerAlt, FaTint, FaPhone, FaEnvelope } from 'react-icons/fa';
import axios from 'axios';

const BloodDonorSearch = () => {
  const [bloodType, setBloodType] = useState('');
  const [distance, setDistance] = useState(10);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Vui lòng đăng nhập để sử dụng tính năng này.');
      setLoading(false);
      return;
    }
    
    try {
      let response;
      const axiosConfig = {
        headers: { 
          'Cache-Control': 'no-cache',
          'Authorization': `Bearer ${token}`
        }
      };
      if (bloodType) {
        response = await axios.get(
          '/api/Search/requests/byBloodType',
          {
            ...axiosConfig,
            params: { bloodType }
          }
        );
      } else {
        response = await axios.get(
          '/api/Search/requests/byBloodType',
          axiosConfig
        );
      }
      setSearchResults(response.data || []);
    } catch {
      setError('Có lỗi xảy ra khi tìm kiếm.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Tìm kiếm người hiến máu</h1>

      {/* Search Controls */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhóm máu
            </label>
            <select
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              className="input"
            >
              <option value="">Tất cả nhóm máu</option>
              {bloodTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Khoảng cách (km)
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-600">{distance} km</div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="btn btn-primary w-full"
              disabled={loading}
            >
              <FaSearch className="inline-block mr-2" />
              {loading ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="text-red-600 text-center mb-4">{error}</div>}

      {/* Search Results */}
      <div className="space-y-4">
        {searchResults.length === 0 && !loading && (
          <div className="text-center text-gray-500">Không có kết quả phù hợp.</div>
        )}
        {searchResults.map((result) => (
          <div key={result.id} className="card">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{result.name}</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <FaTint className="mr-2" />
                    <span>Nhóm máu: {result.bloodType}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>{result.location} ({result.distance} km)</span>
                  </div>
                  <div className="text-gray-600">
                    Lần hiến máu gần nhất: {result.lastDonation}
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-0 md:ml-4 space-y-2">
                <a
                  href={`tel:${result.contact?.phone}`}
                  className="flex items-center text-gray-600 hover:text-primary-600"
                >
                  <FaPhone className="mr-2" />
                  {result.contact?.phone}
                </a>
                <a
                  href={`mailto:${result.contact?.email}`}
                  className="flex items-center text-gray-600 hover:text-primary-600"
                >
                  <FaEnvelope className="mr-2" />
                  {result.contact?.email}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BloodDonorSearch; 