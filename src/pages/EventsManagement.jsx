import { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaHeartbeat,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaExclamationTriangle,
  FaCheck,
  FaHospital,
  FaChevronDown,
  FaTint,
} from "react-icons/fa";
import { getEvents, createEvent, updateEvent, deleteEvent } from "../utils/api";
import Toast from "../components/Toast";

const EventsManagement = () => {
  const [events, setEvents] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [pendingDeleteEvent, setPendingDeleteEvent] = useState(null);

  const [formData, setFormData] = useState({
    eventDate: "",
    eventTime: "",
    eventTitle: "",
    eventContent: "",
    location: "",
    maxParticipants: "",
    bloodTypeRequired: "",
    eventStatus: "Public",
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Fetch hospitals
  const fetchHospitals = async () => {
    try {
      const response = await fetch(
        "https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Hospital/GetAll"
      );
      if (response.ok) {
        const data = await response.json();
        setHospitals(data || []);
      }
    } catch (err) {
      console.error("Error fetching hospitals:", err);
    }
  };

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case "eventTitle": {
        if (!value.trim()) return "Tiêu đề sự kiện không được để trống";
        if (value.trim().length < 5)
          return "Tiêu đề sự kiện phải có ít nhất 5 ký tự";
        if (value.trim().length > 100)
          return "Tiêu đề sự kiện không được quá 100 ký tự";
        return "";
      }

      case "eventContent": {
        if (!value.trim()) return "Nội dung sự kiện không được để trống";
        if (value.trim().length < 20)
          return "Nội dung sự kiện phải có ít nhất 20 ký tự";
        if (value.trim().length > 1000)
          return "Nội dung sự kiện không được quá 1000 ký tự";
        return "";
      }

      case "location": {
        if (!value.trim()) return "Địa điểm không được để trống";
        if (value.trim().length < 5) return "Địa điểm phải có ít nhất 5 ký tự";
        if (value.trim().length > 200)
          return "Địa điểm không được quá 200 ký tự";
        return "";
      }

      case "maxParticipants": {
        if (!value) return "Số lượng tối đa không được để trống";
        const num = parseInt(value);
        if (isNaN(num) || num < 1)
          return "Số lượng tối đa phải là số nguyên dương";
        if (num > 1000) return "Số lượng tối đa không được quá 1000";
        return "";
      }

      case "eventDate": {
        if (!value) return "Ngày diễn ra không được để trống";
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today)
          return "Ngày diễn ra không được là ngày trong quá khứ";
        return "";
      }

      case "eventTime": {
        if (!value) return "Giờ diễn ra không được để trống";

        // Kiểm tra nếu ngày là hôm nay thì giờ phải trong tương lai
        if (formData.eventDate) {
          const selectedDate = new Date(formData.eventDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (selectedDate.getTime() === today.getTime()) {
            const now = new Date();
            const selectedTime = new Date(`${formData.eventDate}T${value}`);
            if (selectedTime <= now) {
              return "Giờ diễn ra phải trong tương lai nếu sự kiện là hôm nay";
            }
          }
        }
        return "";
      }

      case "bloodTypeRequired": {
        // bloodTypeRequired can be empty (null) or a valid blood type
        if (
          value &&
          !["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].includes(value)
        ) {
          return "Nhóm máu không hợp lệ";
        }
        return "";
      }

      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const getFieldClassName = (fieldName) => {
    const baseClasses =
      "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent";
    const hasError = errors[fieldName] && touched[fieldName];
    const hasSuccess =
      !errors[fieldName] && touched[fieldName] && formData[fieldName];

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
    fetchHospitals();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showHospitalDropdown && !event.target.closest(".hospital-dropdown")) {
        setShowHospitalDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showHospitalDropdown]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched and validate
    const allTouched = {};
    Object.keys(formData).forEach((field) => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    // Validate form
    if (!validateForm()) {
      setError("Vui lòng kiểm tra và sửa các lỗi trong form.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const eventData = {
        ...formData,
        maxParticipants: parseInt(formData.maxParticipants),
        bloodTypeRequired: formData.bloodTypeRequired || null,
        // eventStatus đã nằm trong formData
      };

      if (isEditing) {
        await updateEvent(editingEvent.eventId, eventData);
        setSuccessMessage("Cập nhật sự kiện thành công!");
      } else {
        await createEvent(eventData);
        setSuccessMessage("Tạo sự kiện thành công!");
      }

      setShowSuccess(true);
      setShowModal(false);
      resetForm();
      fetchEvents();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
      console.error("Error submitting event:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (event) => {
    setIsEditing(true);
    setEditingEvent(event);
    setFormData({
      eventDate: event.eventDate.split("T")[0],
      eventTime: event.eventTime,
      eventTitle: event.eventTitle,
      eventContent: event.eventContent,
      location: event.location,
      maxParticipants: event.maxParticipants.toString(),
      bloodTypeRequired: event.bloodTypeRequired || "",
      eventStatus: event.eventStatus || "Public",
    });
    setErrors({});
    setTouched({});
    setShowModal(true);
  };

  const handleDelete = (eventId, eventTitle) => {
    setPendingDeleteEvent({ eventId, eventTitle });
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteEvent = async () => {
    if (!pendingDeleteEvent) return;

    const { eventId } = pendingDeleteEvent;

    setDeletingEvent(eventId);
    try {
      await deleteEvent(eventId);
      setSuccessMessage("Xóa sự kiện thành công!");
      setShowSuccess(true);
      fetchEvents();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi xóa sự kiện.");
      console.error("Error deleting event:", err);
    } finally {
      setDeletingEvent(null);
    }

    setShowDeleteConfirmModal(false);
    setPendingDeleteEvent(null);
  };

  const cancelDeleteEvent = () => {
    setShowDeleteConfirmModal(false);
    setPendingDeleteEvent(null);
  };

  const resetForm = () => {
    setFormData({
      eventDate: "",
      eventTime: "",
      eventTitle: "",
      eventContent: "",
      location: "",
      maxParticipants: "",
      bloodTypeRequired: "",
      eventStatus: "Public",
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
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  const getEventStatus = (eventDate) => {
    const today = new Date();
    const eventDateObj = new Date(eventDate);

    if (eventDateObj.toDateString() === today.toDateString()) return "today";
    if (eventDateObj > today) return "upcoming";
    return "past";
  };

 

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === 'all') return matchesSearch;
    // Normalize eventStatus for filtering
    let status = (event.eventStatus || '').toLowerCase();
    if (status === 'cancelled') status = 'cancel';
    if (status === 'public' || status === 'private' || status === 'cancel') {
      return matchesSearch && status === filterStatus.toLowerCase();
    }
    return false;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">
            Đang tải danh sách sự kiện...
          </p>
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

      {/* Modal xác nhận xóa sự kiện */}
      {showDeleteConfirmModal && pendingDeleteEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Xác nhận xóa sự kiện
                </h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Bạn có chắc chắn muốn xóa sự kiện{" "}
                <span className="font-semibold text-gray-900">
                  "{pendingDeleteEvent.eventTitle}"
                </span>
                ?
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Hành động này không thể hoàn tác. Tất cả thông tin về sự kiện
                này sẽ bị xóa vĩnh viễn.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteEvent}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDeleteEvent}
                disabled={deletingEvent === pendingDeleteEvent.eventId}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-md transition-colors duration-200 disabled:cursor-not-allowed flex items-center"
              >
                {deletingEvent === pendingDeleteEvent.eventId ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang xóa...
                  </>
                ) : (
                  "Xác nhận xóa"
                )}
              </button>
            </div>
          </div>
        </div>
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
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="space-y-6">
            {/* Search and Sort Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên sự kiện, địa điểm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                />
              </div>
              {/* Sort by eventStatus */}
              <div className="flex gap-2 items-center justify-center lg:justify-start mt-4 lg:mt-0">
                <span className="text-gray-700 font-medium">Trạng thái:</span>
                {['all', 'Public', 'Private', 'Cancel'].map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-full border-2 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200
                      ${filterStatus === status ?
                        (status === 'Public' ? 'bg-green-600 text-white border-green-600 shadow' :
                         status === 'Private' ? 'bg-yellow-500 text-white border-yellow-500 shadow' :
                         status === 'Cancelled' ? 'bg-gray-500 text-white border-gray-500 shadow' :
                         'bg-red-600 text-white border-red-600 shadow')
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-red-50'}`}
                  >
                    {status === 'all' ? 'Tất cả' : status}
                  </button>
                ))}
              </div>
              {/* Create Event Button */}
              <button
                onClick={openCreateModal}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center group"
              >
                <FaPlus className="mr-3 text-lg group-hover:rotate-90 transition-transform duration-200" />
                <span className="text-lg">Tạo sự kiện mới</span>
              </button>
            </div>

            {/* Search Results Info */}
            {searchTerm && (
              <div className="flex items-center justify-between text-sm text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center">
                  <FaSearch className="mr-2 text-blue-500" />
                  <span>
                    Kết quả tìm kiếm cho:{" "}
                    <span className="font-semibold text-blue-700">
                      "{searchTerm}"
                    </span>
                  </span>
                </div>
                <span className="font-medium">
                  {filteredEvents.length} sự kiện tìm thấy
                </span>
              </div>
            )}

            {/* Filter Status Info */}
            {filterStatus !== "all" && !searchTerm && (
              <div className="flex items-center justify-between text-sm text-gray-600 bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center">
                  <FaFilter className="mr-2 text-green-500" />
                  <span>
                    Đang lọc:{" "}
                    <span className="font-semibold text-green-700">
                      {filterStatus === "upcoming"
                        ? "Sự kiện sắp tới"
                        : filterStatus === "today"
                        ? "Sự kiện hôm nay"
                        : filterStatus === "past"
                        ? "Sự kiện đã qua"
                        : "Tất cả sự kiện"}
                    </span>
                  </span>
                </div>
                <span className="font-medium">
                  {filteredEvents.length} sự kiện
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tổng sự kiện
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaCalendarAlt className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hôm nay</p>
                <p className="text-2xl font-bold text-orange-600">
                  {
                    events.filter(
                      (e) => getEventStatus(e.eventDate) === "today"
                    ).length
                  }
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
                  {
                    events.filter((e) => getEventStatus(e.eventDate) === "past")
                      .length
                  }
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
              {searchTerm || filterStatus !== "all"
                ? "Không tìm thấy sự kiện"
                : "Chưa có sự kiện nào"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== "all"
                ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
                : "Hãy tạo sự kiện hiến máu đầu tiên"}
            </p>
            {!searchTerm && filterStatus === "all" && (
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
              return (
                <div
                  key={event.eventId}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 flex flex-col h-full"
                >
                  <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 text-white relative">
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border
                        ${event.eventStatus === 'Public' ? 'bg-green-100 text-green-700 border-green-200' :
                          event.eventStatus === 'Private' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                          'bg-gray-100 text-gray-700 border-gray-200'}`}
                      >
                        {event.eventStatus === 'Public' ? 'Public' : event.eventStatus === 'Private' ? 'Private' : 'Cancel'}
                      </span>
                      
                    </div>
                    <h3 className="text-xl font-bold mb-2 pr-20 line-clamp-2">
                      {event.eventTitle}
                    </h3>
                    <p className="text-red-100 text-sm line-clamp-3">
                      {event.eventContent}
                    </p>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center text-gray-600">
                        <FaCalendarAlt className="text-red-500 mr-3 flex-shrink-0" />
                        <span className="font-medium line-clamp-1">
                          {formatDate(event.eventDate)}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <FaClock className="text-red-500 mr-3 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {formatTime(event.eventTime)}
                        </span>
                      </div>

                      <div className="flex items-start text-gray-600">
                        <FaMapMarkerAlt className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                        <span className="line-clamp-2">{event.location}</span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <FaUsers className="text-red-500 mr-3 flex-shrink-0" />
                        <span className="line-clamp-1">
                          Tối đa {event.maxParticipants} người tham gia
                        </span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <FaTint className="text-red-500 mr-3 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {event.bloodTypeRequired
                            ? `Nhóm máu: ${event.bloodTypeRequired}`
                            : "Tất cả nhóm máu"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex space-x-3">
                      <button
                        onClick={() => handleEdit(event)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center"
                      >
                        <FaEdit className="mr-2" />
                        Sửa
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(event.eventId, event.eventTitle)
                        }
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
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto border border-red-100">
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4 border-b pb-4">
                <FaPlus className="text-red-500 text-2xl" />
                <h3 className="text-2xl font-bold text-gray-900">
                  {isEditing ? "Cập nhật sự kiện" : "Tạo sự kiện mới"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Đóng"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaCalendarAlt className="text-red-400" /> Ngày diễn ra <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("eventDate") + " text-base"}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                  {touched.eventDate && errors.eventDate && (
                    <p className="text-red-500 text-xs mt-1 flex items-center"><FaExclamationTriangle className="inline mr-1" /> {errors.eventDate}</p>
                  )}
                  {formData.eventDate && !errors.eventDate && (
                    <p className="text-green-600 text-xs mt-1 flex items-center"><FaCheck className="inline mr-1" /> Hợp lệ</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaClock className="text-red-400" /> Giờ diễn ra <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="eventTime"
                    value={formData.eventTime}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("eventTime") + " text-base"}
                    required
                  />
                  {touched.eventTime && errors.eventTime && (
                    <p className="text-red-500 text-xs mt-1 flex items-center"><FaExclamationTriangle className="inline mr-1" /> {errors.eventTime}</p>
                  )}
                  {formData.eventTime && !errors.eventTime && (
                    <p className="text-green-600 text-xs mt-1 flex items-center"><FaCheck className="inline mr-1" /> Hợp lệ</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaEdit className="text-red-400" /> Tiêu đề sự kiện <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="eventTitle"
                    value={formData.eventTitle}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("eventTitle") + " text-base"}
                    placeholder="Nhập tiêu đề sự kiện"
                    required
                  />
                  {touched.eventTitle && errors.eventTitle && (
                    <p className="text-red-500 text-xs mt-1 flex items-center"><FaExclamationTriangle className="inline mr-1" /> {errors.eventTitle}</p>
                  )}
                  {formData.eventTitle && !errors.eventTitle && (
                    <p className="text-green-600 text-xs mt-1 flex items-center"><FaCheck className="inline mr-1" /> Hợp lệ</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaHeartbeat className="text-red-400" /> Nội dung sự kiện <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="eventContent"
                    value={formData.eventContent}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("eventContent") + " text-base min-h-[80px]"}
                    placeholder="Nhập nội dung chi tiết về sự kiện, địa điểm, thời gian, lưu ý..."
                    required
                  />
                  {touched.eventContent && errors.eventContent && (
                    <p className="text-red-500 text-xs mt-1 flex items-center"><FaExclamationTriangle className="inline mr-1" /> {errors.eventContent}</p>
                  )}
                  {formData.eventContent && !errors.eventContent && (
                    <p className="text-green-600 text-xs mt-1 flex items-center"><FaCheck className="inline mr-1" /> Hợp lệ</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-red-400" /> Địa điểm <span className="text-red-500">*</span>
                  </label>
                  <div className="relative hospital-dropdown">
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      onFocus={() => setShowHospitalDropdown(true)}
                      className={getFieldClassName("location") + " text-base"}
                      placeholder="Nhập địa điểm hoặc chọn bệnh viện"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowHospitalDropdown(!showHospitalDropdown)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      <FaChevronDown className={`transition-transform ${showHospitalDropdown ? "rotate-180" : ""}`} />
                    </button>
                    {showHospitalDropdown && hospitals.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2">
                          <div className="text-xs font-medium text-gray-500 mb-2 px-2">Chọn bệnh viện:</div>
                          {hospitals.map((hospital) => (
                            <button
                              key={hospital.id || hospital.hospitalId}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, location: hospital.name || hospital.hospitalName }));
                                setShowHospitalDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md flex items-center"
                            >
                              <FaHospital className="text-red-500 mr-2 flex-shrink-0" />
                              <span>{hospital.name || hospital.hospitalName}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {touched.location && errors.location && (
                    <p className="text-red-500 text-xs mt-1 flex items-center"><FaExclamationTriangle className="inline mr-1" /> {errors.location}</p>
                  )}
                  {formData.location && !errors.location && (
                    <p className="text-green-600 text-xs mt-1 flex items-center"><FaCheck className="inline mr-1" /> Hợp lệ</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaUsers className="text-red-400" /> Số lượng tối đa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("maxParticipants") + " text-base"}
                    min={1}
                    max={1000}
                    placeholder="Nhập số lượng tối đa"
                    required
                  />
                  {touched.maxParticipants && errors.maxParticipants && (
                    <p className="text-red-500 text-xs mt-1 flex items-center"><FaExclamationTriangle className="inline mr-1" /> {errors.maxParticipants}</p>
                  )}
                  {formData.maxParticipants && !errors.maxParticipants && (
                    <p className="text-green-600 text-xs mt-1 flex items-center"><FaCheck className="inline mr-1" /> Hợp lệ</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaTint className="text-red-400" /> Nhóm máu yêu cầu
                  </label>
                  <select
                    name="bloodTypeRequired"
                    value={formData.bloodTypeRequired}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("bloodTypeRequired") + " text-base"}
                  >
                    <option value="">Tất cả nhóm máu</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  {touched.bloodTypeRequired && errors.bloodTypeRequired && (
                    <p className="text-red-500 text-xs mt-1 flex items-center"><FaExclamationTriangle className="inline mr-1" /> {errors.bloodTypeRequired}</p>
                  )}
                  {formData.bloodTypeRequired && !errors.bloodTypeRequired && (
                    <p className="text-green-600 text-xs mt-1 flex items-center"><FaCheck className="inline mr-1" /> Hợp lệ</p>
                  )}
                </div>
              </div>

              {/* Status Selector moved to bottom */}
              <div className="flex gap-2 justify-end border-t pt-6 mt-2">
                {["Public", "Private", "Cancel"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, eventStatus: status }))}
                    className={`px-5 py-2 rounded-full border-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200
                      ${formData.eventStatus === status
                        ? status === "Public"
                          ? "bg-green-100 text-green-700 border-green-400 shadow"
                          : status === "Private"
                          ? "bg-yellow-100 text-yellow-700 border-yellow-400 shadow"
                          : "bg-gray-100 text-gray-700 border-gray-400 shadow"
                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}
                    `}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 rounded-2xl shadow-lg hover:from-red-700 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  {submitting ? (
                    <><FaSpinner className="animate-spin" /> Đang xử lý...</>
                  ) : isEditing ? (
                    <><FaEdit /> Cập nhật sự kiện</>
                  ) : (
                    <><FaPlus /> Tạo sự kiện</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsManagement;
