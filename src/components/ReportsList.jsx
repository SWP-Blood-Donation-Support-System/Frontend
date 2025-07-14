import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaUser, FaCalendarAlt, FaStar, FaHeartbeat, FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { getAllReports } from '../utils/api';
import Toast from './Toast';

const ReportsList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllReports();
      setReports(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Không thể tải danh sách báo cáo');
      showToast(err.message || 'Không thể tải danh sách báo cáo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getReportTypeIcon = (reportType) => {
    switch (reportType) {
      case 'DonationReview':
        return <FaHeartbeat className="text-red-500" />;
      case 'Emergency':
        return <FaExclamationTriangle className="text-orange-500" />;
      case 'General':
        return <FaFileAlt className="text-blue-500" />;
      default:
        return <FaFileAlt className="text-gray-500" />;
    }
  };

  const getReportTypeLabel = (reportType) => {
    switch (reportType) {
      case 'DonationReview':
        return 'Đánh giá hiến máu';
      case 'Emergency':
        return 'Khẩn cấp';
      case 'General':
        return 'Chung';
      default:
        return reportType;
    }
  };

  const getReportTypeBadge = (reportType) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (reportType) {
      case 'DonationReview':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'Emergency':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'General':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const parseDonationReview = (content) => {
    if (content.includes('Đánh giá:')) {
      const lines = content.split('\n');
      const ratingLine = lines[0];
      const ratingMatch = ratingLine.match(/Đánh giá:\s*(\d+)\/5/);
      const rating = ratingMatch ? parseInt(ratingMatch[1]) : 0;
      const reviewContent = lines.slice(2).join('\n').trim();
      return { rating, content: reviewContent };
    }
    return { rating: 0, content };
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-xs text-gray-600 ml-1">({rating}/5)</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-3 text-gray-600">Đang tải báo cáo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <FaFileAlt className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Báo cáo & Đánh giá</h2>
              <p className="text-sm text-gray-600">Tổng quan tất cả báo cáo trong hệ thống</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{reports.length}</div>
            <div className="text-sm text-gray-600">Báo cáo</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error ? (
          <div className="text-center py-8">
            <FaTimesCircle className="text-red-400 text-3xl mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchReports}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8">
            <FaFileAlt className="text-gray-400 text-3xl mx-auto mb-2" />
            <p className="text-gray-600">Chưa có báo cáo nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const isDonationReview = report.reportType === 'DonationReview';
              const reviewData = isDonationReview ? parseDonationReview(report.reportContent) : null;

              return (
                <div
                  key={report.reportId}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex-shrink-0">
                          {getReportTypeIcon(report.reportType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className={getReportTypeBadge(report.reportType)}>
                              {getReportTypeLabel(report.reportType)}
                            </span>
                            {isDonationReview && reviewData.rating > 0 && (
                              <div className="flex items-center">
                                {renderStars(reviewData.rating)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* User and Date */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center">
                          <FaUser className="mr-1" />
                          <span>{report.username}</span>
                        </div>
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-1" />
                          <span>{new Date(report.reportDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {isDonationReview && reviewData.content 
                            ? reviewData.content 
                            : report.reportContent
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

export default ReportsList; 