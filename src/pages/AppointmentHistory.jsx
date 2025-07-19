import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaUser, FaHeartbeat, FaHistory, FaEye, FaCheckCircle, FaTimesCircle, FaTrash, FaRedo, FaCertificate, FaDownload, FaStar } from 'react-icons/fa';
import { getAppointmentHistory, getUser, cancelAppointment, registerForEvent, submitSurveyAnswers } from '../utils/api';
import Toast from '../components/Toast';
import SurveyModal from '../components/SurveyModal';
import SurveyAnswersModal from '../components/SurveyAnswersModal';
import ReportModal from '../components/ReportModal';

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
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedAppointmentForReport, setSelectedAppointmentForReport] = useState(null);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [pendingCancelAppointment, setPendingCancelAppointment] = useState(null);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    fetchAppointmentHistory();
  }, []);

  const fetchAppointmentHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const user = getUser();
      
      if (!user || !user.username) {
        setError('Không tìm thấy thông tin người dùng');
        return;
      }

      const data = await getAppointmentHistory(user.username);
      setAppointments(data);
      console.log('Appointment history:', data);
    } catch (err) {
      if (err.message && !err.message.toLowerCase().includes('no appointment history found')) {
        console.error('Error fetching appointment history:', err);
      } else {
        setAppointments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = (appointmentId, appointmentTitle) => {
    setPendingCancelAppointment({ appointmentId, appointmentTitle });
    setShowCancelConfirmModal(true);
  };

  const confirmCancelAppointment = async () => {
    if (!pendingCancelAppointment) return;

    const { appointmentId, appointmentTitle } = pendingCancelAppointment;

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

    setShowCancelConfirmModal(false);
    setPendingCancelAppointment(null);
  };

  const cancelCancelAppointment = () => {
    setShowCancelConfirmModal(false);
    setPendingCancelAppointment(null);
  };

  const handleReregisterEvent = async (appointmentId, eventId, eventTitle) => {
    try {
      setReregisteringAppointments(prev => new Set(prev).add(appointmentId));
      const res = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Survey/questions');
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
      let eligible = true;
      let errorMessage = '';
      
      for (const q of surveyQuestions) {
        const ans = answers[q.questionId];
        
        if (!ans) {
          eligible = false;
          errorMessage = 'Bạn phải trả lời tất cả các câu hỏi trước khi nộp khảo sát.';
          break;
        }
        
        if (q.questionType === 'single') {
          if (!ans.optionId) {
            eligible = false;
            errorMessage = 'Bạn phải trả lời tất cả các câu hỏi trước khi nộp khảo sát.';
            break;
          }
          
          const opt = q.options.find(o => o.optionId === ans.optionId);
          if (opt?.requireText && !ans[`text_${opt.optionId}`]) {
            eligible = false;
            errorMessage = 'Vui lòng nhập chi tiết cho các câu trả lời yêu cầu.';
            break;
          }
          
          if (opt && opt.optionText !== 'Không') {
            eligible = false;
            errorMessage = 'Bạn chưa đủ điều kiện đăng ký lại trực tuyến.';
            break;
          }
        }
        
        if (q.questionType === 'multiple') {
          if (!ans.options || ans.options.length === 0) {
            eligible = false;
            errorMessage = 'Bạn phải trả lời tất cả các câu hỏi trước khi nộp khảo sát.';
            break;
          }
          
          for (const optionId of ans.options) {
            const opt = q.options.find(o => o.optionId === optionId);
            if (opt?.requireText && !ans[`text_${optionId}`]) {
              eligible = false;
              errorMessage = 'Vui lòng nhập chi tiết cho các câu trả lời yêu cầu.';
              break;
            }
          }
          
          if (!eligible) break;
          
          const selectedOptions = ans.options.map(id => {
            const opt = q.options.find(o => o.optionId === id);
            return opt.optionText;
          });
          if (!selectedOptions.every(text => text === 'Không')) {
            eligible = false;
            errorMessage = 'Bạn chưa đủ điều kiện đăng ký lại trực tuyến.';
            break;
          }
        }
      }
      
      setShowSurvey(false);
      
      if (eligible) {
        if (!pendingReregister || !pendingReregister.eventId) {
          setError('Thông tin sự kiện không hợp lệ. Vui lòng thử lại.');
          return;
        }

        try {
          const appointmentResult = await registerForEvent(pendingReregister.eventId);
          console.log('Appointment re-registered:', appointmentResult);
          
          const appointmentId = appointmentResult.appointmentId || appointmentResult.id;
          
          if (appointmentId) {
            await submitSurveyAnswers(appointmentId, answers);
          }
          
          setSuccessMessage(`Đã đăng ký lại sự kiện "${pendingReregister.eventTitle}" thành công! Bạn có thể xem chi tiết trong trang Sự kiện hiến máu.`);
          setShowSuccess(true);
          await fetchAppointmentHistory();
        } catch (err) {
          if (err.message && err.message.includes('Bạn đã có một lịch hẹn đã được duyệt và đủ điều kiện')) {
            setSuccessMessage(err.message);
            setShowSuccess(true);
            await fetchAppointmentHistory();
          } else {
            setError(err.message || 'Không thể đăng ký lại sự kiện. Vui lòng thử lại.');
          }
        }
      } else {
        setError(errorMessage || 'Bạn chưa đủ điều kiện đăng ký lại trực tuyến.');
      }
    } catch (err) {
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

  const handleShowCertificate = async (appointmentId) => {
    try {
      setCertificateData(null);
      setShowCertificate(true);
      const res = await fetch(`https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Certificate/${appointmentId}`);
      if (!res.ok) throw new Error('Không tìm thấy chứng nhận');
      const data = await res.json();
      setCertificateData(data);
    } catch (err) {
      setCertificateData({ error: err.message });
    }
  };

  const handleDownloadPDF = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Certificate/${appointmentId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Không thể tải PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chung-nhan-hien-mau-${appointmentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setToastMessage('Lỗi khi tải PDF: ' + error.message);
      setToastType('error');
      setShowToast(true);
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

  const getStatusBadge = (status, deferralReasonText, staffNote) => {
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
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <FaClock className="mr-1" />
              Chờ xử lý
            </span>
            {staffNote && staffNote !== 'Chưa có' && (
              <div className="mt-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg max-w-xs">
                <div className="flex items-start">
                  <FaUser className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0 text-xs" />
                  <span className="text-xs text-yellow-800 leading-relaxed">
                    {staffNote}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      case 'đã đăng ký':
        return (
          <div className="flex flex-col items-start">
            <span className=" inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ">
              <FaCheckCircle className="mr-1" />
              Đã đăng ký
            </span>
            {staffNote && staffNote !== 'Chưa có' && (
              <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg max-w-xs">
                <div className="flex items-start">
                  <FaUser className="text-blue-500 mr-2 mt-0.5 flex-shrink-0 text-xs" />
                  <span className="text-xs text-blue-800 leading-relaxed">
                    {staffNote}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      case 'đã đủ điều kiện':
        return (
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <FaCheckCircle className="mr-1" />
              Đã đủ điều kiện
            </span>
            <span className="text-xs text-green-600 mt-1">
              Bạn cần đến cơ sở để hiến máu
            </span>
            {staffNote && staffNote !== 'Chưa có' && (
              <div className="mt-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg max-w-xs">
                <div className="flex items-start">
                  <FaUser className="text-green-500 mr-2 mt-0.5 flex-shrink-0 text-xs" />
                  <span className="text-xs text-green-800 leading-relaxed">
                    {staffNote}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      case 'hoãn':
      case 'deferred':
        return (
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              <FaTimesCircle className="mr-1" />
              Đã hoãn
            </span>
            {deferralReasonText && deferralReasonText !== 'Chưa có' && (
              <div className="mt-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg max-w-xs">
                <div className="flex items-start">
                  <FaTimesCircle className="text-orange-500 mr-2 mt-0.5 flex-shrink-0 text-xs" />
                  <span className="text-xs text-orange-800 leading-relaxed">
                    Lý do: {deferralReasonText}
                  </span>
                </div>
              </div>
            )}
            {staffNote && staffNote !== 'Chưa có' && (
              <div className="mt-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg max-w-xs">
                <div className="flex items-start">
                  <FaUser className="text-orange-500 mr-2 mt-0.5 flex-shrink-0 text-xs" />
                  <span className="text-xs text-orange-800 leading-relaxed">
                    {staffNote}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {status || 'Không xác định'}
            </span>
            {staffNote && staffNote !== 'Chưa có' && (
              <div className="mt-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg max-w-xs">
                <div className="flex items-start">
                  <FaUser className="text-gray-500 mr-2 mt-0.5 flex-shrink-0 text-xs" />
                  <span className="text-xs text-gray-800 leading-relaxed">
                    {staffNote}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  const canCancelAppointment = (status) => {
    return status?.toLowerCase() === 'đã đăng ký' || status?.toLowerCase() === 'pending' || status?.toLowerCase() === 'chờ xử lý' || status?.toLowerCase() === 'đã đủ điều kiện';
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

  const canViewSurveyAnswers = (status) => {
    const validStatuses = [
      'Đã đăng ký',
      'Chờ xử lý',
      'Chờ duyệt',
      'Đã duyệt',
      'Đã từ chối'
    ];
    return validStatuses.includes(status);
  };

  const openAppointmentDetail = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const openSurveyAnswers = (appointment) => {
    setSelectedAppointmentForSurvey(appointment.appointmentId);
    setShowSurveyAnswers(true);
  };

  const closeSurveyAnswers = () => {
    setShowSurveyAnswers(false);
    setSelectedAppointmentForSurvey(null);
  };

  const openReportModal = (appointment) => {
    setSelectedAppointmentForReport(appointment);
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setSelectedAppointmentForReport(null);
  };

  const handleReportSuccess = () => {
    setToastMessage('Đã gửi đánh giá thành công!');
    setToastType('success');
    setShowToast(true);
  };

  const isStaffOrAdmin = () => {
    return user?.role === 'Admin' || user?.role === 'Staff';
  };

  const AppointmentDetailModal = ({ appointment, onClose }) => {
    if (!appointment) return null;
    const field = (label, value) => (
      <div><b>{label}</b> {value !== null && value !== undefined && value !== '' ? value : <span className="text-gray-400">Chưa có</span>}</div>
    );
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl">×</button>
          <h2 className="text-xl font-bold mb-2">{appointment.appointmentTitle}</h2>
          <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
            {field('Nội dung:', appointment.appointmentContent)}
            {field('Ngày đặt lịch:', appointment.appointmentDate?.slice(0,10))}
            {field('Ngày hẹn:', appointment.appointmentDateOfAppointment)}
            {field('Giờ hẹn:', appointment.appointmentTime)}
            {field('Trạng thái:', appointment.appointmentStatus)}
            {field('Ghi chú nhân viên:', appointment.staffNote)}
            {field('Trạng thái máu:', appointment.bloodStatus)}
            {field('Nhóm máu:', appointment.bloodType)}
            {field('Đơn vị máu:', appointment.donationUnit ? `${appointment.donationUnit} ml` : 'Chưa có')}
            {field('Địa điểm:', appointment.bloodLocation)}
            {field('Lý do hoãn:', appointment.deferralReasonText)}
            {field('Lời khuyên:', appointment.deferralAdvice)}
            {field('Ghi chú của bạn:', appointment.deferralUserNote)}
            {field('Có thể hiến lại từ:', appointment.canDonateAgainDate)}
          </div>
        </div>
      </div>
    );
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

      {showReportModal && selectedAppointmentForReport && (
        <ReportModal
          appointment={selectedAppointmentForReport}
          onClose={closeReportModal}
          onSuccess={handleReportSuccess}
        />
      )}

      {showCancelConfirmModal && pendingCancelAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <FaTimesCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Xác nhận hủy lịch hẹn
                </h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Bạn có chắc chắn muốn hủy lịch hẹn <span className="font-semibold text-gray-900">"{pendingCancelAppointment.appointmentTitle}"</span>?
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Hành động này không thể hoàn tác. Bạn có thể đăng ký lại sự kiện này nếu nó chưa diễn ra.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelCancelAppointment}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmCancelAppointment}
                disabled={isCancelling(pendingCancelAppointment.appointmentId)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-md transition-colors duration-200 disabled:cursor-not-allowed flex items-center"
              >
                {isCancelling(pendingCancelAppointment.appointmentId) ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang hủy...
                  </>
                ) : (
                  'Xác nhận hủy'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg mx-4 shadow-2xl border-2 border-yellow-200">
            <h3 className="text-2xl font-bold mb-4 text-center text-yellow-700 flex items-center justify-center gap-2">
              <FaCertificate className="text-yellow-500 text-3xl" />
              Chứng nhận hiến máu
            </h3>
            {certificateData ? (
              certificateData.error ? (
                <div className="text-red-600 text-center">{certificateData.error}</div>
              ) : (
                <div className="space-y-2 text-base">
                  <div><span className="font-semibold">Họ tên:</span> {certificateData.fullName}</div>
                  <div><span className="font-semibold">Ngày sinh:</span> {certificateData.dateOfBirth}</div>
                  <div><span className="font-semibold">Địa chỉ:</span> {certificateData.address}</div>
                  <div><span className="font-semibold">Bệnh viện:</span> {certificateData.hospitalName}</div>
                  <div><span className="font-semibold">Lượng máu hiến:</span> {certificateData.bloodAmount} ml</div>
                  <div><span className="font-semibold">Ngày hiến máu:</span> {certificateData.donationDate}</div>
                  <div><span className="font-semibold">Mã chứng nhận:</span> <span className="font-mono text-blue-700">{certificateData.certificateCode}</span></div>
                  <div><span className="font-semibold">Ngày cấp:</span> {certificateData.issueDate}</div>
                </div>
              )
            ) : (
              <div className="text-center text-gray-500">Đang tải chứng nhận...</div>
            )}
            <div className="flex justify-end mt-6 gap-2">
              {certificateData && !certificateData.error && (
                <button
                  onClick={() => handleDownloadPDF(certificateData.appointmentId)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <FaDownload />
                  Tải PDF
                </button>
              )}
              <button
                onClick={() => { setShowCertificate(false); setCertificateData(null); }}
                className="btn btn-outline"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <FaTimesCircle className="h-4 w-4 text-red-400 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

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

                    <div className="ml-4 flex items-center space-x-2">
                      <div className="flex-shrink-0">
                        {getStatusBadge(appointment.appointmentStatus, appointment.deferralReasonText, appointment.staffNote)}
                      </div>
                      
                      <button
                        onClick={() => openAppointmentDetail(appointment)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Xem chi tiết"
                      >
                        <FaEye className="text-sm" />
                      </button>
                      
                      {isStaffOrAdmin() && canViewSurveyAnswers(appointment.appointmentStatus) && (
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

                      {appointment.appointmentStatus === 'Đã hiến' ? (
                        <>
                        <button
                          onClick={() => handleShowCertificate(appointment.appointmentId || appointment.id)}
                          className="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                          title="Xem chứng nhận hiến máu"
                        >
                          <FaCertificate className="text-sm" />
                        </button>
                          <button
                            onClick={() => openReportModal(appointment)}
                            className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                            title="Viết đánh giá"
                          >
                            <FaStar className="text-sm" />
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AppointmentDetailModal appointment={selectedAppointment} onClose={() => setShowModal(false)} />
      )}

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          duration={4000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default AppointmentHistory; 