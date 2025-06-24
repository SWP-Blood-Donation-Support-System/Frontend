import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaUser, FaHeartbeat, FaHistory, FaEye, FaCheckCircle, FaTimesCircle, FaTrash, FaRedo } from 'react-icons/fa';
import { getAppointmentHistory, getUser, cancelAppointment, registerForEvent, submitSurveyAnswers } from '../utils/api';
import Toast from '../components/Toast';
import SurveyModal from '../components/SurveyModal';
import SurveyAnswersModal from '../components/SurveyAnswersModal';

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [cancellingAppointments, setCancellingAppointments] = useState(new Set());
  const [reregisteringAppointments, setReregisteringAppointments] = useState(new Set());
  const [surveyQuestions, setSurveyQuestions] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [pendingReregister, setPendingReregister] = useState(null);
  const [showSurveyAnswers, setShowSurveyAnswers] = useState(false);
  const [selectedAppointmentForSurvey, setSelectedAppointmentForSurvey] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    fetchAppointmentHistory();
  }, []);

  const fetchAppointmentHistory = async () => {
    try {
      setLoading(true);
      const user = getUser();
      
      if (!user || !user.username) {
        setError('Không tìm thấy thông tin người dùng');
        return;
      }

      const data = await getAppointmentHistory(user.username);
      setAppointments(data);
      console.log('Appointment history:', data);
    } catch (err) {
      setError(err.message || 'Không thể tải lịch sử lịch hẹn. Vui lòng thử lại.');
      console.error('Error fetching appointment history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId, appointmentTitle) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy lịch hẹn "${appointmentTitle}"?`)) {
      return;
    }

    try {
      setCancellingAppointments(prev => new Set(prev).add(appointmentId));
      
      await cancelAppointment(appointmentId);
      setSuccessMessage(`Đã hủy lịch hẹn "${appointmentTitle}" thành công!`);
      setShowSuccess(true);
      
      await fetchAppointmentHistory();
      
    } catch (err) {
      setError(err.message || 'Không thể hủy lịch hẹn. Vui lòng thử lại.');
      console.error('Error cancelling appointment:', err);
    } finally {
      setCancellingAppointments(prev => {
        const newSet = new Set(prev);
        newSet.delete(appointmentId);
        return newSet;
      });
    }
  };

  const handleReregisterEvent = async (appointmentId, eventId, eventTitle) => {
    // Lấy survey và mở modal
    try {
      setReregisteringAppointments(prev => new Set(prev).add(appointmentId));
      const res = await fetch('https://blooddonationsystem-gzgdhdhzh5c0gmff.southeastasia-01.azurewebsites.net/api/Survey/questions');
      const questions = await res.json();
      setSurveyQuestions(questions);
      setShowSurvey(true);
      setPendingReregister({ appointmentId, eventId, eventTitle });
    } catch {
      setError('Không thể tải khảo sát. Vui lòng thử lại.');
      setReregisteringAppointments(prev => {
        const newSet = new Set(prev);
        newSet.delete(appointmentId);
        return newSet;
      });
    }
  };

  const handleSurveySubmit = async (answers) => {
    try {
      // Kiểm tra điều kiện hợp lệ trước
      let eligible = true;
      for (const q of surveyQuestions) {
        const ans = answers[q.questionId];
        if (q.questionType === 'single') {
          const opt = q.options.find(o => o.optionId === ans?.optionId);
          if (opt && opt.optionText !== 'Không') eligible = false;
          if (opt?.requireText && !ans[`text_${opt.optionId}`]) eligible = false;
        }
        if (q.questionType === 'multiple') {
          // Với multiple choice, chỉ cần không chọn các lựa chọn có nguy cơ
          if (ans?.options?.length) {
            const selectedOptions = ans.options.map(id => {
              const opt = q.options.find(o => o.optionId === id);
              return opt.optionText;
            });
            // Nếu có chọn bất kỳ lựa chọn nào khác "Không" thì không hợp lệ
            if (!selectedOptions.every(text => text === 'Không')) {
              eligible = false;
            }
          }
        }
      }
      
      setShowSurvey(false);
      
      if (eligible) {
        // Đủ điều kiện, đăng ký appointment trước
        try {
          const appointmentResult = await registerForEvent(pendingReregister.eventId);
          console.log('Appointment re-registered:', appointmentResult);
          
          // Lấy appointmentId từ kết quả đăng ký
          const appointmentId = appointmentResult.appointmentId || appointmentResult.id;
          
          if (appointmentId) {
            // Gửi survey answers với appointmentId
            await submitSurveyAnswers(appointmentId, answers);
          }
          
          setSuccessMessage(`Đã đăng ký lại sự kiện "${pendingReregister.eventTitle}" thành công! Bạn có thể xem chi tiết trong trang Sự kiện hiến máu.`);
          setShowSuccess(true);
          await fetchAppointmentHistory();
        } catch (err) {
          setError(err.message || 'Không thể đăng ký lại sự kiện. Vui lòng thử lại.');
        }
      } else {
        setError('Bạn chưa đủ điều kiện đăng ký lại trực tuyến. Vui lòng liên hệ ban tổ chức hoặc chờ xác nhận từ nhân viên.');
      }
    } catch (err) {
      setError('Không thể gửi khảo sát. Vui lòng thử lại.');
      console.error('Error submitting survey:', err);
    } finally {
      setReregisteringAppointments(prev => {
        const newSet = new Set(prev);
        if (pendingReregister?.appointmentId) newSet.delete(pendingReregister.appointmentId);
        return newSet;
      });
      setPendingReregister(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'hoàn thành':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" />
            Hoàn thành
          </span>
        );
      case 'cancelled':
      case 'đã hủy':
      case 'hủy':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaTimesCircle className="mr-1" />
            Đã hủy
          </span>
        );
      case 'pending':
      case 'chờ xử lý':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaClock className="mr-1" />
            Chờ xử lý
          </span>
        );
      case 'đã đăng ký':
        return (
          <span className=" inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ">
            <FaCheckCircle className="mr-1" />
            Đã đăng ký
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

  const canCancelAppointment = (status) => {
    return status?.toLowerCase() === 'đã đăng ký' || status?.toLowerCase() === 'pending' || status?.toLowerCase() === 'chờ xử lý';
  };

  const canReregisterEvent = (status, eventDate) => {
    const isCancelled = status?.toLowerCase() === 'đã hủy' || status?.toLowerCase() === 'hủy';
    const isEventUpcoming = new Date(eventDate) > new Date();
    return isCancelled && isEventUpcoming;
  };

  const isCancelling = (appointmentId) => {
    return cancellingAppointments.has(appointmentId);
  };

  const isReregistering = (appointmentId) => {
    return reregisteringAppointments.has(appointmentId);
  };

  const openAppointmentDetail = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  const openSurveyAnswers = (appointment) => {
    setSelectedAppointmentForSurvey(appointment.appointmentId);
    setShowSurveyAnswers(true);
  };

  const closeSurveyAnswers = () => {
    setShowSurveyAnswers(false);
    setSelectedAppointmentForSurvey(null);
  };

  const isStaffOrAdmin = () => {
    return user?.role === 'Admin' || user?.role === 'Staff';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải lịch sử lịch hẹn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {showSuccess && (
        <Toast
          message={successMessage}
          type="success"
          onClose={() => setShowSuccess(false)}
          action={
            successMessage.includes('đăng ký lại') ? {
              label: 'Xem sự kiện',
              onClick: () => window.location.href = '/events'
            } : null
          }
        />
      )}

      {showSurvey && surveyQuestions && (
        <SurveyModal
          questions={surveyQuestions}
          onSubmit={handleSurveySubmit}
          onClose={() => {
            setShowSurvey(false);
            setReregisteringAppointments(prev => {
              const newSet = new Set(prev);
              if (pendingReregister?.appointmentId) newSet.delete(pendingReregister.appointmentId);
              return newSet;
            });
            setPendingReregister(null);
          }}
        />
      )}

      {showSurveyAnswers && selectedAppointmentForSurvey && (
        <SurveyAnswersModal
          appointmentId={selectedAppointmentForSurvey}
          onClose={closeSurveyAnswers}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-400 rounded-full flex items-center justify-center shadow-md">
              <FaHistory className="text-white text-xl" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Lịch sử lịch hẹn hiến máu
          </h1>
          <p className="text-gray-600">
            Quản lý tất cả các lịch hẹn hiến máu của bạn
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <FaTimesCircle className="h-4 w-4 text-red-400 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <FaCalendarAlt className="text-blue-600 text-sm" />
              </div>
              <div className="ml-2">
                <p className="text-xs font-medium text-gray-600">Tổng</p>
                <p className="text-sm font-semibold text-gray-900">{appointments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <FaCheckCircle className="text-green-600 text-sm" />
              </div>
              <div className="ml-2">
                <p className="text-xs font-medium text-gray-600">Đã đăng ký</p>
                <p className="text-sm font-semibold text-gray-900">
                  {appointments.filter(a => a.appointmentStatus?.toLowerCase() === 'đã đăng ký').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 bg-yellow-100 rounded-lg">
                <FaClock className="text-yellow-600 text-sm" />
              </div>
              <div className="ml-2">
                <p className="text-xs font-medium text-gray-600">Chờ xử lý</p>
                <p className="text-sm font-semibold text-gray-900">
                  {appointments.filter(a => a.appointmentStatus?.toLowerCase() === 'chờ xử lý').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 bg-red-100 rounded-lg">
                <FaTimesCircle className="text-red-600 text-sm" />
              </div>
              <div className="ml-2">
                <p className="text-xs font-medium text-gray-600">Đã hủy</p>
                <p className="text-sm font-semibold text-gray-900">
                  {appointments.filter(a => a.appointmentStatus?.toLowerCase() === 'đã hủy' || a.appointmentStatus?.toLowerCase() === 'hủy').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info about reregistration feature */}
        {appointments.some(appointment => 
          canReregisterEvent(appointment.appointmentStatus, appointment.appointmentDateOfAppointment)
        ) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <FaRedo className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Chức năng đăng ký lại sự kiện
                </h4>
                <p className="text-sm text-blue-700">
                  Nếu bạn đã hủy lịch hẹn và sự kiện vẫn chưa diễn ra, bạn có thể đăng ký lại bằng cách nhấn vào nút <FaRedo className="inline text-blue-600" /> bên cạnh lịch hẹn đã hủy.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaHistory className="text-gray-400 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có lịch hẹn nào
            </h3>
            <p className="text-gray-600 mb-4">
              Bạn chưa có lịch hẹn hiến máu nào. Hãy tham gia các sự kiện hiến máu để tạo lịch hẹn.
            </p>
            <button
              onClick={() => window.location.href = '/events'}
              className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
            >
              <FaCalendarAlt className="mr-1.5" />
              Xem sự kiện hiến máu
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment, index) => (
              <div
                key={appointment.appointmentId || index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {appointment.appointmentTitle || `Lịch hẹn #${appointment.appointmentId || index + 1}`}
                        </h3>
                      </div>

                      {appointment.appointmentContent && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                          {appointment.appointmentContent}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <FaCalendarAlt className="text-red-500 mr-1" />
                          <span>Đăng ký: {formatDate(appointment.appointmentDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <FaClock className="text-red-500 mr-1" />
                          <span>Sự kiện: {formatDate(appointment.appointmentDateOfAppointment)}</span>
                        </div>
                        {appointment.appointmentTime && (
                          <div className="flex items-center">
                            <FaClock className="text-red-500 mr-1" />
                            <span>{formatTime(appointment.appointmentTime)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions and Status */}
                    <div className="ml-4 flex items-center space-x-2">
                      <div className="flex-shrink-0">
                        {getStatusBadge(appointment.appointmentStatus)}
                      </div>
                      
                      <button
                        onClick={() => openAppointmentDetail(appointment)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Xem chi tiết"
                      >
                        <FaEye className="text-sm" />
                      </button>
                      
                      {isStaffOrAdmin() && (
                        <button
                          onClick={() => openSurveyAnswers(appointment)}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors duration-200"
                          title="Xem câu trả lời khảo sát"
                        >
                          Khảo sát
                        </button>
                      )}
                      
                      {canCancelAppointment(appointment.appointmentStatus) && (
                        <button
                          onClick={() => handleCancelAppointment(appointment.appointmentId, appointment.appointmentTitle)}
                          disabled={isCancelling(appointment.appointmentId)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Hủy lịch hẹn"
                        >
                          {isCancelling(appointment.appointmentId) ? (
                            <svg className="animate-spin h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <FaTrash className="text-sm" />
                          )}
                        </button>
                      )}
                      
                      {canReregisterEvent(appointment.appointmentStatus, appointment.appointmentDateOfAppointment) && (
                        <button
                          onClick={() => handleReregisterEvent(appointment.appointmentId, appointment.eventId, appointment.appointmentTitle)}
                          disabled={isReregistering(appointment.appointmentId)}
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Đăng ký lại sự kiện hiến máu"
                        >
                          {isReregistering(appointment.appointmentId) ? (
                            <svg className="animate-spin h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <FaRedo className="text-sm" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Chi tiết lịch hẹn
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Event Information */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <FaCalendarAlt className="text-red-500 mr-2" />
                    Thông tin sự kiện
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h5 className="text-base font-medium text-gray-900 mb-2">
                      {selectedAppointment.appointmentTitle || 'Không có tiêu đề'}
                    </h5>
                    {selectedAppointment.appointmentContent && (
                      <p className="text-sm text-gray-600 mb-3">{selectedAppointment.appointmentContent}</p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <FaCalendarAlt className="text-red-500 mr-2 w-4" />
                        <span className="font-medium w-20">Đăng ký:</span>
                        <span className="text-gray-600">{formatDate(selectedAppointment.appointmentDate)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <FaCalendarAlt className="text-red-500 mr-2 w-4" />
                        <span className="font-medium w-20">Sự kiện:</span>
                        <span className="text-gray-600">{formatDate(selectedAppointment.appointmentDateOfAppointment)}</span>
                      </div>
                      
                      {selectedAppointment.appointmentTime && (
                        <div className="flex items-center text-sm">
                          <FaClock className="text-red-500 mr-2 w-4" />
                          <span className="font-medium w-20">Giờ:</span>
                          <span className="text-gray-600">{formatTime(selectedAppointment.appointmentTime)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm">
                        <FaUser className="text-red-500 mr-2 w-4" />
                        <span className="font-medium w-20">ID:</span>
                        <span className="text-gray-600">{selectedAppointment.appointmentId}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Trạng thái</h4>
                  <div className="flex items-center">
                    {getStatusBadge(selectedAppointment.appointmentStatus)}
                  </div>
                </div>

                {/* Blood Information */}
                {selectedAppointment.bloodStatus && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <FaHeartbeat className="text-red-500 mr-2" />
                      Thông tin hiến máu
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <span className="font-medium w-20">Trạng thái:</span>
                          <span className="text-gray-600">{selectedAppointment.bloodStatus}</span>
                        </div>
                        {selectedAppointment.bloodType && (
                          <div className="flex items-center text-sm">
                            <span className="font-medium w-20">Nhóm máu:</span>
                            <span className="text-gray-600">{selectedAppointment.bloodType}</span>
                          </div>
                        )}
                        {selectedAppointment.donationUnit && (
                          <div className="flex items-center text-sm">
                            <span className="font-medium w-20">Đơn vị:</span>
                            <span className="text-gray-600">{selectedAppointment.donationUnit}</span>
                          </div>
                        )}
                        {selectedAppointment.bloodLocation && (
                          <div className="flex items-center text-sm">
                            <span className="font-medium w-20">Địa điểm:</span>
                            <span className="text-gray-600">{selectedAppointment.bloodLocation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancel button */}
                {canCancelAppointment(selectedAppointment.appointmentStatus) && (
                  <div className="pt-3 border-t border-gray-200">
                    <button
                      onClick={() => {
                        closeModal();
                        handleCancelAppointment(selectedAppointment.appointmentId, selectedAppointment.appointmentTitle);
                      }}
                      disabled={isCancelling(selectedAppointment.appointmentId)}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCancelling(selectedAppointment.appointmentId) ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang hủy...
                        </>
                      ) : (
                        <>
                          <FaTrash className="mr-2" />
                          Hủy lịch hẹn
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* View Survey Answers button */}
                {isStaffOrAdmin() && (
                  <div className="pt-3 border-t border-gray-200">
                    <button
                      onClick={() => {
                        closeModal();
                        openSurveyAnswers(selectedAppointment);
                      }}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Xem câu trả lời khảo sát
                    </button>
                  </div>
                )}

                {/* Reregister button */}
                {canReregisterEvent(selectedAppointment.appointmentStatus, selectedAppointment.appointmentDateOfAppointment) && (
                  <div className="pt-3 border-t border-gray-200">
                    <button
                      onClick={() => {
                        closeModal();
                        handleReregisterEvent(selectedAppointment.appointmentId, selectedAppointment.eventId, selectedAppointment.appointmentTitle);
                      }}
                      disabled={isReregistering(selectedAppointment.appointmentId)}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isReregistering(selectedAppointment.appointmentId) ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang đăng ký lại...
                        </>
                      ) : (
                        <>
                          <FaRedo className="mr-2" />
                          Đăng ký lại sự kiện
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200 text-sm"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentHistory; 