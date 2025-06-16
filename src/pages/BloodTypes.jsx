import { useState } from 'react';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';

const BloodTypes = () => {
  const [selectedType, setSelectedType] = useState(null);

  const bloodTypes = {
    'A+': {
      canReceive: ['A+', 'A-', 'O+', 'O-'],
      canDonateTo: ['A+', 'AB+'],
      description: 'Nhóm máu A+ là một trong những nhóm máu phổ biến nhất. Người có nhóm máu A+ có thể nhận máu từ người có nhóm máu A+ và A-, O+ và O-.',
    },
    'A-': {
      canReceive: ['A-', 'O-'],
      canDonateTo: ['A+', 'A-', 'AB+', 'AB-'],
      description: 'Nhóm máu A- là nhóm máu hiếm. Người có nhóm máu A- chỉ có thể nhận máu từ người có nhóm máu A- và O-.',
    },
    'B+': {
      canReceive: ['B+', 'B-', 'O+', 'O-'],
      canDonateTo: ['B+', 'AB+'],
      description: 'Nhóm máu B+ là nhóm máu phổ biến. Người có nhóm máu B+ có thể nhận máu từ người có nhóm máu B+ và B-, O+ và O-.',
    },
    'B-': {
      canReceive: ['B-', 'O-'],
      canDonateTo: ['B+', 'B-', 'AB+', 'AB-'],
      description: 'Nhóm máu B- là nhóm máu hiếm. Người có nhóm máu B- chỉ có thể nhận máu từ người có nhóm máu B- và O-.',
    },
    'AB+': {
      canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      canDonateTo: ['AB+'],
      description: 'Nhóm máu AB+ là nhóm máu hiếm. Người có nhóm máu AB+ có thể nhận máu từ tất cả các nhóm máu khác.',
    },
    'AB-': {
      canReceive: ['A-', 'B-', 'AB-', 'O-'],
      canDonateTo: ['AB+', 'AB-'],
      description: 'Nhóm máu AB- là nhóm máu hiếm nhất. Người có nhóm máu AB- có thể nhận máu từ người có nhóm máu A-, B-, AB- và O-.',
    },
    'O+': {
      canReceive: ['O+', 'O-'],
      canDonateTo: ['A+', 'B+', 'AB+', 'O+'],
      description: 'Nhóm máu O+ là nhóm máu phổ biến nhất. Người có nhóm máu O+ chỉ có thể nhận máu từ người có nhóm máu O+ và O-.',
    },
    'O-': {
      canReceive: ['O-'],
      canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      description: 'Nhóm máu O- là nhóm máu hiếm. Người có nhóm máu O- chỉ có thể nhận máu từ người có nhóm máu O-.',
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Thông tin về các nhóm máu</h1>
      
      {/* Blood Type Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {Object.keys(bloodTypes).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`p-4 rounded-lg text-center font-bold text-lg transition-colors duration-200 ${
              selectedType === type
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Selected Blood Type Information */}
      {selectedType && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Nhóm máu {selectedType}</h2>
          <p className="text-gray-600 mb-6">{bloodTypes[selectedType].description}</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Can Receive From */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Có thể nhận máu từ:</h3>
              <div className="space-y-2">
                {bloodTypes[selectedType].canReceive.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <FaArrowLeft className="text-primary-500" />
                    <span className="font-medium">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Can Donate To */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Có thể hiến máu cho:</h3>
              <div className="space-y-2">
                {bloodTypes[selectedType].canDonateTo.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <FaArrowRight className="text-primary-500" />
                    <span className="font-medium">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Information */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Lưu ý quan trọng</h2>
        <div className="card">
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Trước khi truyền máu, cần kiểm tra kỹ lưỡng sự tương thích giữa người cho và người nhận.</li>
            <li>Ngoài nhóm máu, cần kiểm tra các yếu tố khác như Rh, kháng thể, và các bệnh truyền nhiễm.</li>
            <li>Trong trường hợp khẩn cấp, nhóm máu O- có thể được sử dụng cho tất cả các nhóm máu khác.</li>
            <li>Nhóm máu AB+ có thể nhận máu từ tất cả các nhóm máu khác.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BloodTypes; 