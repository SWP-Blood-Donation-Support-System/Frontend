import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaHeartbeat, FaPlus, FaEdit, FaTrash, FaSpinner, FaSearch, FaFilter, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../utils/api';
import Toast from '../components/Toast';

const EventsManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [formData, setFormData] = useState({
    eventDate: '',
    eventTime: '',
    eventTitle: '',
    eventContent: '',
    location: '',
    maxParticipants: ''
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'eventTitle': {
        if (!value.trim()) return 'Tiêu đề sự kiện không được để trống';
        if (value.trim().length < 5) return 'Tiêu đề sự kiện phải có ít nhất 5 ký tự';
        if (value.trim().length > 100) return 'Tiêu đề sự kiện không được quá 100 ký tự';
        return '';
      }
      
      case 'eventContent': {
        if (!value.trim()) return 'Nội dung sự kiện không được để trống';
        if (value.trim().length < 20) return 'Nội dung sự kiện phải có ít nhất 20 ký tự';
        if (value.trim().length > 1000) return 'Nội dung sự kiện không được quá 1000 ký tự';
        return '';
      }
      
      case 'location': {
        if (!value.trim()) return 'Địa điểm không được để trống';
        if (value.trim().length < 5) return 'Địa điểm phải có ít nhất 5 ký tự';
        if (value.trim().length > 200) return 'Địa điểm không được quá 200 ký tự';
        return '';
      }
      
      case 'maxParticipants': {
        if (!value) return 'Số lượng tối đa không được để trống';
        const num = parseInt(value);
        if (isNaN(num) || num < 1) return 'Số lượng tối đa phải là số nguyên dương';
        if (num > 1000) return 'Số lượng tối đa không được quá 1000';
        return '';
      }
      
      case 'eventDate': {
        if (!value) return 'Ngày diễn ra không được để trống';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) return 'Ngày diễn ra không được là ngày trong quá khứ';
        return '';
      }
      
      case 'eventTime': {
        if (!value) return 'Giờ diễn ra không được để trống';
        return '';
      }
      
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const getFieldClassName = (fieldName) => {
    const baseClasses = "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent";
    const hasError = errors[fieldName] && touched[fieldName];
    const hasSuccess = !errors[fieldName] && touched[fieldName] && formData[fieldName];
    
    if (hasError) {
      return `${baseClasses} border-red-300 focus:ring-red-500 bg-red-50`;
    } else if (hasSuccess) {
      return `${baseClasses} border-green-300 focus:ring-green-500 bg-green-50`;
    } else {
      return `${baseClasses} border-gray-300 focus:ring-red-500`;
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched and validate
    const allTouched = {};
    Object.keys(formData).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);
    
    // Validate form
    if (!validateForm()) {
      setError('Vui lòng kiểm tra và sửa các lỗi trong form.');
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      const eventData = {
        ...formData,
        maxParticipants: parseInt(formData.maxParticipants)
      };

      if (isEditing) {
        await updateEvent(editingEvent.eventId, eventData);
        setSuccessMessage('Cập nhật sự kiện thành công!');
      } else {
        await createEvent(eventData);
        setSuccessMessage('Tạo sự kiện thành công!');
      }

      setShowSuccess(true);
      setShowModal(false);
      resetForm();
      fetchEvents();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      console.error('Error submitting event:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (event) => {
    setIsEditing(true);
    setEditingEvent(event);
    setFormData({
      eventDate: event.eventDate.split('T')[0],
      eventTime: event.eventTime,
      eventTitle: event.eventTitle,
      eventContent: event.eventContent,
      location: event.location,
      maxParticipants: event.maxParticipants.toString()
    });
    setErrors({});
    setTouched({});
    setShowModal(true);
  };

  const handleDelete = async (eventId, eventTitle) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sự kiện "${eventTitle}"?`)) {
      return;
    }

    setDeletingEvent(eventId);
    try {
      await deleteEvent(eventId);
      setSuccessMessage('Xóa sự kiện thành công!');
      setShowSuccess(true);
      fetchEvents();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi xóa sự kiện.');
      console.error('Error deleting event:', err);
    } finally {
      setDeletingEvent(null);
    }
  };

  const resetForm = () => {
    setFormData({
      eventDate: '',
      eventTime: '',
      eventTitle: '',
      eventContent: '',
      location: '',
      maxParticipants: ''
    });
    setIsEditing(false);
    setEditingEvent(null);
    setErrors({});
    setTouched({});
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
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

  const getEventStatus = (eventDate) => {
    const today = new Date();
    const eventDateObj = new Date(eventDate);
    
    if (eventDateObj.toDateString() === today.toDateString()) return 'today';
    if (eventDateObj > today) return 'upcoming';
    return 'past';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'today': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'upcoming': return 'bg-green-100 text-green-800 border-green-200';
      case 'past': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'today': return 'Hôm nay';
      case 'upcoming': return 'Sắp tới';
      case 'past': return 'Đã qua';
      default: return 'Không xác định';
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const eventStatus = getEventStatus(event.eventDate);
    return matchesSearch && eventStatus === filterStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Đang tải danh sách sự kiện...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {showSuccess && (
        <Toast
          message={successMessage}
          type="success"
          onClose={() => setShowSuccess(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-400 rounded-2xl flex items-center justify-center shadow-lg">
              <FaHeartbeat className="text-white text-2xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý sự kiện hiến máu
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tạo, cập nhật và quản lý các sự kiện hiến máu một cách hiệu quả
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-6 animate-shake">
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

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sự kiện..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">Tất cả sự kiện</option>
                  <option value="upcoming">Sắp tới</option>
                  <option value="today">Hôm nay</option>
                  <option value="past">Đã qua</option>
                </select>
              </div>
            </div>

            <button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <FaPlus className="mr-2" />
              Tạo sự kiện mới
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng sự kiện</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaCalendarAlt className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sắp tới</p>
                <p className="text-2xl font-bold text-green-600">
                  {events.filter(e => getEventStatus(e.eventDate) === 'upcoming').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaClock className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hôm nay</p>
                <p className="text-2xl font-bold text-orange-600">
                  {events.filter(e => getEventStatus(e.eventDate) === 'today').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <FaHeartbeat className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã qua</p>
                <p className="text-2xl font-bold text-gray-600">
                  {events.filter(e => getEventStatus(e.eventDate) === 'past').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <FaUsers className="text-gray-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCalendarAlt className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' ? 'Không tìm thấy sự kiện' : 'Chưa có sự kiện nào'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                : 'Hãy tạo sự kiện hiến máu đầu tiên'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={openCreateModal}
                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
              >
                <FaPlus className="inline mr-2" />
                Tạo sự kiện đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const eventStatus = getEventStatus(event.eventDate);
              return (
                <div
                  key={event.eventId}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 text-white relative">
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(eventStatus)}`}>
                        {getStatusText(eventStatus)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 pr-20">{event.eventTitle}</h3>
                    <p className="text-red-100 text-sm line-clamp-2">{event.eventContent}</p>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
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

                    <div className="mt-6 flex space-x-3">
                      <button
                        onClick={() => handleEdit(event)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center"
                      >
                        <FaEdit className="mr-2" />
                        Sửa
                      </button>
                      
                      <button
                        onClick={() => handleDelete(event.eventId, event.eventTitle)}
                        disabled={deletingEvent === event.eventId}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {deletingEvent === event.eventId ? (
                          <FaSpinner className="animate-spin mr-2" />
                        ) : (
                          <FaTrash className="mr-2" />
                        )}
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Cập nhật sự kiện' : 'Tạo sự kiện mới'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiêu đề sự kiện <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="eventTitle"
                      value={formData.eventTitle}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getFieldClassName('eventTitle')}
                      placeholder="Nhập tiêu đề sự kiện"
                      required
                    />
                    {touched.eventTitle && errors.eventTitle && (
                      <p className="text-red-500 text-xs mt-1"><FaExclamationTriangle className="inline mr-1" /> {errors.eventTitle}</p>
                    )}
                    {formData.eventTitle && !errors.eventTitle && (
                      <p className="text-green-600 text-xs mt-1"><FaCheck className="inline mr-1" /> Tốt</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số lượng tối đa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="maxParticipants"
                      value={formData.maxParticipants}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getFieldClassName('maxParticipants')}
                      placeholder="Nhập số lượng"
                      required
                    />
                    {touched.maxParticipants && errors.maxParticipants && (
                      <p className="text-red-500 text-xs mt-1"><FaExclamationTriangle className="inline mr-1" /> {errors.maxParticipants}</p>
                    )}
                    {formData.maxParticipants && !errors.maxParticipants && (
                      <p className="text-green-600 text-xs mt-1"><FaCheck className="inline mr-1" /> Tốt</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="eventContent"
                    value={formData.eventContent}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    rows="4"
                    className={getFieldClassName('eventContent')}
                    placeholder="Mô tả chi tiết về sự kiện"
                    required
                  />
                  {touched.eventContent && errors.eventContent && (
                    <p className="text-red-500 text-xs mt-1"><FaExclamationTriangle className="inline mr-1" /> {errors.eventContent}</p>
                  )}
                  {formData.eventContent && !errors.eventContent && (
                    <p className="text-green-600 text-xs mt-1"><FaCheck className="inline mr-1" /> Tốt</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày diễn ra <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getFieldClassName('eventDate')}
                      required
                    />
                    {touched.eventDate && errors.eventDate && (
                      <p className="text-red-500 text-xs mt-1"><FaExclamationTriangle className="inline mr-1" /> {errors.eventDate}</p>
                    )}
                    {formData.eventDate && !errors.eventDate && (
                      <p className="text-green-600 text-xs mt-1"><FaCheck className="inline mr-1" /> Tốt</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giờ diễn ra <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="eventTime"
                      value={formData.eventTime}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getFieldClassName('eventTime')}
                      required
                    />
                    {touched.eventTime && errors.eventTime && (
                      <p className="text-red-500 text-xs mt-1"><FaExclamationTriangle className="inline mr-1" /> {errors.eventTime}</p>
                    )}
                    {formData.eventTime && !errors.eventTime && (
                      <p className="text-green-600 text-xs mt-1"><FaCheck className="inline mr-1" /> Tốt</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa điểm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getFieldClassName('location')}
                      placeholder="Nhập địa điểm"
                      required
                    />
                    {touched.location && errors.location && (
                      <p className="text-red-500 text-xs mt-1"><FaExclamationTriangle className="inline mr-1" /> {errors.location}</p>
                    )}
                    {formData.location && !errors.location && (
                      <p className="text-green-600 text-xs mt-1"><FaCheck className="inline mr-1" /> Tốt</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-500 rounded-xl hover:from-red-700 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin inline mr-2" />
                        Đang xử lý...
                      </>
                    ) : (
                      isEditing ? 'Cập nhật sự kiện' : 'Tạo sự kiện'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsManagement; 