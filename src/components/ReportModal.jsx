import React, { useState } from 'react';
import { FaTimes, FaStar, FaHeartbeat, FaSave } from 'react-icons/fa';
import { createReport } from '../utils/api';
import Toast from './Toast';

const ReportModal = ({ appointment, onClose, onSuccess }) => {
  const [reportContent, setReportContent] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reportContent.trim()) {
      showToast('Vui lòng nhập nội dung đánh giá', 'error');
      return;
    }

    setLoading(true);

    try {
      const fullContent = `Đánh giá: ${rating}/5 sao\n\n${reportContent}`;
      
      await createReport('DonationReview', fullContent);
      
      showToast('Đã gửi đánh giá thành công!');
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      showToast(error.message || 'Lỗi khi gửi đánh giá', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-3">
                <FaHeartbeat className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Đánh giá quá trình hiến máu</h2>
                <p className="text-red-100 mt-1">Chia sẻ trải nghiệm của bạn</p>
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
          {/* Appointment Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Thông tin sự kiện</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Sự kiện:</strong> {appointment?.eventTitle}</p>
              <p><strong>Ngày hiến:</strong> {appointment?.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
              <p><strong>Địa điểm:</strong> {appointment?.location || 'N/A'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Đánh giá tổng thể
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    className="text-2xl transition-colors"
                  >
                    <FaStar 
                      className={star <= rating ? 'text-yellow-400' : 'text-gray-300'} 
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {rating}/5 sao
                </span>
              </div>
            </div>

            {/* Report Content */}
            <div className="mb-6">
              <label htmlFor="reportContent" className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung đánh giá <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reportContent"
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                placeholder="Hãy chia sẻ trải nghiệm của bạn về quá trình hiến máu. Ví dụ: Thời gian chờ, thái độ nhân viên, cơ sở vật chất, cảm giác sau khi hiến máu..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Tối thiểu 10 ký tự
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || reportContent.trim().length < 10}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>Gửi đánh giá</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ReportModal; 