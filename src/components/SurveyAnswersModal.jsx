import { useState, useEffect } from 'react';
import { FaTimes, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaSpinner, FaEdit } from 'react-icons/fa';
import { getSurveyAnswers, updateAppointmentStatus } from '../utils/api';

const SurveyAnswersModal = ({ appointmentId, onClose, onStatusUpdate }) => {
  const [surveyData, setSurveyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (appointmentId) {
      fetchSurveyAnswers();
    }
  }, [appointmentId]);

  const fetchSurveyAnswers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getSurveyAnswers(appointmentId);
      setSurveyData(data);
      setSelectedStatus(data.status || '');
    } catch (err) {
      setError(err.message || 'Không thể tải câu trả lời khảo sát');
      console.error('Error fetching survey answers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setUpdatingStatus(true);
      setError('');
      
      await updateAppointmentStatus(appointmentId, selectedStatus);
      
      // Refresh survey data to get updated status
      const updatedData = await getSurveyAnswers(appointmentId);
      setSurveyData(updatedData);
      
      setShowEditModal(false);
      setSuccessMessage('Đã cập nhật trạng thái thành công!');
      
      // Notify parent component to refresh the participants list
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (err) {
      setError(err.message || 'Không thể cập nhật trạng thái');
      console.error('Error updating status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'đã hiến':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" />
            Đã hiến máu
          </span>
        );
      case 'đã đủ điều kiện':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" />
            Đã đủ điều kiện
          </span>
        );
      case 'không đủ điều kiện':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaTimesCircle className="mr-1" />
            Không đủ điều kiện
          </span>
        );
      case 'chờ xử lý':
      case 'đang xét duyệt':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaCalendarAlt className="mr-1" />
            Đang xét duyệt
          </span>
        );
      case 'đã hủy':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaTimesCircle className="mr-1" />
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status || 'Không xác định'}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải câu trả lời khảo sát...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Câu trả lời khảo sát
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <FaTimesCircle className="h-4 w-4 text-red-400 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        ) : surveyData ? (
          <div className="space-y-4">
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <FaCheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Appointment Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">
                  Thông tin cuộc hẹn #{surveyData.appointmentId}
                </h3>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(surveyData.status)}
                  {surveyData.status?.toLowerCase() === 'đang xét duyệt' && (
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-colors duration-200"
                      title="Chỉnh sửa trạng thái duyệt"
                    >
                      <FaEdit className="mr-2 h-4 w-4" />
                      Duyệt khảo sát
                    </button>
                  )}
                </div>
              </div>
              {surveyData.answeredItems?.[0]?.answerDate && (
                <p className="text-sm text-gray-600">
                  Ngày trả lời: {formatDate(surveyData.answeredItems[0].answerDate)}
                </p>
              )}
            </div>

            {/* Survey Answers */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Các câu trả lời:</h4>
              {surveyData.answeredItems?.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-2">
                    <h5 className="font-medium text-gray-900">
                      {item.questionText}
                    </h5>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 font-medium">
                        {item.optionText}
                      </p>
                      {item.additionalText && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Chi tiết bổ sung:</span> {item.additionalText}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Không có dữ liệu câu trả lời khảo sát</p>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Edit Status Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Chỉnh sửa trạng thái duyệt
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái duyệt
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn trạng thái</option>
                  <option value="Đã đủ điều kiện">Đã đủ điều kiện</option>
                  <option value="Không đủ điều kiện">Không đủ điều kiện</option>
                  <option value="Đang xét duyệt">Đang xét duyệt</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus || !selectedStatus}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingStatus ? (
                    <>
                      <FaSpinner className="animate-spin inline mr-2" />
                      Đang cập nhật...
                    </>
                  ) : (
                    'Cập nhật'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyAnswersModal; 