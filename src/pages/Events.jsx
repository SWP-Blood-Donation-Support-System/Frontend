import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaHeartbeat, FaRegCalendarCheck, FaCheckCircle, FaSearch } from 'react-icons/fa';
import { getEvents, getUser, registerAppointmentWithSurvey, getUserRegisteredEvents } from '../utils/api';
import Toast from '../components/Toast';
import SurveyModal from '../components/SurveyModal';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [registeringEvents, setRegisteringEvents] = useState(new Set());
  const [surveyQuestions, setSurveyQuestions] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [pendingRegister, setPendingRegister] = useState(null); // {eventId, eventTitle}
  const [surveyError, setSurveyError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      setEvents(data);
      
      // Fetch user's registered events
      await fetchUserRegisteredEvents();
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRegisteredEvents = async () => {
    try {
      const user = getUser();
      if (user && user.username) {
        console.log('Fetching registered events for user:', user.username);
        const registeredEvents = await getUserRegisteredEvents();
        console.log('Registered events data:', registeredEvents);
        
        // Kiểm tra cấu trúc dữ liệu từ AppointmentHistory
        if (registeredEvents && Array.isArray(registeredEvents)) {
          const registeredIds = new Set(registeredEvents.map(appointment => {
            console.log('Appointment item:', appointment);
            // Lấy eventId từ appointment
            return appointment.eventId || appointment.event?.eventId;
          }).filter(id => id)); // Lọc bỏ các giá trị null/undefined
          console.log('Registered event IDs:', registeredIds);
          setRegisteredEventIds(registeredIds);
        } else {
          console.log('No registered events or invalid data structure');
          setRegisteredEventIds(new Set());
        }
      }
    } catch (err) {
      console.error('Error fetching user registered events:', err);
      // Không hiển thị lỗi cho user vì đây không phải lỗi nghiêm trọng
    }
  };

  const handleRegisterEvent = async (eventId, eventTitle) => {
    // Lấy survey và mở modal
    try {
      setRegisteringEvents(prev => new Set(prev).add(eventId));
      const res = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Survey/questions');
      const questions = await res.json();
      setSurveyQuestions(questions);
      setShowSurvey(true);
      setPendingRegister({ eventId, eventTitle });
      setSurveyError(''); // Xóa lỗi cũ khi bắt đầu đăng ký mới
    } catch {
      console.error('Error loading survey');
      setRegisteringEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const handleSurveySubmit = async (answers) => {
    try {
      let eligible = true;
      let errorMessage = '';
      let needsStaffReview = false;

      // Bắt buộc trả lời tất cả các câu hỏi
      for (const q of surveyQuestions) {
        const ans = answers[q.questionId];
        
        // Kiểm tra câu hỏi có được trả lời chưa
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
          
          if (opt?.requireText && ans[`text_${opt.optionId}`]) {
            needsStaffReview = true;
          }
          
          // Câu hỏi số 1: chỉ kiểm tra có trả lời, không kiểm tra nội dung
          if (q.questionId === 1) continue;
          
          if (!needsStaffReview && opt && opt.optionText !== 'Không') {
            eligible = false;
            errorMessage = 'Bạn chưa đủ điều kiện đăng ký trực tuyến.';
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
            if (opt?.requireText && ans[`text_${optionId}`]) {
              needsStaffReview = true;
            }
          }
          
          if (!eligible) break; // Nếu đã có lỗi requireText thì dừng
          
          // Câu hỏi số 1: chỉ kiểm tra có trả lời, không kiểm tra nội dung
          if (q.questionId === 1) continue;
          
          if (!needsStaffReview) {
            const selectedOptions = ans.options.map(id => {
              const opt = q.options.find(o => o.optionId === id);
              return opt.optionText;
            });
            if (!selectedOptions.every(text => text === 'Không')) {
              eligible = false;
              errorMessage = 'Bạn chưa đủ điều kiện đăng ký trực tuyến.';
              break;
            }
          }
        }
      }

      if (!eligible) {
        setSurveyError(errorMessage);
        return;
      }
      setSurveyError('');
      setShowSurvey(false);

      // Lấy user hiện tại
      const user = getUser();
      if (!user || !user.username) {
        setError('Không tìm thấy thông tin người dùng');
        return;
      }

      try {
        // Kiểm tra pendingRegister có tồn tại không
        if (!pendingRegister || !pendingRegister.eventId) {
          setError('Thông tin sự kiện không hợp lệ. Vui lòng thử lại.');
          return;
        }

        // Gọi API mới để tạo lịch hẹn và lưu khảo sát cùng lúc
        await registerAppointmentWithSurvey(pendingRegister.eventId, answers);
        if (needsStaffReview) {
          setSuccessMessage(`Đã gửi khảo sát thành công! Đơn đăng ký của bạn đang chờ xác nhận từ nhân viên.`);
        } else {
          setSuccessMessage(`Đã đăng ký thành công cho sự kiện "${pendingRegister.eventTitle}"!`);
        }
        setShowSuccess(true);
        setRegisteredEventIds(prev => new Set(prev).add(pendingRegister.eventId));
        setPendingRegister(null); // Xóa pendingRegister khi thành công
        
        // Refresh danh sách sự kiện đã đăng ký từ server
        await fetchUserRegisteredEvents();
      } catch (err) {
        // Kiểm tra các trường hợp đặc biệt từ API
        if (err.message && err.message.includes('Bạn đã có một lịch hẹn đã được duyệt và đủ điều kiện')) {
          setSuccessMessage(err.message);
          setShowSuccess(true);
          setPendingRegister(null); // Xóa pendingRegister khi thành công
          // Refresh danh sách sự kiện đã đăng ký từ server
          await fetchUserRegisteredEvents();
        } else if (err.message && err.message.includes('Tài khoản của bạn không đủ điều kiện đăng ký lịch hẹn')) {
          setSuccessMessage('Bạn đã hiến máu trong 9 tháng gần đây. Vui lòng quay lại sau hoặc liên hệ nhân viên để biết thêm thông tin.');
          setShowSuccess(true);
          setPendingRegister(null); // Xóa pendingRegister khi thành công
        } else {
          setError(err.message || 'Không thể đăng ký sự kiện. Vui lòng thử lại.');
        }
      }
    } catch (err) {
      setSurveyError('Không thể gửi khảo sát. Vui lòng thử lại.');
      console.error('Error submitting survey:', err);
    } finally {
      setRegisteringEvents(prev => {
        const newSet = new Set(prev);
        if (pendingRegister?.eventId) newSet.delete(pendingRegister.eventId);
        return newSet;
      });
      // Không xóa pendingRegister ở đây để giữ eventId cho lần submit tiếp theo
      // Không xóa surveyError ở đây để giữ thông báo lỗi validation
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
    return timeString.substring(0, 5); // Remove seconds
  };

  const isEventUpcoming = (eventDate, eventTime) => {
    const now = new Date();
    const eventDateTime = new Date(eventDate + 'T' + eventTime);
    
    // Sự kiện được coi là "upcoming" nếu còn ít nhất 1 giờ trước khi bắt đầu
    const oneHourBefore = new Date(eventDateTime.getTime() - (60 * 60 * 1000));
    return now < oneHourBefore;
  };

  const isRegistering = (eventId) => {
    return registeringEvents.has(eventId);
  };

  const isEventRegistered = (eventId) => {
    return registeredEventIds.has(eventId);
  };

  // Filter events based on search term
  const filteredEvents = events.filter(event => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      event.eventTitle?.toLowerCase().includes(searchLower) ||
      event.eventContent?.toLowerCase().includes(searchLower) ||
      event.location?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách sự kiện...</p>
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
        />
      )}
      {showSurvey && surveyQuestions && (
        <SurveyModal
          questions={surveyQuestions}
          onSubmit={handleSurveySubmit}
          onClose={() => {
            setShowSurvey(false);
            setRegisteringEvents(prev => {
              const newSet = new Set(prev);
              if (pendingRegister?.eventId) newSet.delete(pendingRegister.eventId);
              return newSet;
            });
            // Không xóa pendingRegister để giữ eventId cho lần submit tiếp theo
            setSurveyError('');
          }}
          errorMessage={surveyError}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-red-400 rounded-full flex items-center justify-center shadow-lg">
              <FaHeartbeat className="text-white text-3xl" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sự kiện hiến máu
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tham gia các sự kiện hiến máu để góp phần cứu sống nhiều mạng người
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm sự kiện theo tên, địa điểm..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-8 animate-shake">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <div
              key={event.eventId}
              className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                !isEventUpcoming(event.eventDate, event.eventTime) ? 'opacity-60' : ''
              }`}
            >
              {/* Event Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-400 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">{event.eventTitle}</h3>
                <p className="text-red-100 text-sm">{event.eventContent}</p>
              </div>

              {/* Event Details */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Date & Time */}
                  <div className="flex items-center text-gray-600">
                    <FaCalendarAlt className="text-red-500 mr-3" />
                    <span className="font-medium">{formatDate(event.eventDate)}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <FaClock className="text-red-500 mr-3" />
                    <span>{formatTime(event.eventTime)}</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-start text-gray-600">
                    <FaMapMarkerAlt className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                    <span>{event.location}</span>
                  </div>

                  {/* Participants */}
                  <div className="flex items-center text-gray-600">
                    <FaUsers className="text-red-500 mr-3" />
                    <span>Tối đa {event.maxParticipants} người tham gia</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6">
                  {isEventRegistered(event.eventId) ? (
                    <div className="w-full bg-green-100 text-green-800 font-medium py-3 px-4 rounded-lg text-center flex items-center justify-center">
                      <FaCheckCircle className="mr-2" />
                      Đã đăng ký
                    </div>
                  ) : !isEventUpcoming(event.eventDate, event.eventTime) ? (
                    <div className="w-full bg-gray-300 text-gray-600 font-medium py-3 px-4 rounded-lg text-center">
                      Sự kiện đã kết thúc
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRegisterEvent(event.eventId, event.eventTitle)}
                      disabled={isRegistering(event.eventId)}
                      className="w-full bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                    >
                      {isRegistering(event.eventId) ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang đăng ký...
                        </>
                      ) : (
                        <>
                          <FaRegCalendarCheck className="mr-2" />
                          Đăng ký tham gia
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCalendarAlt className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm ? 'Không tìm thấy sự kiện phù hợp' : 'Chưa có sự kiện nào'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Thử thay đổi từ khóa tìm kiếm hoặc xóa bộ lọc để xem tất cả sự kiện.'
                : 'Hiện tại chưa có sự kiện hiến máu nào được lên lịch.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events; 