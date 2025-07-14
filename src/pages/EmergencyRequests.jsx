import React, { useState, useEffect } from 'react';
import { getAuthToken, getUser } from '../utils/api';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaClock, 
  FaCheck, 
  FaTimes, 
  FaTint, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaUser, 
  FaExclamationTriangle,
  FaStickyNote,
  FaUserMd,
  FaImage,
  FaCalendarCheck,
  FaInbox,
  FaQuestion,
  FaInfoCircle
} from 'react-icons/fa';
import ImageUpload from '../components/ImageUpload';

const EmergencyRegisterForm = ({ onEmergencyCreated }) => {
  const [form, setForm] = useState({
    bloodType: '',
    requiredUnits: '',
    hospitalId: '',
    emergencyMedical: '',
    emergencyImage: '',
    endDate: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hospitals, setHospitals] = useState([]);

  const bloodTypes = [
    { value: 'A+', label: 'A+ (A Rh+)' },
    { value: 'A-', label: 'A- (A Rh-)' },
    { value: 'B+', label: 'B+ (B Rh+)' },
    { value: 'B-', label: 'B- (B Rh-)' },
    { value: 'AB+', label: 'AB+ (AB Rh+)' },
    { value: 'AB-', label: 'AB- (AB Rh-)' },
    { value: 'O+', label: 'O+ (O Rh+)' },
    { value: 'O-', label: 'O- (O Rh-)' },
  ];

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'bloodType':
        return !value ? 'Vui lòng chọn nhóm máu' : '';
      case 'requiredUnits':
        if (!value) return 'Vui lòng nhập số đơn vị máu cần thiết';
        if (isNaN(value) || parseInt(value) < 1) return 'Số đơn vị máu phải lớn hơn 0';
        if (parseInt(value) > 50) return 'Số đơn vị máu không được vượt quá 50';
        return '';
      case 'hospitalId':
        return !value ? 'Vui lòng chọn bệnh viện' : '';
      case 'emergencyMedical':
        if (!value) return 'Vui lòng mô tả tình trạng khẩn cấp';
        if (value.trim().length < 10) return 'Mô tả phải có ít nhất 10 ký tự';
        if (value.trim().length > 1000) return 'Mô tả không được vượt quá 1000 ký tự';
        return '';
      case 'endDate':
        if (!value) return 'Vui lòng chọn ngày kết thúc';
        {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) return 'Ngày kết thúc không được trong quá khứ';
        }
        return '';
      case 'emergencyImage':
        if (value && !isValidUrl(value)) return 'Vui lòng nhập URL hợp lệ';
        return '';
      default:
        return '';
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Validate field when user types
    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const fieldError = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    if (!validateForm()) {
      setError('Vui lòng kiểm tra và sửa các lỗi trong form');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Emergency/RegisterEmergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess('Đăng ký đơn khẩn cấp thành công!');
      setForm({ bloodType: '', requiredUnits: '', hospitalId: '', emergencyMedical: '', emergencyImage: '', endDate: '' });
      setErrors({});
      setTouched({});
      
      // Thông báo cho component cha biết đã tạo đơn thành công
      if (onEmergencyCreated) {
        onEmergencyCreated();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Hospital/GetAll');
        if (!res.ok) throw new Error('Không thể tải danh sách bệnh viện');
        const data = await res.json();
        setHospitals(data);
      } catch {
        setHospitals([]);
      }
    };
    fetchHospitals();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center shadow-2xl mb-6 transform hover:scale-105 transition-transform duration-300">
              <FaExclamationTriangle className="text-white text-3xl" />
            </div>
            <div className="absolute -top-2 -right-2 bg-red-400 rounded-full w-8 h-8 flex items-center justify-center">
              <FaTint className="text-white text-sm" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Tạo Đơn Khẩn Cấp
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Điền thông tin chi tiết để tạo yêu cầu hiến máu khẩn cấp. 
            Đơn của bạn sẽ được xét duyệt nhanh chóng bởi đội ngũ y tế.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-2xl border border-red-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-2">
                <FaPlus className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Thông Tin Khẩn Cấp</h2>
                <p className="text-red-100 text-sm">Vui lòng điền đầy đủ thông tin bên dưới</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Blood Information Section */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-red-500 rounded-full p-2">
                    <FaTint className="text-white text-sm" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Thông Tin Máu Cần Thiết</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Nhóm máu cần thiết <span className="text-red-500">*</span>
                    </label>
                    <select 
                      name="bloodType" 
                      value={form.bloodType} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md ${
                        errors.bloodType ? 'border-red-500' : 'border-gray-200'
                      }`}
                    >
                      <option value="">Chọn nhóm máu</option>
                      {bloodTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    {errors.bloodType && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <FaTimes className="mr-1" />
                        {errors.bloodType}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Số đơn vị máu cần <span className="text-red-500">*</span>
                    </label>
                    <input 
                      name="requiredUnits" 
                      type="number" 
                      min="1" 
                      max="50"
                      value={form.requiredUnits} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md ${
                        errors.requiredUnits ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Ví dụ: 2" 
                    />
                    {errors.requiredUnits && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <FaTimes className="mr-1" />
                        {errors.requiredUnits}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Hospital Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-blue-500 rounded-full p-2">
                    <FaMapMarkerAlt className="text-white text-sm" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Thông Tin Bệnh Viện</h3>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Bệnh viện <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="hospitalId" 
                    value={form.hospitalId} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md ${
                      errors.hospitalId ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Chọn bệnh viện</option>
                                          {hospitals.map(h => (
                        <option key={h.id || h.hospitalId} value={h.id || h.hospitalId}>
                          {h.name || h.hospitalName}
                        </option>
                      ))}
                    </select>
                    {errors.hospitalId && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <FaTimes className="mr-1" />
                        {errors.hospitalId}
                      </p>
                    )}
                </div>
              </div>

              {/* Medical Description Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-green-500 rounded-full p-2">
                    <FaUserMd className="text-white text-sm" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Mô Tả Tình Trạng</h3>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Mô tả tình trạng khẩn cấp <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    name="emergencyMedical" 
                    value={form.emergencyMedical} 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 resize-none shadow-sm hover:shadow-md ${
                      errors.emergencyMedical ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Mô tả chi tiết tình trạng bệnh nhân và lý do cần máu khẩn cấp..." 
                    rows={4} 
                  />
                  {errors.emergencyMedical && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <FaTimes className="mr-1" />
                      {errors.emergencyMedical}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-purple-500 rounded-full p-2">
                    <FaImage className="text-white text-sm" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Thông Tin Bổ Sung</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Ảnh minh họa (tùy chọn)
                    </label>
                    <ImageUpload
                      value={form.emergencyImage}
                      onImageChange={(url) => {
                        setForm(prev => ({ ...prev, emergencyImage: url }));
                        const fieldError = validateField('emergencyImage', url);
                        setErrors(prev => ({ ...prev, emergencyImage: fieldError }));
                      }}
                      mode="base64"
                    />
                    {errors.emergencyImage && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <FaTimes className="mr-1" />
                        {errors.emergencyImage}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Ngày kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input 
                      name="endDate" 
                      type="date" 
                      value={form.endDate} 
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 shadow-sm hover:shadow-md ${
                        errors.endDate ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errors.endDate && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <FaTimes className="mr-1" />
                        {errors.endDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Error & Success Messages */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-500 rounded-full p-2">
                      <FaTimes className="text-white text-sm" />
                    </div>
                    <div>
                      <h4 className="text-red-800 font-semibold">Có lỗi xảy ra</h4>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-500 rounded-full p-2">
                      <FaCheck className="text-white text-sm" />
                    </div>
                    <div>
                      <h4 className="text-green-800 font-semibold">Thành công!</h4>
                      <p className="text-green-700 text-sm">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-0"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Đang gửi đơn...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <FaExclamationTriangle className="text-lg" />
                      <span>Gửi đơn khẩn cấp</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            <FaInfoCircle className="inline mr-1" />
            Đơn khẩn cấp sẽ được xét duyệt trong vòng 24 giờ
          </p>
        </div>
      </div>
    </div>
  );
};

const EmergencyRequests = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [myEmergencies, setMyEmergencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myLoading, setMyLoading] = useState(false);
  const [error, setError] = useState('');
  const [myError, setMyError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('create'); // 'create', 'my-emergencies', 'all-emergencies'
  const [hospitals, setHospitals] = useState([]);
  const user = getUser();
  const isAdminOrStaff = user && (user.role === 'Admin' || user.role === 'Staff');

  useEffect(() => {
    fetchHospitals();
    if (isAdminOrStaff) {
      fetchEmergencies();
    } else {
      fetchMyEmergencies();
    }
    // eslint-disable-next-line
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Hospital/GetAll');
      if (!res.ok) throw new Error('Không thể tải danh sách bệnh viện');
      const data = await res.json();
      setHospitals(data);
    } catch (err) {
      console.error('Lỗi tải danh sách bệnh viện:', err);
      setHospitals([]);
    }
  };

  const getHospitalName = (hospitalId) => {
    const hospital = hospitals.find(h => h.id === hospitalId || h.hospitalId === hospitalId);
    return hospital ? (hospital.name || hospital.hospitalName) : `ID: ${hospitalId}`;
  };

  const fetchEmergencies = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Emergency/GetEmergencies', {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setEmergencies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyEmergencies = async () => {
    setMyLoading(true);
    setMyError('');
    try {
      const res = await fetch('https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Emergency/GetMyEmergencies', {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMyEmergencies(data);
    } catch (err) {
      setMyError(err.message);
    } finally {
      setMyLoading(false);
    }
  };

  const handleMarkAsFulfilled = async (emergencyId) => {
    try {
      const res = await fetch(`https://blooddonationsystemm-awg3bvdufaa6hudc.southeastasia-01.azurewebsites.net/api/Emergency/MarkAsFulfilled/${emergencyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      if (!res.ok) throw new Error(await res.text());
      
      // Refresh the list
      await fetchMyEmergencies();
      
      // Show success message
      setSuccess('Đã xác nhận nhận máu thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã duyệt':
      case 'Approved': 
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Từ chối':
      case 'Rejected': 
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Chờ xét duyệt':
      case 'Pending': 
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Đã duyệt':
      case 'Approved': 
        return <FaCheck className="text-green-600" />;
      case 'Từ chối':
      case 'Rejected': 
        return <FaTimes className="text-red-600" />;
      case 'Chờ xét duyệt':
      case 'Pending': 
        return <FaClock className="text-yellow-600" />;
      default:
        return <FaQuestion className="text-gray-600" />;
    }
  };

  return (
    <>
      {!isAdminOrStaff ? (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-8">
          <div className="max-w-6xl mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center shadow-lg">
                <FaTint className="text-white text-3xl" />
              </div>
              <h1 className="mt-4 text-3xl font-bold text-gray-900">Đơn Khẩn Cấp</h1>
              <p className="mt-2 text-gray-600">Tạo và quản lý yêu cầu hiến máu khẩn cấp</p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-lg p-1 shadow-lg">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'create'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  <FaPlus className="inline mr-2" />
                  Tạo đơn mới
                </button>
                <button
                  onClick={() => setActiveTab('my-emergencies')}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'my-emergencies'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  <FaUser className="inline mr-2" />
                  Đơn của tôi
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'create' && (
              <EmergencyRegisterForm 
                onEmergencyCreated={() => {
                  // Cập nhật danh sách đơn của tôi khi tạo đơn thành công
                  fetchMyEmergencies();
                  // Chuyển sang tab "Đơn của tôi" để người dùng thấy đơn vừa tạo
                  setActiveTab('my-emergencies');
                }} 
              />
            )}
            
            {activeTab === 'my-emergencies' && (
              <div className="space-y-6">
                {/* Success/Error Messages */}
                {success && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-500 rounded-full p-2">
                        <FaCheck className="text-white text-sm" />
                      </div>
                      <div>
                        <h4 className="text-green-800 font-semibold">Thành công!</h4>
                        <p className="text-green-700 text-sm">{success}</p>
                      </div>
                    </div>
                  </div>
                )}

                {myLoading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải danh sách đơn khẩn cấp...</p>
                  </div>
                ) : myError ? (
                  <div className="text-center">
                    <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
                      <FaTimes className="text-red-600 text-2xl" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">{myError}</h3>
                    <button 
                      onClick={fetchMyEmergencies}
                      className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : myEmergencies.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
                      <FaInbox className="text-gray-400 text-xl" />
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-gray-900">Chưa có đơn khẩn cấp nào</h3>
                    <p className="mt-1 text-sm text-gray-600">Bạn chưa tạo đơn khẩn cấp nào. Hãy tạo đơn đầu tiên!</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                      <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                        <FaUser className="text-white" />
                        <span>Đơn Khẩn Cấp Của Tôi</span>
                      </h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhóm máu</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số đơn vị</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bệnh viện</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {myEmergencies.map((emergency) => (
                            <tr key={emergency.emergencyId} className="hover:bg-gray-50 transition-colors duration-200">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{emergency.emergencyId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                  <span className="text-sm font-bold text-red-600">{emergency.bloodType}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className="font-semibold">{emergency.requiredUnits}</span> ml
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {getHospitalName(emergency.hospitalId)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(emergency.emergencyDate).toLocaleDateString('vi-VN')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(emergency.emergencyStatus)}`}>
                                  {getStatusIcon(emergency.emergencyStatus)}
                                  <span className="ml-1">{emergency.emergencyStatus}</span>
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  {emergency.emergencyStatus === 'Lượng máu đang được chuyển đến' && (
                                    <button 
                                      onClick={() => handleMarkAsFulfilled(emergency.emergencyId)}
                                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                                      title="Xác nhận đã nhận máu"
                                    >
                                      <FaCheck className="w-3 h-3 mr-1" />
                                      Đã nhận
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto mt-6 p-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quản Lý Đơn Khẩn Cấp</h2>
            <p className="text-gray-600 mt-1">Xem xét và duyệt các yêu cầu hiến máu khẩn cấp</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-3 text-gray-600">Đang tải danh sách đơn khẩn cấp...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <FaExclamationTriangle className="text-red-500 text-2xl mx-auto mb-2" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          ) : emergencies.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <FaInbox className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Chưa có đơn khẩn cấp nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {emergencies.map((emergency) => (
                <div key={emergency.emergencyId} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-red-50 to-red-100 px-4 py-3 border-b border-red-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="bg-red-500 rounded-full p-1.5">
                          <FaExclamationTriangle className="text-white text-xs" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">Đơn #{emergency.emergencyId}</h3>
                          <p className="text-xs text-gray-600">Tạo bởi: {emergency.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(emergency.emergencyStatus)}`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(emergency.emergencyStatus)}
                            <span>{emergency.emergencyStatus}</span>
                          </div>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Blood Info Row */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-red-50 rounded-md p-3 text-center">
                        <div className="text-lg font-bold text-red-600">{emergency.bloodType}</div>
                        <div className="text-xs text-gray-600">Nhóm máu</div>
                      </div>
                      <div className="bg-blue-50 rounded-md p-3 text-center">
                                          <div className="text-lg font-bold text-blue-600">{emergency.requiredUnits}</div>
                  <div className="text-xs text-gray-600">ml</div>
                      </div>
                      <div className="bg-green-50 rounded-md p-3 text-center">
                        <div className="text-sm font-bold text-green-600">{getHospitalName(emergency.hospitalId)}</div>
                        <div className="text-xs text-gray-600">Bệnh viện</div>
                      </div>
                    </div>

                    {/* Dates Row */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                        <FaCalendarAlt className="text-gray-500 text-xs" />
                        <div>
                          <div className="text-xs font-medium text-gray-700">Ngày tạo</div>
                          <div className="text-xs text-gray-900">{new Date(emergency.emergencyDate).toLocaleDateString('vi-VN')}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                        <FaCalendarCheck className="text-gray-500 text-xs" />
                        <div>
                          <div className="text-xs font-medium text-gray-700">Kết thúc</div>
                          <div className="text-xs text-gray-900">{new Date(emergency.endDate).toLocaleDateString('vi-VN')}</div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <FaStickyNote className="text-gray-500 text-xs" />
                        <h4 className="text-sm font-semibold text-gray-900">Ghi chú</h4>
                      </div>
                      <div className="bg-gray-50 rounded-md p-3">
                        <p className="text-sm text-gray-700">{emergency.emergencyNote}</p>
                      </div>
                    </div>

                    {/* Medical Info */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <FaUserMd className="text-gray-500 text-xs" />
                        <h4 className="text-sm font-semibold text-gray-900">Thông tin y tế</h4>
                      </div>
                      <div className="bg-gray-50 rounded-md p-3">
                        <p className="text-sm text-gray-700">{emergency.emergencyMedical}</p>
                      </div>
                    </div>

                    {/* Image if exists */}
                    {emergency.emergencyImage && (
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <FaImage className="text-gray-500 text-xs" />
                          <h4 className="text-sm font-semibold text-gray-900">Ảnh minh họa</h4>
                        </div>
                        <img 
                          src={emergency.emergencyImage} 
                          alt="Emergency" 
                          className="rounded-md max-w-full h-auto max-h-32 object-cover"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    {emergency.emergencyStatus === 'Chờ xét duyệt' && (
                      <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                        <button className="px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center space-x-1">
                          <FaCheck className="text-xs" />
                          <span>Duyệt</span>
                        </button>
                        <button className="px-4 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium flex items-center space-x-1">
                          <FaTimes className="text-xs" />
                          <span>Từ chối</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default EmergencyRequests; 