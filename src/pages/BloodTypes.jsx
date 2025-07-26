import { useState } from 'react';
import { FaArrowRight, FaArrowLeft, FaTint, FaHeartbeat, FaWater, FaSyringe, FaInfoCircle, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const BloodTypes = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState('whole');

  const bloodComponents = {
    whole: { name: 'Máu toàn phần', icon: FaTint, color: 'text-red-600', bgColor: 'bg-red-50' },
    redCells: { name: 'Hồng cầu', icon: FaHeartbeat, color: 'text-red-500', bgColor: 'bg-red-50' },
    platelets: { name: 'Tiểu cầu', icon: FaWater, color: 'text-orange-500', bgColor: 'bg-orange-50' },
    plasma: { name: 'Huyết tương', icon: FaSyringe, color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
  };

  const bloodTypes = {
    'A+': {
      description: 'Nhóm máu A+ là một trong những nhóm máu phổ biến nhất. Người có nhóm máu A+ có thể nhận máu từ người có nhóm máu A+ và A-, O+ và O-.',
      frequency: 'Phổ biến (30-35%)',
      components: {
        whole: {
          canReceive: ['A+', 'A-', 'O+', 'O-'],
          canDonateTo: ['A+', 'AB+'],
          note: 'Máu toàn phần chứa tất cả các thành phần: hồng cầu, bạch cầu, tiểu cầu và huyết tương.',
          antigens: 'Kháng nguyên A, Rh+',
          antibodies: 'Kháng thể anti-B'
        },
        redCells: {
          canReceive: ['A+', 'A-', 'O+', 'O-'],
          canDonateTo: ['A+', 'AB+'],
          note: 'Hồng cầu chứa kháng nguyên A và Rh+. Có thể nhận từ A+, A-, O+, O-.',
          antigens: 'Kháng nguyên A, Rh+',
          antibodies: 'Không có'
        },
        platelets: {
          canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          canDonateTo: ['A+', 'B+', 'AB+', 'O+'],
          note: 'Tiểu cầu có thể truyền cho bất kỳ nhóm máu nào, nhưng ưu tiên cùng nhóm.',
          antigens: 'Không có',
          antibodies: 'Không có'
        },
        plasma: {
          canReceive: ['A+', 'AB+'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Huyết tương A+ chứa kháng thể anti-B. Có thể truyền cho nhiều nhóm máu.',
          antigens: 'Không có',
          antibodies: 'Kháng thể anti-B'
        }
      }
    },
    'A-': {
      description: 'Nhóm máu A- là nhóm máu hiếm. Người có nhóm máu A- chỉ có thể nhận máu từ người có nhóm máu A- và O-.',
      frequency: 'Hiếm (6-7%)',
      components: {
        whole: {
          canReceive: ['A-', 'O-'],
          canDonateTo: ['A+', 'A-', 'AB+', 'AB-'],
          note: 'Máu toàn phần A- không có kháng nguyên Rh, an toàn cho người Rh-.',
          antigens: 'Kháng nguyên A',
          antibodies: 'Kháng thể anti-B, anti-Rh'
        },
        redCells: {
          canReceive: ['A-', 'O-'],
          canDonateTo: ['A+', 'A-', 'AB+', 'AB-'],
          note: 'Hồng cầu A- chỉ có kháng nguyên A, không có Rh. Rất hiếm và quý.',
          antigens: 'Kháng nguyên A',
          antibodies: 'Không có'
        },
        platelets: {
          canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Tiểu cầu A- có thể truyền cho tất cả các nhóm máu.',
          antigens: 'Không có',
          antibodies: 'Không có'
        },
        plasma: {
          canReceive: ['A+', 'A-', 'AB+', 'AB-'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Huyết tương A- chứa kháng thể anti-B và anti-Rh. Có thể truyền rộng rãi.',
          antigens: 'Không có',
          antibodies: 'Kháng thể anti-B, anti-Rh'
        }
      }
    },
    'B+': {
      description: 'Nhóm máu B+ là nhóm máu phổ biến. Người có nhóm máu B+ có thể nhận máu từ người có nhóm máu B+ và B-, O+ và O-.',
      frequency: 'Phổ biến (8-10%)',
      components: {
        whole: {
          canReceive: ['B+', 'B-', 'O+', 'O-'],
          canDonateTo: ['B+', 'AB+'],
          note: 'Máu toàn phần B+ chứa kháng nguyên B và Rh+.',
          antigens: 'Kháng nguyên B, Rh+',
          antibodies: 'Kháng thể anti-A'
        },
        redCells: {
          canReceive: ['B+', 'B-', 'O+', 'O-'],
          canDonateTo: ['B+', 'AB+'],
          note: 'Hồng cầu B+ chứa kháng nguyên B và Rh+. Có thể nhận từ B+, B-, O+, O-.',
          antigens: 'Kháng nguyên B, Rh+',
          antibodies: 'Không có'
        },
        platelets: {
          canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          canDonateTo: ['A+', 'B+', 'AB+', 'O+'],
          note: 'Tiểu cầu B+ có thể truyền cho bất kỳ nhóm máu nào, ưu tiên cùng nhóm.',
          antigens: 'Không có',
          antibodies: 'Không có'
        },
        plasma: {
          canReceive: ['B+', 'AB+'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Huyết tương B+ chứa kháng thể anti-A. Có thể truyền cho nhiều nhóm máu.',
          antigens: 'Không có',
          antibodies: 'Kháng thể anti-A'
        }
      }
    },
    'B-': {
      description: 'Nhóm máu B- là nhóm máu hiếm. Người có nhóm máu B- chỉ có thể nhận máu từ người có nhóm máu B- và O-.',
      frequency: 'Hiếm (1-2%)',
      components: {
        whole: {
          canReceive: ['B-', 'O-'],
          canDonateTo: ['B+', 'B-', 'AB+', 'AB-'],
          note: 'Máu toàn phần B- không có kháng nguyên Rh, an toàn cho người Rh-.',
          antigens: 'Kháng nguyên B',
          antibodies: 'Kháng thể anti-A, anti-Rh'
        },
        redCells: {
          canReceive: ['B-', 'O-'],
          canDonateTo: ['B+', 'B-', 'AB+', 'AB-'],
          note: 'Hồng cầu B- chỉ có kháng nguyên B, không có Rh. Rất hiếm và quý.',
          antigens: 'Kháng nguyên B',
          antibodies: 'Không có'
        },
        platelets: {
          canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Tiểu cầu B- có thể truyền cho tất cả các nhóm máu.',
          antigens: 'Không có',
          antibodies: 'Không có'
        },
        plasma: {
          canReceive: ['B+', 'B-', 'AB+', 'AB-'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Huyết tương B- chứa kháng thể anti-A và anti-Rh. Có thể truyền rộng rãi.',
          antigens: 'Không có',
          antibodies: 'Kháng thể anti-A, anti-Rh'
        }
      }
    },
    'AB+': {
      description: 'Nhóm máu AB+ là nhóm máu hiếm. Người có nhóm máu AB+ có thể nhận máu từ tất cả các nhóm máu khác.',
      frequency: 'Hiếm (3-4%)',
      components: {
        whole: {
          canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          canDonateTo: ['AB+'],
          note: 'Máu toàn phần AB+ chứa tất cả kháng nguyên A, B và Rh+. Có thể nhận từ mọi nhóm máu.',
          antigens: 'Kháng nguyên A, B, Rh+',
          antibodies: 'Không có'
        },
        redCells: {
          canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          canDonateTo: ['AB+'],
          note: 'Hồng cầu AB+ chứa kháng nguyên A, B và Rh+. Có thể nhận từ mọi nhóm máu.',
          antigens: 'Kháng nguyên A, B, Rh+',
          antibodies: 'Không có'
        },
        platelets: {
          canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          canDonateTo: ['AB+'],
          note: 'Tiểu cầu AB+ chỉ có thể truyền cho AB+, nhưng có thể nhận từ mọi nhóm máu.',
          antigens: 'Không có',
          antibodies: 'Không có'
        },
        plasma: {
          canReceive: ['AB+'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Huyết tương AB+ không chứa kháng thể anti-A, anti-B. Có thể truyền cho mọi nhóm máu.',
          antigens: 'Không có',
          antibodies: 'Không có'
        }
      }
    },
    'AB-': {
      description: 'Nhóm máu AB- là nhóm máu hiếm nhất. Người có nhóm máu AB- có thể nhận máu từ người có nhóm máu A-, B-, AB- và O-.',
      frequency: 'Hiếm nhất (0.5-1%)',
      components: {
        whole: {
          canReceive: ['A-', 'B-', 'AB-', 'O-'],
          canDonateTo: ['AB+', 'AB-'],
          note: 'Máu toàn phần AB- chứa kháng nguyên A, B nhưng không có Rh. Rất hiếm.',
          antigens: 'Kháng nguyên A, B',
          antibodies: 'Kháng thể anti-Rh'
        },
        redCells: {
          canReceive: ['A-', 'B-', 'AB-', 'O-'],
          canDonateTo: ['AB+', 'AB-'],
          note: 'Hồng cầu AB- chứa kháng nguyên A, B nhưng không có Rh. Rất hiếm và quý.',
          antigens: 'Kháng nguyên A, B',
          antibodies: 'Không có'
        },
        platelets: {
          canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          canDonateTo: ['AB+', 'AB-'],
          note: 'Tiểu cầu AB- có thể truyền cho AB+ và AB-, nhận từ mọi nhóm máu.',
          antigens: 'Không có',
          antibodies: 'Không có'
        },
        plasma: {
          canReceive: ['AB+', 'AB-'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Huyết tương AB- không chứa kháng thể anti-A, anti-B, anti-Rh. Có thể truyền cho mọi nhóm máu.',
          antigens: 'Không có',
          antibodies: 'Không có'
        }
      }
    },
    'O+': {
      description: 'Nhóm máu O+ là nhóm máu phổ biến nhất. Người có nhóm máu O+ chỉ có thể nhận máu từ người có nhóm máu O+ và O-.',
      frequency: 'Phổ biến nhất (35-40%)',
      components: {
        whole: {
          canReceive: ['O+', 'O-'],
          canDonateTo: ['A+', 'B+', 'AB+', 'O+'],
          note: 'Máu toàn phần O+ không có kháng nguyên A, B nhưng có Rh+. Có thể truyền cho nhiều nhóm máu.',
          antigens: 'Kháng nguyên Rh+',
          antibodies: 'Kháng thể anti-A, anti-B'
        },
        redCells: {
          canReceive: ['O+', 'O-'],
          canDonateTo: ['A+', 'B+', 'AB+', 'O+'],
          note: 'Hồng cầu O+ không có kháng nguyên A, B nhưng có Rh+. Có thể truyền cho nhiều nhóm máu.',
          antigens: 'Kháng nguyên Rh+',
          antibodies: 'Không có'
        },
        platelets: {
          canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          canDonateTo: ['A+', 'B+', 'AB+', 'O+'],
          note: 'Tiểu cầu O+ có thể truyền cho bất kỳ nhóm máu nào, ưu tiên cùng nhóm.',
          antigens: 'Không có',
          antibodies: 'Không có'
        },
        plasma: {
          canReceive: ['O+', 'AB+'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Huyết tương O+ chứa kháng thể anti-A, anti-B. Có thể truyền cho mọi nhóm máu.',
          antigens: 'Không có',
          antibodies: 'Kháng thể anti-A, anti-B'
        }
      }
    },
    'O-': {
      description: 'Nhóm máu O- là nhóm máu hiếm. Người có nhóm máu O- chỉ có thể nhận máu từ người có nhóm máu O-.',
      frequency: 'Hiếm (6-7%)',
      components: {
        whole: {
          canReceive: ['O-'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Máu toàn phần O- không có kháng nguyên A, B, Rh. Có thể truyền cho mọi nhóm máu.',
          antigens: 'Không có',
          antibodies: 'Kháng thể anti-A, anti-B, anti-Rh'
        },
        redCells: {
          canReceive: ['O-'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Hồng cầu O- không có kháng nguyên A, B, Rh. Có thể truyền cho mọi nhóm máu.',
          antigens: 'Không có',
          antibodies: 'Không có'
        },
        platelets: {
          canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Tiểu cầu O- có thể truyền cho tất cả các nhóm máu.',
          antigens: 'Không có',
          antibodies: 'Không có'
        },
        plasma: {
          canReceive: ['O+', 'O-', 'AB+', 'AB-'],
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          note: 'Huyết tương O- chứa kháng thể anti-A, anti-B, anti-Rh. Có thể truyền cho mọi nhóm máu.',
          antigens: 'Không có',
          antibodies: 'Kháng thể anti-A, anti-B, anti-Rh'
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Thông tin về các nhóm máu và thành phần
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Tìm hiểu chi tiết về các nhóm máu, thành phần máu và quy tắc truyền máu an toàn
          </p>
        </div>
        
        {/* Blood Type Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Chọn nhóm máu:</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {Object.entries(bloodTypes).map(([type, data]) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`p-6 rounded-xl text-center font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                  selectedType === type
                    ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-xl scale-105'
                    : 'bg-white hover:bg-gray-50 text-gray-800 shadow-lg hover:shadow-xl border-2 border-gray-200'
                }`}
              >
                <div className="text-3xl mb-2">{type}</div>
                <div className="text-xs opacity-75">{data.frequency}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Blood Component Selector */}
        {selectedType && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Chọn thành phần máu:</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {Object.entries(bloodComponents).map(([key, component]) => {
                const IconComponent = component.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedComponent(key)}
                    className={`p-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${
                      selectedComponent === key
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl scale-105'
                        : 'bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl border-2 border-gray-200'
                    }`}
                  >
                    <IconComponent className={`text-3xl mb-3 ${selectedComponent === key ? 'text-white' : component.color}`} />
                    <div className="font-semibold text-sm">{component.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Blood Type and Component Information */}
        {selectedType && selectedComponent && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-12 max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-8">
              {(() => {
                const IconComponent = bloodComponents[selectedComponent].icon;
                return (
                  <div className={`p-4 rounded-full ${bloodComponents[selectedComponent].bgColor}`}>
                    <IconComponent className={`text-4xl ${bloodComponents[selectedComponent].color}`} />
                  </div>
                );
              })()}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Nhóm máu {selectedType} - {bloodComponents[selectedComponent].name}
                </h2>
                <p className="text-gray-600 text-lg">{bloodTypes[selectedType].description}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <FaInfoCircle className="mr-2" />
                  <span>{bloodTypes[selectedType].frequency}</span>
                </div>
              </div>
            </div>
            
            {/* Antigens and Antibodies Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                  <FaCheckCircle className="mr-2" />
                  Kháng nguyên (Antigens)
                </h3>
                <p className="text-blue-700 font-medium">
                  {bloodTypes[selectedType].components[selectedComponent].antigens}
                </p>
              </div>
              <div className="bg-yellow-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  Kháng thể (Antibodies)
                </h3>
                <p className="text-yellow-700 font-medium">
                  {bloodTypes[selectedType].components[selectedComponent].antibodies}
                </p>
              </div>
            </div>
            
            {/* Note Section */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500">
              <p className="text-blue-800 font-medium">
                <strong>Ghi chú:</strong> {bloodTypes[selectedType].components[selectedComponent].note}
              </p>
            </div>
            
            {/* Compatibility Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Can Receive From */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                <h3 className="text-xl font-semibold mb-6 text-green-800 flex items-center">
                  <FaArrowLeft className="mr-3 text-2xl" />
                  Có thể nhận từ:
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {bloodTypes[selectedType].components[selectedComponent].canReceive.map((type) => (
                    <div key={type} className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {type}
                      </div>
                      <span className="font-semibold text-green-700">{type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Can Donate To */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border-2 border-red-200">
                <h3 className="text-xl font-semibold mb-6 text-red-800 flex items-center">
                  <FaArrowRight className="mr-3 text-2xl" />
                  Có thể hiến cho:
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {bloodTypes[selectedType].components[selectedComponent].canDonateTo.map((type) => (
                    <div key={type} className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                      <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {type}
                      </div>
                      <span className="font-semibold text-red-700">{type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Lưu ý quan trọng về truyền máu</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-red-50 p-6 rounded-xl border-l-4 border-red-500">
                <h3 className="text-xl font-semibold mb-4 text-red-800 flex items-center">
                  <FaExclamationTriangle className="mr-3" />
                  Quy tắc truyền máu cơ bản:
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <strong>Máu toàn phần:</strong> Chứa tất cả thành phần, truyền theo nhóm máu ABO và Rh
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <strong>Hồng cầu:</strong> Chỉ truyền theo nhóm máu ABO và Rh
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <strong>Tiểu cầu:</strong> Có thể truyền cho bất kỳ nhóm máu nào, ưu tiên cùng nhóm
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <strong>Huyết tương:</strong> Truyền ngược với nhóm máu ABO
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500">
                <h3 className="text-xl font-semibold mb-4 text-blue-800 flex items-center">
                  <FaInfoCircle className="mr-3" />
                  Lưu ý an toàn:
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>Luôn kiểm tra kỹ lưỡng sự tương thích trước khi truyền</div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>Xét nghiệm kháng thể và bệnh truyền nhiễm bắt buộc</div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>Trong khẩn cấp, O- có thể dùng cho tất cả nhóm máu</div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>AB+ có thể nhận từ tất cả nhóm máu khác</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodTypes; 