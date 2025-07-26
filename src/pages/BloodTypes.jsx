import { useState } from 'react';
import { FaArrowRight, FaArrowLeft, FaTint, FaHeartbeat, FaDroplet, FaSyringe } from 'react-icons/fa';

const BloodTypes = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState('whole');

  const bloodComponents = {
    whole: { name: 'Máu toàn phần', icon: FaTint, color: 'text-red-600' },
    redCells: { name: 'Hồng cầu', icon: FaHeartbeat, color: 'text-red-500' },
    platelets: { name: 'Tiểu cầu', icon: FaDroplet, color: 'text-orange-500' },
    plasma: { name: 'Huyết tương', icon: FaSyringe, color: 'text-yellow-600' }
  };

  const bloodTypes = {
    'A+': {
      description: 'Nhóm máu A+ là một trong những nhóm máu phổ biến nhất. Người có nhóm máu A+ có thể nhận máu từ người có nhóm máu A+ và A-, O+ và O-.',
      components: {
        whole: {
          canReceive: ['A+', 'A-', 'O+', 'O-'],
          canDonateTo: ['A+', 'AB+'],
          note: 'Máu toàn phần chứa tất cả các thành phần: hồng cầu, bạch cầu, tiểu cầu và huyết tương.'
        },
        redCells: {
          canReceive: ['A+', 'A-', 'O+', 'O-'],
          canDonateTo: ['A+', 'AB+'],
          note: 'Hồng cầu chứa kháng nguyên A và Rh+. Có thể nhận từ A+, A-, O+, O-.'
        },
        platelets: {
          canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          canDonateTo: ['A+', 'B+', 'AB+', 'O+'],
          note: 'Tiểu cầu có thể truyền cho bất kỳ nhóm máu nào, nhưng ưu tiên cùng nhóm.'
        },
        plasma: {
          canReceive: ['A+', 'AB+'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Huyết tương A+ chứa kháng thể anti-B. Có thể truyền cho nhiều nhóm máu.'
        }
      }
    },
    'A-': {
      description: 'Nhóm máu A- là nhóm máu hiếm. Người có nhóm máu A- chỉ có thể nhận máu từ người có nhóm máu A- và O-.',
      components: {
        whole: {
          canReceive: ['A-', 'O-'],
          canDonateTo: ['A+', 'A-', 'AB+', 'AB-'],
          note: 'Máu toàn phần A- không có kháng nguyên Rh, an toàn cho người Rh-.'
        },
        redCells: {
          canReceive: ['A-', 'O-'],
          canDonateTo: ['A+', 'A-', 'AB+', 'AB-'],
          note: 'Hồng cầu A- chỉ có kháng nguyên A, không có Rh. Rất hiếm và quý.'
        },
        platelets: {
          canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Tiểu cầu A- có thể truyền cho tất cả các nhóm máu.'
        },
        plasma: {
          canReceive: ['A+', 'A-', 'AB+', 'AB-'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Huyết tương A- chứa kháng thể anti-B và anti-Rh. Có thể truyền rộng rãi.'
        }
      }
    },
    'B+': {
      description: 'Nhóm máu B+ là nhóm máu phổ biến. Người có nhóm máu B+ có thể nhận máu từ người có nhóm máu B+ và B-, O+ và O-.',
      components: {
        whole: {
          canReceive: ['B+', 'B-', 'O+', 'O-'],
          canDonateTo: ['B+', 'AB+'],
          note: 'Máu toàn phần B+ chứa kháng nguyên B và Rh+.'
        },
        redCells: {
          canReceive: ['B+', 'B-', 'O+', 'O-'],
          canDonateTo: ['B+', 'AB+'],
          note: 'Hồng cầu B+ chứa kháng nguyên B và Rh+. Có thể nhận từ B+, B-, O+, O-.'
        },
        platelets: {
          canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          canDonateTo: ['A+', 'B+', 'AB+', 'O+'],
          note: 'Tiểu cầu B+ có thể truyền cho bất kỳ nhóm máu nào, ưu tiên cùng nhóm.'
        },
        plasma: {
          canReceive: ['B+', 'AB+'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Huyết tương B+ chứa kháng thể anti-A. Có thể truyền cho nhiều nhóm máu.'
        }
      }
    },
    'B-': {
      description: 'Nhóm máu B- là nhóm máu hiếm. Người có nhóm máu B- chỉ có thể nhận máu từ người có nhóm máu B- và O-.',
      components: {
        whole: {
          canReceive: ['B-', 'O-'],
          canDonateTo: ['B+', 'B-', 'AB+', 'AB-'],
          note: 'Máu toàn phần B- không có kháng nguyên Rh, an toàn cho người Rh-.'
        },
        redCells: {
          canReceive: ['B-', 'O-'],
          canDonateTo: ['B+', 'B-', 'AB+', 'AB-'],
          note: 'Hồng cầu B- chỉ có kháng nguyên B, không có Rh. Rất hiếm và quý.'
        },
        platelets: {
          canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Tiểu cầu B- có thể truyền cho tất cả các nhóm máu.'
        },
        plasma: {
          canReceive: ['B+', 'B-', 'AB+', 'AB-'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Huyết tương B- chứa kháng thể anti-A và anti-Rh. Có thể truyền rộng rãi.'
        }
      }
    },
    'AB+': {
      description: 'Nhóm máu AB+ là nhóm máu hiếm. Người có nhóm máu AB+ có thể nhận máu từ tất cả các nhóm máu khác.',
      components: {
        whole: {
          canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          canDonateTo: ['AB+'],
          note: 'Máu toàn phần AB+ chứa tất cả kháng nguyên A, B và Rh+. Có thể nhận từ mọi nhóm máu.'
        },
        redCells: {
          canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          canDonateTo: ['AB+'],
          note: 'Hồng cầu AB+ chứa kháng nguyên A, B và Rh+. Có thể nhận từ mọi nhóm máu.'
        },
        platelets: {
          canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          canDonateTo: ['AB+'],
          note: 'Tiểu cầu AB+ chỉ có thể truyền cho AB+, nhưng có thể nhận từ mọi nhóm máu.'
        },
        plasma: {
          canReceive: ['AB+'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Huyết tương AB+ không chứa kháng thể anti-A, anti-B. Có thể truyền cho mọi nhóm máu.'
        }
      }
    },
    'AB-': {
      description: 'Nhóm máu AB- là nhóm máu hiếm nhất. Người có nhóm máu AB- có thể nhận máu từ người có nhóm máu A-, B-, AB- và O-.',
      components: {
        whole: {
          canReceive: ['A-', 'B-', 'AB-', 'O-'],
          canDonateTo: ['AB+', 'AB-'],
          note: 'Máu toàn phần AB- chứa kháng nguyên A, B nhưng không có Rh. Rất hiếm.'
        },
        redCells: {
          canReceive: ['A-', 'B-', 'AB-', 'O-'],
          canDonateTo: ['AB+', 'AB-'],
          note: 'Hồng cầu AB- chứa kháng nguyên A, B nhưng không có Rh. Rất hiếm và quý.'
        },
        platelets: {
          canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          canDonateTo: ['AB+', 'AB-'],
          note: 'Tiểu cầu AB- có thể truyền cho AB+ và AB-, nhận từ mọi nhóm máu.'
        },
        plasma: {
          canReceive: ['AB+', 'AB-'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Huyết tương AB- không chứa kháng thể anti-A, anti-B, anti-Rh. Có thể truyền cho mọi nhóm máu.'
        }
      }
    },
    'O+': {
      description: 'Nhóm máu O+ là nhóm máu phổ biến nhất. Người có nhóm máu O+ chỉ có thể nhận máu từ người có nhóm máu O+ và O-.',
      components: {
        whole: {
          canReceive: ['O+', 'O-'],
          canDonateTo: ['A+', 'B+', 'AB+', 'O+'],
          note: 'Máu toàn phần O+ không có kháng nguyên A, B nhưng có Rh+. Có thể truyền cho nhiều nhóm máu.'
        },
        redCells: {
          canReceive: ['O+', 'O-'],
          canDonateTo: ['A+', 'B+', 'AB+', 'O+'],
          note: 'Hồng cầu O+ không có kháng nguyên A, B nhưng có Rh+. Có thể truyền cho nhiều nhóm máu.'
        },
        platelets: {
          canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          canDonateTo: ['A+', 'B+', 'AB+', 'O+'],
          note: 'Tiểu cầu O+ có thể truyền cho bất kỳ nhóm máu nào, ưu tiên cùng nhóm.'
        },
        plasma: {
          canReceive: ['O+', 'AB+'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Huyết tương O+ chứa kháng thể anti-A, anti-B. Có thể truyền cho mọi nhóm máu.'
        }
      }
    },
    'O-': {
      description: 'Nhóm máu O- là nhóm máu hiếm. Người có nhóm máu O- chỉ có thể nhận máu từ người có nhóm máu O-.',
      components: {
        whole: {
          canReceive: ['O-'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Máu toàn phần O- không có kháng nguyên A, B, Rh. Có thể truyền cho mọi nhóm máu.'
        },
        redCells: {
          canReceive: ['O-'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Hồng cầu O- không có kháng nguyên A, B, Rh. Có thể truyền cho mọi nhóm máu.'
        },
        platelets: {
          canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Tiểu cầu O- có thể truyền cho tất cả các nhóm máu.'
        },
        plasma: {
          canReceive: ['O+', 'O-', 'AB+', 'AB-'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Huyết tương O- chứa kháng thể anti-A, anti-B, anti-Rh. Có thể truyền cho mọi nhóm máu.'
        }
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Thông tin về các nhóm máu và thành phần</h1>
      
      {/* Blood Type Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Object.keys(bloodTypes).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`p-4 rounded-lg text-center font-bold text-lg transition-all duration-200 ${
              selectedType === type
                ? 'bg-red-600 text-white shadow-lg transform scale-105'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800 hover:shadow-md'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Blood Component Selector */}
      {selectedType && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-center">Chọn thành phần máu:</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(bloodComponents).map(([key, component]) => {
              const IconComponent = component.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedComponent(key)}
                  className={`p-4 rounded-lg text-center transition-all duration-200 flex flex-col items-center space-y-2 ${
                    selectedComponent === key
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <IconComponent className={`text-2xl ${selectedComponent === key ? 'text-white' : component.color}`} />
                  <span className="font-medium text-sm">{component.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Blood Type and Component Information */}
      {selectedType && selectedComponent && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            {(() => {
              const IconComponent = bloodComponents[selectedComponent].icon;
              return <IconComponent className={`text-3xl ${bloodComponents[selectedComponent].color}`} />;
            })()}
            <div>
              <h2 className="text-2xl font-bold">Nhóm máu {selectedType} - {bloodComponents[selectedComponent].name}</h2>
              <p className="text-gray-600">{bloodTypes[selectedType].description}</p>
            </div>
          </div>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 font-medium">
              <strong>Ghi chú:</strong> {bloodTypes[selectedType].components[selectedComponent].note}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Can Receive From */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-green-800 flex items-center">
                <FaArrowLeft className="mr-2" />
                Có thể nhận từ:
              </h3>
              <div className="space-y-2">
                {bloodTypes[selectedType].components[selectedComponent].canReceive.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {type}
                    </div>
                    <span className="font-medium text-green-700">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Can Donate To */}
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-red-800 flex items-center">
                <FaArrowRight className="mr-2" />
                Có thể hiến cho:
              </h3>
              <div className="space-y-2">
                {bloodTypes[selectedType].components[selectedComponent].canDonateTo.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {type}
                    </div>
                    <span className="font-medium text-red-700">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Information */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Lưu ý quan trọng về truyền máu</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-red-600">Quy tắc truyền máu cơ bản:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li><strong>Máu toàn phần:</strong> Chứa tất cả thành phần, truyền theo nhóm máu ABO và Rh</li>
              <li><strong>Hồng cầu:</strong> Chỉ truyền theo nhóm máu ABO và Rh</li>
              <li><strong>Tiểu cầu:</strong> Có thể truyền cho bất kỳ nhóm máu nào, ưu tiên cùng nhóm</li>
              <li><strong>Huyết tương:</strong> Truyền ngược với nhóm máu ABO</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-600">Lưu ý an toàn:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Luôn kiểm tra kỹ lưỡng sự tương thích trước khi truyền</li>
              <li>Xét nghiệm kháng thể và bệnh truyền nhiễm bắt buộc</li>
              <li>Trong khẩn cấp, O- có thể dùng cho tất cả nhóm máu</li>
              <li>AB+ có thể nhận từ tất cả nhóm máu khác</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodTypes; 