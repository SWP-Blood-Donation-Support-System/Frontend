import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaHeartbeat, FaRegCalendarCheck, FaCheckCircle } from 'react-icons/fa';
import { getEvents, registerForEvent, getAppointmentHistory, getUserRegisteredEvents, getUser } from '../utils/api';
import Toast from '../components/Toast';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [registeringEvents, setRegisteringEvents] = useState(new Set());

  useEffect(() => {
    fetchEventsAndRegistrations();
  }, []);

  const fetchEventsAndRegistrations = async () => {
    try {
      setLoading(true);
      
      // Fetch events
      const eventsData = await getEvents();
      setEvents(eventsData);
      
      // Fetch user's appointment history to check registered events
      try {
        const user = getUser();
        if (user && user.username) {
          const appointmentHistory = await getAppointmentHistory(user.username);
          // Extract event IDs from appointment history
          const registeredIds = new Set(appointmentHistory.map(appointment => appointment.eventId));
          setRegisteredEventIds(registeredIds);
          console.log('Registered event IDs from history:', registeredIds);
        }
      } catch (err) {
        console.warn('Could not fetch appointment history:', err);
        // If appointment history fails, try the old method
        try {
          const registrationsData = await getUserRegisteredEvents();
          const registeredIds = new Set(registrationsData.map(reg => reg.eventId));
          setRegisteredEventIds(registeredIds);
          console.log('Registered event IDs from old API:', registeredIds);
        } catch (oldErr) {
          console.warn('Could not fetch user registrations:', oldErr);
        }
      }
      
    } catch (err) {
      setError('Không thể tải danh sách sự kiện. Vui lòng thử lại.');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterEvent = async (eventId, eventTitle) => {
    try {
      // Add event to registering set to show loading state
      setRegisteringEvents(prev => new Set(prev).add(eventId));
      
      await registerForEvent(eventId);
      setSuccessMessage(`Đã đăng ký thành công cho sự kiện "${eventTitle}"!`);
      setShowSuccess(true);
      
      // Add to registered events set
      setRegisteredEventIds(prev => new Set(prev).add(eventId));
      
    } catch (err) {
      setError(err.message || 'Không thể đăng ký sự kiện. Vui lòng thử lại.');
      console.error('Error registering for event:', err);
    } finally {
      // Remove event from registering set
      setRegisteringEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  // Function to refresh registered events (called when user returns from appointment history)
  const refreshRegisteredEvents = async () => {
    try {
      const user = getUser();
      if (user && user.username) {
        const appointmentHistory = await getAppointmentHistory(user.username);
        const registeredIds = new Set(appointmentHistory.map(appointment => appointment.eventId));
        setRegisteredEventIds(registeredIds);
        console.log('Refreshed registered event IDs:', registeredIds);
      }
    } catch (err) {
      console.warn('Could not refresh registered events:', err);
    }
  };

  // Listen for focus events to refresh when user returns to the page
  useEffect(() => {
    const handleFocus = () => {
      refreshRegisteredEvents();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

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

  const isEventUpcoming = (eventDate) => {
    const today = new Date();
    const eventDateObj = new Date(eventDate);
    return eventDateObj > today;
  };

  const isRegistering = (eventId) => {
    return registeringEvents.has(eventId);
  };

  const isEventRegistered = (eventId) => {
    return registeredEventIds.has(eventId);
  };

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
          {events.map((event) => (
            <div
              key={event.eventId}
              className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                !isEventUpcoming(event.eventDate) ? 'opacity-60' : ''
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
                  ) : !isEventUpcoming(event.eventDate) ? (
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
        {events.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCalendarAlt className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Chưa có sự kiện nào
            </h3>
            <p className="text-gray-600">
              Hiện tại chưa có sự kiện hiến máu nào được lên lịch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events; 