import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaHeartbeat, FaCheckCircle, FaUserCheck, FaTint, FaClipboardList, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { getEvents, getRegisteredParticipantsByEventId, checkinParticipant, recordDonation } from '../utils/api';
import Toast from '../components/Toast';

const BloodDonationManagement = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [checkingIn, setCheckingIn] = useState(new Set());
  const [recordingDonation, setRecordingDonation] = useState(new Set());
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [donationForm, setDonationForm] = useState({ bloodType: '', donationVolume: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch (err) {
      setError('Không thể tải danh sách sự kiện. Vui lòng thử lại.');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelect = async (event) => {
    try {
      setSelectedEvent(event);
      setParticipantsLoading(true);
      setError('');
      
      const participantsData = await getRegisteredParticipantsByEventId(event.eventId);
      
      if (participantsData && Array.isArray(participantsData)) {
        setParticipants(participantsData);
      } else {
        setParticipants([]);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách người tham gia. Vui lòng thử lại.');
    } finally {
      setParticipantsLoading(false);
    }
  };

  const handleCheckin = async (appointmentId, participantName) => {
    try {
      setCheckingIn(prev => new Set(prev).add(appointmentId));
      
      await checkinParticipant(appointmentId);
      setSuccessMessage(`Đã check-in thành công cho ${participantName}!`);
      setShowSuccess(true);
      
      // Refresh participants list
      if (selectedEvent) {
        const participantsData = await getRegisteredParticipantsByEventId(selectedEvent.eventId);
        setParticipants(participantsData);
      }
    } catch (err) {
      setError(err.message || 'Không thể thực hiện check-in. Vui lòng thử lại.');
      console.error('Error checking in:', err);
    } finally {
      setCheckingIn(prev => {
        const newSet = new Set(prev);
        newSet.delete(appointmentId);
        return newSet;
      });
    }
  };

  const handleRecordDonation = async (appointmentId, participantName) => {
    setSelectedParticipant({ appointmentId, participantName });
    setShowDonationModal(true);
  };

  const submitDonation = async () => {
    try {
      if (!donationForm.bloodType || !donationForm.donationVolume) {
        setError('Vui lòng nhập đầy đủ thông tin nhóm máu và thể tích hiến máu.');
        return;
      }

      setRecordingDonation(prev => new Set(prev).add(selectedParticipant.appointmentId));
      
      await recordDonation(
        selectedParticipant.appointmentId,
        donationForm.bloodType,
        parseFloat(donationForm.donationVolume)
      );
      
      setSuccessMessage(`Đã ghi nhận hiến máu thành công cho ${selectedParticipant.participantName}!`);
      setShowSuccess(true);
      
      // Reset form and close modal
      setDonationForm({ bloodType: '', donationVolume: '' });
      setShowDonationModal(false);
      setSelectedParticipant(null);
      
      // Refresh participants list
      if (selectedEvent) {
        const participantsData = await getRegisteredParticipantsByEventId(selectedEvent.eventId);
        setParticipants(participantsData);
      }
    } catch (err) {
      setError(err.message || 'Không thể ghi nhận hiến máu. Vui lòng thử lại.');
      console.error('Error recording donation:', err);
    } finally {
      setRecordingDonation(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedParticipant.appointmentId);
        return newSet;
      });
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
    return timeString.substring(0, 5);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Registered': { color: 'bg-blue-100 text-blue-800', text: 'Đã đăng ký' },
      'CheckedIn': { color: 'bg-yellow-100 text-yellow-800', text: 'Đã check-in' },
      'Donated': { color: 'bg-green-100 text-green-800', text: 'Đã hiến máu' },
      'Cancelled': { color: 'bg-red-100 text-red-800', text: 'Đã hủy' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    
    return (
      <span className={`inline-block px-2 py-1 text-xs rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // Function to convert blood type ID to name
  const getBloodTypeName = (bloodTypeId) => {
    const bloodTypeMap = {
      '1': 'A+',
      '2': 'A-',
      '3': 'B+',
      '4': 'B-',
      '5': 'AB+',
      '6': 'AB-',
      '7': 'O+',
      '8': 'O-'
    };
    
    return bloodTypeMap[bloodTypeId] || bloodTypeId;
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
              <FaClipboardList className="text-white text-3xl" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Quản lý hiến máu
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Quản lý sự kiện hiến máu và theo dõi quá trình tham gia của người hiến máu
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

        {!selectedEvent ? (
          /* Events List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div
                key={event.eventId}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                onClick={() => handleEventSelect(event)}
              >
                {/* Event Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-400 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">{event.eventTitle}</h3>
                  <p className="text-red-100 text-sm">{event.eventContent}</p>
                </div>

                {/* Event Details */}
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <FaCalendarAlt className="text-red-500 mr-3" />
                      <span className="font-medium">{formatDate(event.eventDate)}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <FaClock className="text-red-500 mr-3" />
                      <span>{formatTime(event.eventTime)}</span>
                    </div>

                    <div className="flex items-start text-gray-600">
                      <FaMapMarkerAlt className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                      <span>{event.location}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <FaUsers className="text-red-500 mr-3" />
                      <span>Tối đa {event.maxParticipants} người tham gia</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button className="w-full bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center">
                      <FaClipboardList className="mr-2" />
                      Xem danh sách tham gia
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Participants List */
          <div>
            {/* Back Button */}
            <button
              onClick={() => {
                setSelectedEvent(null);
                setParticipants([]);
                setError('');
              }}
              className="mb-6 flex items-center text-red-600 hover:text-red-700 font-medium"
            >
              <FaArrowLeft className="mr-2" />
              Quay lại danh sách sự kiện
            </button>

            {/* Event Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedEvent.eventTitle}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
                <div className="flex items-center">
                  <FaCalendarAlt className="text-red-500 mr-3" />
                  <span>{formatDate(selectedEvent.eventDate)}</span>
                </div>
                <div className="flex items-center">
                  <FaClock className="text-red-500 mr-3" />
                  <span>{formatTime(selectedEvent.eventTime)}</span>
                </div>
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-red-500 mr-3" />
                  <span>{selectedEvent.location}</span>
                </div>
              </div>
            </div>

            {/* Participants Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách người tham gia</h3>
              </div>

              {participantsLoading ? (
                <div className="p-8 text-center">
                  <FaSpinner className="animate-spin text-red-600 text-2xl mx-auto mb-4" />
                  <p className="text-gray-600">Đang tải danh sách người tham gia...</p>
                </div>
              ) : participants.length === 0 ? (
                <div className="p-8 text-center">
                  <FaUsers className="text-gray-400 text-4xl mx-auto mb-4" />
                  <p className="text-gray-600">Chưa có người nào đăng ký tham gia sự kiện này.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Người tham gia
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nhóm máu
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {participants.map((participant) => (
                        <tr key={participant.appointmentId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {participant.fullName || participant.username}
                              </div>
                              <div className="text-sm text-gray-500">
                                {participant.phoneNumber || participant.phone}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FaTint className="text-red-500 mr-2" />
                              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                                getBloodTypeName(participant.bloodType) === 'A+' || getBloodTypeName(participant.bloodType) === 'A-' ? 'bg-red-100 text-red-800' :
                                getBloodTypeName(participant.bloodType) === 'B+' || getBloodTypeName(participant.bloodType) === 'B-' ? 'bg-blue-100 text-blue-800' :
                                getBloodTypeName(participant.bloodType) === 'AB+' || getBloodTypeName(participant.bloodType) === 'AB-' ? 'bg-purple-100 text-purple-800' :
                                getBloodTypeName(participant.bloodType) === 'O+' || getBloodTypeName(participant.bloodType) === 'O-' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {participant.bloodType ? getBloodTypeName(participant.bloodType) : 'Chưa cập nhật'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(participant.appointmentStatus)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                             
                              
                              {/* Luôn hiển thị nút check-in để test */}
                              <button
                                onClick={() => handleCheckin(participant.appointmentId, participant.fullName || participant.username)}
                                disabled={checkingIn.has(participant.appointmentId)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {checkingIn.has(participant.appointmentId) ? (
                                  <FaSpinner className="animate-spin mr-1" />
                                ) : (
                                  <FaUserCheck className="mr-1" />
                                )}
                                Check-in
                              </button>
                              
                              {/* Nút ghi nhận hiến máu cho người đã check-in */}
                              {participant.appointmentStatus === 'CheckedIn' && (
                                <button
                                  onClick={() => handleRecordDonation(participant.appointmentId, participant.fullName || participant.username)}
                                  disabled={recordingDonation.has(participant.appointmentId)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {recordingDonation.has(participant.appointmentId) ? (
                                    <FaSpinner className="animate-spin mr-1" />
                                  ) : (
                                    <FaTint className="mr-1" />
                                  )}
                                  Ghi nhận hiến máu
                                </button>
                              )}
                              
                              {/* Badge hoàn thành cho người đã hiến máu */}
                              {participant.appointmentStatus === 'Donated' && (
                                <span className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-green-800 bg-green-100">
                                  <FaCheckCircle className="mr-1" />
                                  Hoàn thành
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State for Events */}
        {events.length === 0 && !loading && !selectedEvent && (
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

      {/* Donation Modal */}
      {showDonationModal && selectedParticipant && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ghi nhận hiến máu - {selectedParticipant.participantName}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhóm máu
                  </label>
                  <select
                    value={donationForm.bloodType}
                    onChange={(e) => setDonationForm(prev => ({ ...prev, bloodType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Chọn nhóm máu</option>
                    <optgroup label="Nhóm A">
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                    </optgroup>
                    <optgroup label="Nhóm B">
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                    </optgroup>
                    <optgroup label="Nhóm AB">
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </optgroup>
                    <optgroup label="Nhóm O">
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thể tích hiến máu (ml)
                  </label>
                  <input
                    type="number"
                    value={donationForm.donationVolume}
                    onChange={(e) => setDonationForm(prev => ({ ...prev, donationVolume: e.target.value }))}
                    placeholder="Nhập thể tích máu"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowDonationModal(false);
                    setSelectedParticipant(null);
                    setDonationForm({ bloodType: '', donationVolume: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={submitDonation}
                  disabled={recordingDonation.has(selectedParticipant.appointmentId)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {recordingDonation.has(selectedParticipant.appointmentId) ? (
                    <>
                      <FaSpinner className="animate-spin inline mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Ghi nhận'
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

export default BloodDonationManagement;
