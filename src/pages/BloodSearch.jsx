import { useState } from 'react';
import { FaSearch, FaMapMarkerAlt, FaTint, FaPhone, FaEnvelope } from 'react-icons/fa';

const BloodSearch = () => {
  const [searchType, setSearchType] = useState('donor'); // 'donor' or 'recipient'
  const [bloodType, setBloodType] = useState('');
  const [distance, setDistance] = useState(10);
  const [searchResults, setSearchResults] = useState([]);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Mock data for demonstration
  const mockDonors = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      bloodType: 'A+',
      location: 'Quận 1, TP.HCM',
      distance: 2.5,
      lastDonation: '2024-01-15',
      contact: {
        phone: '0123456789',
        email: 'nguyenvana@email.com',
      },
    },
    {
      id: 2,
      name: 'Trần Thị B',
      bloodType: 'O+',
      location: 'Quận 3, TP.HCM',
      distance: 4.8,
      lastDonation: '2024-02-01',
      contact: {
        phone: '0987654321',
        email: 'tranthib@email.com',
      },
    },
  ];

  const mockRecipients = [
    {
      id: 1,
      name: 'Lê Văn C',
      bloodType: 'B+',
      location: 'Quận 5, TP.HCM',
      distance: 3.2,
      urgency: 'Khẩn cấp',
      contact: {
        phone: '0123456789',
        email: 'levanc@email.com',
      },
    },
    {
      id: 2,
      name: 'Phạm Thị D',
      bloodType: 'AB+',
      location: 'Quận 7, TP.HCM',
      distance: 7.5,
      urgency: 'Bình thường',
      contact: {
        phone: '0987654321',
        email: 'phamthid@email.com',
      },
    },
  ];

  const handleSearch = () => {
    // TODO: Implement actual search functionality with API
    setSearchResults(searchType === 'donor' ? mockDonors : mockRecipients);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Tìm kiếm máu</h1>

      {/* Search Controls */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setSearchType('donor')}
                className={`flex-1 btn ${
                  searchType === 'donor'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Người hiến máu
              </button>
              <button
                onClick={() => setSearchType('recipient')}
                className={`flex-1 btn ${
                  searchType === 'recipient'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Người cần máu
              </button>
            </div>
          </div>

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
            >
              <FaSearch className="inline-block mr-2" />
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-4">
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
                  {searchType === 'donor' && (
                    <div className="text-gray-600">
                      Lần hiến máu gần nhất: {result.lastDonation}
                    </div>
                  )}
                  {searchType === 'recipient' && (
                    <div className="text-red-600 font-medium">
                      Mức độ: {result.urgency}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 md:mt-0 md:ml-4 space-y-2">
                <a
                  href={`tel:${result.contact.phone}`}
                  className="flex items-center text-gray-600 hover:text-primary-600"
                >
                  <FaPhone className="mr-2" />
                  {result.contact.phone}
                </a>
                <a
                  href={`mailto:${result.contact.email}`}
                  className="flex items-center text-gray-600 hover:text-primary-600"
                >
                  <FaEnvelope className="mr-2" />
                  {result.contact.email}
                </a>
              </div>
            </div>
          </div>
        ))}

        {searchResults.length === 0 && (
          <div className="text-center text-gray-600 py-8">
            Không tìm thấy kết quả phù hợp
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodSearch; 