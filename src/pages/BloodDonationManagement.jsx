﻿import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaHeartbeat, FaCheckCircle, FaUserCheck, FaTint, FaClipboardList, FaArrowLeft, FaSpinner, FaEye, FaEdit, FaSearch } from 'react-icons/fa';
import { getEvents, getRegisteredParticipantsByEventId, recordDonation, checkinParticipant, updateNote } from '../utils/api';
import Toast from '../components/Toast';
import SurveyAnswersModal from '../components/SurveyAnswersModal';

const BloodDonationManagement = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [recordingDonation, setRecordingDonation] = useState(new Set());
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [donationForm, setDonationForm] = useState({ 
    bloodType: '', 
    volume: '', 
    canDonate: true, 
    staffNote: '' 
  });
  const [showSurveyAnswers, setShowSurveyAnswers] = useState(false);
  const [selectedAppointmentForSurvey, setSelectedAppointmentForSurvey] = useState(null);
  const [checkingIn, setCheckingIn] = useState(new Set());
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [updateStatusParticipant, setUpdateStatusParticipant] = useState(null);
  const [reasonCode, setReasonCode] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventSearchTerm, setEventSearchTerm] = useState("");
  const [eventSortField, setEventSortField] = useState("eventDate");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bloodTypeFilter, setBloodTypeFilter] = useState("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch {
      // Silent error handling
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelect = async (event) => {
    try {
      setSelectedEvent(event);
      setParticipantsLoading(true);
      
      const participantsData = await getRegisteredParticipantsByEventId(event.eventId);
      
      if (participantsData && Array.isArray(participantsData)) {
        setParticipants(participantsData);
      } else {
        setParticipants([]);
      }
    } catch {
      setParticipants([]);
    } finally {
      setParticipantsLoading(false);
    }
  };

  const handleRecordDonation = async (participant) => {
    setSelectedParticipant(participant);
    setDonationForm(prev => ({
      ...prev,
      bloodType: participant.bloodType ? getBloodTypeName(participant.bloodType) : '',
    }));
    setShowDonationModal(true);
  };

  const submitDonation = async () => {
    try {
      const bloodTypeToUse = selectedParticipant.bloodType ? getBloodTypeName(selectedParticipant.bloodType) : donationForm.bloodType;
      if (!bloodTypeToUse || !donationForm.volume) {
        return;
      }
      setRecordingDonation(prev => new Set(prev).add(selectedParticipant.appointmentId));
      await recordDonation(
        selectedParticipant.appointmentId,
        bloodTypeToUse,
        parseFloat(donationForm.volume),
        donationForm.canDonate,
        donationForm.staffNote
      );
      setSuccessMessage(`Đã ghi nhận hiến máu thành công cho ${selectedParticipant.fullName || selectedParticipant.username}!`);
      setShowSuccess(true);
      setDonationForm({ bloodType: '', volume: '', canDonate: true, staffNote: '' });
      setShowDonationModal(false);
      setSelectedParticipant(null);
      if (selectedEvent) {
        const participantsData = await getRegisteredParticipantsByEventId(selectedEvent.eventId);
        setParticipants(participantsData);
      }
    } catch {
      // Silent error handling
    } finally {
      setRecordingDonation(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedParticipant.appointmentId);
        return newSet;
      });
    }
  };

  const openSurveyAnswers = (appointmentId) => {
    setSelectedAppointmentForSurvey(appointmentId);
    setShowSurveyAnswers(true);
  };

  const closeSurveyAnswers = () => {
    setShowSurveyAnswers(false);
    setSelectedAppointmentForSurvey(null);
  };

  const refreshParticipants = async () => {
    if (selectedEvent) {
      try {
        const participantsData = await getRegisteredParticipantsByEventId(selectedEvent.eventId);
        if (participantsData && Array.isArray(participantsData)) {
          setParticipants(participantsData);
        } else {
          setParticipants([]);
        }
      } catch (err) {
        console.error('Error refreshing participants:', err);
      }
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
      'Cancelled': { color: 'bg-red-100 text-red-800', text: 'Đã hủy' },
      'Đã đủ điều kiện': { color: 'bg-green-100 text-green-800', text: 'Đã đủ điều kiện' },
      'Không đủ điều kiện': { color: 'bg-red-100 text-red-800', text: 'Không đủ điều kiện' },
      'Đang xét duyệt': { color: 'bg-yellow-100 text-yellow-800', text: 'Đang xét duyệt' },
      'Chờ xử lý': { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ xử lý' }
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

  // Lọc và sắp xếp participants
  const filteredParticipants = participants.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      (p.fullName && p.fullName.toLowerCase().includes(term)) ||
      (p.username && p.username.toLowerCase().includes(term)) ||
      (p.phoneNumber && p.phoneNumber.toLowerCase().includes(term)) ||
      (p.phone && p.phone.toLowerCase().includes(term)) ||
      (getBloodTypeName(p.bloodType) && getBloodTypeName(p.bloodType).toLowerCase().includes(term)) ||
      (p.appointmentStatus && p.appointmentStatus.toLowerCase().includes(term))
    );
    
    const matchesStatus = statusFilter === "all" || p.appointmentStatus === statusFilter;
    const matchesBloodType = bloodTypeFilter === "all" || getBloodTypeName(p.bloodType) === bloodTypeFilter;
    
    return matchesSearch && matchesStatus && matchesBloodType;
  });

  const sortedParticipants = [...filteredParticipants].sort((a, b) => {
    // Sort by fullName by default
    const aValue = (a.fullName || a.username || "").toLowerCase();
    const bValue = (b.fullName || b.username || "").toLowerCase();
    return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
  });

  // Lọc và sắp xếp danh sách sự kiện
  let filteredEvents = events.filter(event => {
    if (!eventSearchTerm.trim()) return true;
    const term = eventSearchTerm.toLowerCase();
    return (
      event.eventTitle?.toLowerCase().includes(term) ||
      event.eventContent?.toLowerCase().includes(term) ||
      event.location?.toLowerCase().includes(term)
    );
  });
  filteredEvents = filteredEvents.sort((a, b) => {
    if (eventSortField === 'eventDate') {
      return new Date(a.eventDate) - new Date(b.eventDate); // Ngày gần nhất lên đầu
    } else if (eventSortField === 'eventTitle') {
      return (a.eventTitle || '').localeCompare(b.eventTitle || '');
    }
    return 0;
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



        {!selectedEvent ? (
          <>
            {/* Search & Sort Bar for Events */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Search */}
              <div className="relative w-full md:max-w-md">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="text"
                  value={eventSearchTerm}
                  onChange={e => setEventSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm sự kiện theo tên, địa điểm hoặc nội dung..."
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full leading-6 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all duration-300 text-base shadow-sm hover:shadow-md focus:shadow-lg"
                />
              </div>
              {/* Sort Buttons */}
              <div className="flex gap-2 justify-center md:justify-end">
                <button
                  type="button"
                  onClick={() => setEventSortField('eventDate')}
                  className={`px-5 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200
                    ${eventSortField === 'eventDate' ? 'bg-red-600 text-white border-red-600 shadow' : 'bg-white text-gray-700 border-gray-200 hover:bg-red-50'}`}
                >
                  Ngày gần nhất
                </button>
                <button
                  type="button"
                  onClick={() => setEventSortField('eventTitle')}
                  className={`px-5 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200
                    ${eventSortField === 'eventTitle' ? 'bg-red-600 text-white border-red-600 shadow' : 'bg-white text-gray-700 border-gray-200 hover:bg-red-50'}`}
                >
                  Tên sự kiện
                </button>
              </div>
            </div>
            {/* Events List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <div
                  key={event.eventId}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer flex flex-col h-full"
                  onClick={() => handleEventSelect(event)}
                >
                  {/* Event Header */}
                  <div className="bg-gradient-to-r from-red-600 to-red-400 p-6 text-white">
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">{event.eventTitle}</h3>
                    <p className="text-red-100 text-sm line-clamp-3">{event.eventContent}</p>
                  </div>

                  {/* Event Details */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center text-gray-600">
                        <FaCalendarAlt className="text-red-500 mr-3 flex-shrink-0" />
                        <span className="font-medium">{formatDate(event.eventDate)}</span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <FaClock className="text-red-500 mr-3 flex-shrink-0" />
                        <span>{formatTime(event.eventTime)}</span>
                      </div>

                      <div className="flex items-start text-gray-600">
                        <FaMapMarkerAlt className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                        <span className="line-clamp-2">{event.location}</span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <FaUsers className="text-red-500 mr-3 flex-shrink-0" />
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
          </>
        ) : (
          /* Participants List */
          <div>
            {/* Back Button */}
            <button
              onClick={() => {
                setSelectedEvent(null);
                setParticipants([]);
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
              <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách người tham gia</h3>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, SĐT, nhóm máu, trạng thái..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm w-full sm:w-64"
                  />
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm w-full sm:w-auto"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="Đã đến">Đã đến</option>
                    <option value="Đã hiến">Đã hiến</option>
                    <option value="Đã hủy">Đã hủy</option>
                    <option value="Đã đủ điều kiện">Đã đủ điều kiện</option>
                    <option value="Registered">Đã đăng ký</option>
                    <option value="CheckedIn">Đã check-in</option>
                    <option value="Donated">Đã hiến máu</option>
                    <option value="Cancelled">Đã hủy</option>
                    <option value="Không đủ điều kiện">Không đủ điều kiện</option>
                    <option value="Đang xét duyệt">Đang xét duyệt</option>
                    <option value="Chờ xử lý">Chờ xử lý</option>
                  </select>
                  <select
                    value={bloodTypeFilter}
                    onChange={e => setBloodTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm w-full sm:w-auto"
                  >
                    <option value="all">Tất cả nhóm máu</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              {participantsLoading ? (
                <div className="p-8 text-center">
                  <FaSpinner className="animate-spin text-red-600 text-2xl mx-auto mb-4" />
                  <p className="text-gray-600">Đang tải danh sách người tham gia...</p>
                </div>
              ) : sortedParticipants.length === 0 ? (
                <div className="p-8 text-center">
                  <FaUsers className="text-gray-400 text-4xl mx-auto mb-4" />
                  <p className="text-gray-600">Chưa có người nào đăng ký tham gia sự kiện này.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                  {sortedParticipants.map((participant) => (
                    <div
                      key={participant.appointmentId}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col h-full"
                    >
                      {/* Card Header */}
                      <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-bold text-gray-900 truncate max-w-[70%] group-hover:text-red-600 transition-colors">
                            {participant.fullName || participant.username}
                          </h4>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            getBloodTypeName(participant.bloodType) === 'A+' || getBloodTypeName(participant.bloodType) === 'A-' ? 'bg-red-100 text-red-800' :
                            getBloodTypeName(participant.bloodType) === 'B+' || getBloodTypeName(participant.bloodType) === 'B-' ? 'bg-blue-100 text-blue-800' :
                            getBloodTypeName(participant.bloodType) === 'AB+' || getBloodTypeName(participant.bloodType) === 'AB-' ? 'bg-purple-100 text-purple-800' :
                            getBloodTypeName(participant.bloodType) === 'O+' || getBloodTypeName(participant.bloodType) === 'O-' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {participant.bloodType ? getBloodTypeName(participant.bloodType) : 'Chưa cập nhật'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {participant.phoneNumber || participant.phone}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="mb-4">
                          {getStatusBadge(participant.appointmentStatus)}
                        </div>

                        {/* Action Buttons - Always take up the same space */}
                        <div className="space-y-2 mt-auto">
                          {/* Nút khảo sát - Always visible */}
                          <button
                            onClick={() => openSurveyAnswers(participant.appointmentId)}
                            className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                            title="Xem khảo sát"
                          >
                            <FaEye className="mr-2" /> Xem khảo sát
                          </button>

                          {/* Conditional buttons with consistent spacing */}
                          <div className="space-y-2">
                            {/* Nút check-in */}
                            {participant.appointmentStatus === 'Đã đủ điều kiện' ? (
                              (() => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const eventDate = new Date(selectedEvent.eventDate);
                                eventDate.setHours(0, 0, 0, 0);
                                const isCheckinDay = today.getTime() === eventDate.getTime();
                                return (
                                  <button
                                    onClick={async () => {
                                      setCheckingIn(prev => new Set(prev).add(participant.appointmentId));
                                      try {
                                        await checkinParticipant(participant.appointmentId);
                                        setSuccessMessage('Check-in thành công!');
                                        setShowSuccess(true);
                                        if (selectedEvent) {
                                          const participantsData = await getRegisteredParticipantsByEventId(selectedEvent.eventId);
                                          setParticipants(participantsData);
                                        }
                                      } catch {
                                        // Silent error handling
                                      } finally {
                                        setCheckingIn(prev => {
                                          const newSet = new Set(prev);
                                          newSet.delete(participant.appointmentId);
                                          return newSet;
                                        });
                                      }
                                    }}
                                    disabled={!isCheckinDay || checkingIn.has(participant.appointmentId)}
                                    className={`w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white ${isCheckinDay ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'} disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
                                    title={isCheckinDay ? 'Check-in' : `Chỉ check-in vào ngày diễn ra sự kiện: ${formatDate(selectedEvent.eventDate)}`}
                                  >
                                    {checkingIn.has(participant.appointmentId) ? (
                                      <FaSpinner className="animate-spin mr-2" />
                                    ) : (
                                      <FaUserCheck className="mr-2" />
                                    )}
                                    Check-in
                                  </button>
                                );
                              })()
                            ) : participant.appointmentStatus === 'Đã đến' ? (
                              <div className="space-y-2">
                                <button
                                  onClick={() => handleRecordDonation(participant)}
                                  disabled={recordingDonation.has(participant.appointmentId)}
                                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                  title="Ghi nhận hiến máu"
                                >
                                  {recordingDonation.has(participant.appointmentId) ? (
                                    <FaSpinner className="animate-spin mr-2" />
                                  ) : (
                                    <FaTint className="mr-2" />
                                  )}
                                  Ghi nhận hiến máu
                                </button>
                                <button
                                  onClick={() => {
                                    setUpdateStatusParticipant(participant);
                                    setShowUpdateStatusModal(true);
                                    setReasonCode('');
                                    setCustomNote('');
                                  }}
                                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 transition-all duration-200"
                                  title="Cập nhật trạng thái không thể hiến máu"
                                >
                                  <FaEdit className="mr-2" />
                                  Cập nhật trạng thái
                                </button>
                              </div>
                            ) : participant.appointmentStatus === 'Donated' ? (
                              <div className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-green-800 bg-green-100">
                                <FaCheckCircle className="mr-2" /> Hoàn thành hiến máu
                              </div>
                            ) : (
                              // Placeholder div to maintain consistent height
                              <div className="h-10"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                Ghi nhận hiến máu - {selectedParticipant.fullName || selectedParticipant.username}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhóm máu <span className="text-red-500">*</span>
                  </label>
                  {selectedParticipant.bloodType ? (
                    <input
                      type="text"
                      value={getBloodTypeName(selectedParticipant.bloodType)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                    />
                  ) : (
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
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thể tích hiến máu (ml) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={donationForm.volume}
                    onChange={(e) => setDonationForm(prev => ({ ...prev, volume: e.target.value }))}
                    placeholder="Nhập thể tích máu (ml)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canDonate"
                    checked={donationForm.canDonate}
                    onChange={(e) => setDonationForm(prev => ({ ...prev, canDonate: e.target.checked }))}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="canDonate" className="ml-2 block text-sm text-gray-900">
                    Có thể hiến máu
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú của nhân viên
                  </label>
                  <textarea
                    value={donationForm.staffNote}
                    onChange={(e) => setDonationForm(prev => ({ ...prev, staffNote: e.target.value }))}
                    placeholder="Nhập ghi chú (tùy chọn)"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowDonationModal(false);
                    setSelectedParticipant(null);
                    setDonationForm({ bloodType: '', volume: '', canDonate: true, staffNote: '' });
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

      {/* Survey Answers Modal */}
      {showSurveyAnswers && selectedAppointmentForSurvey && (
        <SurveyAnswersModal
          appointmentId={selectedAppointmentForSurvey}
          onClose={closeSurveyAnswers}
          onStatusUpdate={refreshParticipants}
        />
      )}

      {/* Modal cập nhật trạng thái */}
      {showUpdateStatusModal && updateStatusParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Cập nhật trạng thái không thể hiến máu</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Lý do không thể hiến máu <span className="text-red-500">*</span></label>
              <select
                value={reasonCode}
                onChange={e => setReasonCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Chọn lý do</option>
                <option value="HIGH_BP">Huyết áp cao trên 140/90</option>
                <option value="HEART_RATE">Nhịp tim bất thường</option>
                <option value="LOW_BP">Huyết áp thấp dưới 90/60</option>
                <option value="LOW_HB">Thiếu Hemoglobin (Hb)</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú bổ sung</label>
              <textarea
                value={customNote}
                onChange={e => setCustomNote(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                placeholder="Nhập ghi chú (nếu có)"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowUpdateStatusModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  if (!reasonCode) {
                    return;
                  }
                  setUpdatingStatus(true);
                  try {
                    await updateNote(updateStatusParticipant.appointmentId, reasonCode, customNote);
                    setSuccessMessage('Cập nhật trạng thái thành công!');
                    setShowSuccess(true);
                    setShowUpdateStatusModal(false);
                    setUpdateStatusParticipant(null);
                    setReasonCode('');
                    setCustomNote('');
                    // Refresh participants
                    if (selectedEvent) {
                      const participantsData = await getRegisteredParticipantsByEventId(selectedEvent.eventId);
                      setParticipants(participantsData);
                    }
                  } catch {
                    // Silent error
                  } finally {
                    setUpdatingStatus(false);
                  }
                }}
                disabled={updatingStatus}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingStatus ? 'Đang cập nhật...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodDonationManagement;
