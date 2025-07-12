import React from 'react';
import { 
  FaTint, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle,
  FaCalendarAlt,
  FaThermometerHalf,
  FaInfoCircle,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

const BloodInventoryDetail = ({ bloodInventory, onClose, getHospitalName }) => {
  // Kiểm tra nếu có dữ liệu so sánh máu đơn khẩn cấp
  const isEmergencyComparison = bloodInventory && bloodInventory.isEnough !== undefined;
  
  if (isEmergencyComparison) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-full p-3">
                  <FaTint className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">So Sánh Máu Đơn Khẩn Cấp</h2>
                  <p className="text-red-100 mt-1">Kiểm tra tình trạng kho máu</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="text-white hover:text-red-200 text-2xl font-bold transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Status Card */}
            <div className={`rounded-xl p-6 mb-6 ${
              bloodInventory.isEnough 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' 
                : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`rounded-full p-4 ${
                    bloodInventory.isEnough ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {bloodInventory.isEnough ? (
                      <FaCheckCircle className="text-white text-2xl" />
                    ) : (
                      <FaTimesCircle className="text-white text-2xl" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${
                      bloodInventory.isEnough ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {bloodInventory.isEnough ? 'Đủ máu' : 'Thiếu máu'}
                    </h3>
                    <p className={`text-sm ${
                      bloodInventory.isEnough ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Trạng thái: {bloodInventory.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-800">
                    {bloodInventory.availableUnits}
                  </div>
                  <div className="text-sm text-gray-600">Đơn vị có sẵn (ml)</div>
                </div>
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Required Units */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-blue-500 rounded-full p-2">
                    <FaArrowDown className="text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-blue-800">Cần thiết</h4>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {bloodInventory.requiredUnits}
                </div>
                <p className="text-blue-600 text-sm">Đơn vị máu cần thiết (ml)</p>
              </div>

              {/* Available Units */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-green-500 rounded-full p-2">
                    <FaArrowUp className="text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-green-800">Có sẵn</h4>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {bloodInventory.availableUnits}
                </div>
                <p className="text-green-600 text-sm">Đơn vị máu trong kho (ml)</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Tỷ lệ đáp ứng</span>
                <span className="text-sm font-bold text-gray-900">
                  {Math.round((bloodInventory.availableUnits / bloodInventory.requiredUnits) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    bloodInventory.isEnough ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ 
                    width: `${Math.min((bloodInventory.availableUnits / bloodInventory.requiredUnits) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Details Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FaInfoCircle className="text-gray-500" />
                <h4 className="text-lg font-semibold text-gray-900">Chi tiết từng đơn vị máu</h4>
              </div>
              
              {bloodInventory.details && bloodInventory.details.length > 0 ? (
                <div className="space-y-3">
                  {bloodInventory.details.map((detail, index) => (
                    <div key={detail.bloodDetailId || index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-red-100 rounded-full p-2">
                            <FaTint className="text-red-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {detail.bloodType}
                            </div>
                            <div className="text-sm text-gray-600">
                              ID: {detail.bloodDetailId}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-gray-900">
                            {detail.volume} ml
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <FaCalendarAlt className="text-xs" />
                            <span>{new Date(detail.bloodDetailDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaExclamationTriangle className="text-gray-400 text-3xl mx-auto mb-2" />
                  <p className="text-gray-600">Không có chi tiết đơn vị máu</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Đóng
              </button>
              {bloodInventory.isEnough && (
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2">
                  <FaCheckCircle />
                  <span>Xác nhận cung cấp</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback cho dữ liệu cũ (bloodInventory thông thường)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-3xl w-full relative border border-red-100">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl font-bold">×</button>
        <div className="flex items-center justify-center mb-4">
          <span className="inline-block w-10 h-10 bg-gradient-to-r from-red-500 to-red-700 rounded-full flex items-center justify-center mr-3 shadow">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21C12 21 4 13.5 4 8.5C4 5.46243 6.46243 3 9.5 3C11.1566 3 12.5 4.34315 12.5 6C12.5 4.34315 13.8434 3 15.5 3C18.5376 3 21 5.46243 21 8.5C21 13.5 12 21 12 21Z" /></svg>
          </span>
          <h2 className="text-2xl font-bold text-red-700">Chi tiết kho máu</h2>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-red-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">ID</th>
                <th className="px-4 py-2 text-left font-semibold">Nhóm máu</th>
                <th className="px-4 py-2 text-left font-semibold">Thể tích (ml)</th>
                <th className="px-4 py-2 text-left font-semibold">Ngày nhập</th>
                <th className="px-4 py-2 text-left font-semibold">Trạng thái</th>
                <th className="px-4 py-2 text-left font-semibold">Ghi chú</th>
                <th className="px-4 py-2 text-left font-semibold">Bệnh viện</th>
              </tr>
            </thead>
            <tbody>
              {bloodInventory && bloodInventory.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-4 text-gray-400">Không có dữ liệu</td></tr>
              ) : (
                bloodInventory.map((item, idx) => (
                  <tr key={item.bloodDetailId || idx} className="border-t hover:bg-red-50 transition-colors">
                    <td className="px-4 py-2">{item.bloodDetailId ?? <span className="text-gray-400">Chưa có</span>}</td>
                    <td className="px-4 py-2 font-semibold text-red-700">{item.bloodType ?? <span className="text-gray-400">Chưa có</span>}</td>
                    <td className="px-4 py-2">{item.volume ?? <span className="text-gray-400">Chưa có</span>}</td>
                    <td className="px-4 py-2">{item.bloodDetailDate ? item.bloodDetailDate.slice(0,10) : <span className="text-gray-400">Chưa có</span>}</td>
                    <td className={`px-4 py-2 ${item.bloodDetailStatus === 'Còn hạn' ? 'text-green-600 font-semibold' : item.bloodDetailStatus === 'Hết hạn' ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>{item.bloodDetailStatus ?? <span className="text-gray-400">Chưa có</span>}</td>
                    <td className="px-4 py-2">{item.note ?? <span className="text-gray-400">Chưa có</span>}</td>
                    <td className="px-4 py-2">{getHospitalName ? getHospitalName(item.hospitalId) : (item.hospitalId ?? <span className="text-gray-400">Chưa có</span>)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BloodInventoryDetail; 