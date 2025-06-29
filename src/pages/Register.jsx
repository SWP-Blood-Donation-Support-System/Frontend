import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone, FaHeartbeat, FaCalendar, FaMapMarkerAlt, FaTint, FaKey } from 'react-icons/fa';
import { sendRegistrationOTP, verifyRegistrationOTP } from '../utils/api';
import Toast from '../components/Toast';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: '',
    bloodTypeId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // OTP states
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Blood type options
  const bloodTypes = [
    { id: '', name: 'Chọn nhóm máu (tùy chọn)' },
    { id: 'A+', name: 'A+' },
    { id: 'A-', name: 'A-' },
    { id: 'B+', name: 'B+' },
    { id: 'B-', name: 'B-' },
    { id: 'AB+', name: 'AB+' },
    { id: 'AB-', name: 'AB-' },
    { id: 'O+', name: 'O+' },
    { id: 'O-', name: 'O-' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);

    try {
      // Gửi OTP thay vì đăng ký trực tiếp
      await sendRegistrationOTP(formData);
      
      console.log('OTP sent successfully');
      setShowOTPModal(true);
      setError('');
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi gửi OTP. Vui lòng thử lại.');
      console.error('Send OTP error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (e) => {
    const value = e.target.value;
    // Chỉ cho phép nhập số và tối đa 6 ký tự
    if (/^\d{0,6}$/.test(value)) {
      setOtp(value);
      setOtpError('');
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setOtpError('Vui lòng nhập đủ 6 số OTP');
      return;
    }

    setIsVerifyingOTP(true);
    setOtpError('');

    try {
      const data = await verifyRegistrationOTP(otp);
      
      console.log('Registration successful:', data);
      setShowSuccess(true);
      setShowOTPModal(false);
      
      // Chuyển hướng sau khi hiển thị thông báo thành công
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setOtpError(err.message || 'Có lỗi xảy ra khi xác thực OTP. Vui lòng thử lại.');
      console.error('Verify OTP error:', err);
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setOtpError('');

    try {
      await sendRegistrationOTP(formData);
      setOtp('');
      console.log('OTP resent successfully');
    } catch (err) {
      setOtpError(err.message || 'Có lỗi xảy ra khi gửi lại OTP. Vui lòng thử lại.');
      console.error('Resend OTP error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const closeOTPModal = () => {
    setShowOTPModal(false);
    setOtp('');
    setOtpError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {showSuccess && (
        <Toast
          message="Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập..."
          type="success"
          onClose={() => setShowSuccess(false)}
        />
      )}
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-red-400 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
            <FaHeartbeat className="text-white text-3xl" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Tạo tài khoản mới
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Hoặc{' '}
          <Link to="/login" className="font-medium text-red-600 hover:text-red-500 transition-colors duration-200">
            đăng nhập nếu đã có tài khoản
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-slide-up">
        <div className="bg-white/80 backdrop-blur-md py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 hover:scale-105 transition-transform duration-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md animate-shake">
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

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 pr-3 py-3 sm:text-sm border-gray-300 rounded-md transition-colors duration-200"
                  placeholder="Nhập username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 pr-3 py-3 sm:text-sm border-gray-300 rounded-md transition-colors duration-200"
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 pr-3 py-3 sm:text-sm border-gray-300 rounded-md transition-colors duration-200"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                  Ngày sinh <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 pr-3 py-3 sm:text-sm border-gray-300 rounded-md transition-colors duration-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <select
                    id="gender"
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                    className="focus:ring-red-500 focus:border-red-500 block w-full py-3 px-3 sm:text-sm border-gray-300 rounded-md transition-colors duration-200"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 pr-3 py-3 sm:text-sm border-gray-300 rounded-md transition-colors duration-200"
                  placeholder="0123456789"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 pr-3 py-3 sm:text-sm border-gray-300 rounded-md transition-colors duration-200"
                  placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bloodTypeId" className="block text-sm font-medium text-gray-700">
                Nhóm máu
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaTint className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="bloodTypeId"
                  name="bloodTypeId"
                  value={formData.bloodTypeId}
                  onChange={handleChange}
                  className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 pr-3 py-3 sm:text-sm border-gray-300 rounded-md transition-colors duration-200"
                >
                  {bloodTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 pr-10 py-3 sm:text-sm border-gray-300 rounded-md transition-colors duration-200"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 pr-10 py-3 sm:text-sm border-gray-300 rounded-md transition-colors duration-200"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi OTP...
                  </>
                ) : (
                  'Gửi OTP đăng ký'
                )}
              </button>
            </div>

            {/* OTP Modal */}
            {showOTPModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 animate-fade-in">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaKey className="text-white text-2xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Xác thực OTP
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Chúng tôi đã gửi mã OTP 6 số đến email <strong>{formData.email}</strong>
                    </p>
                  </div>

                  {otpError && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{otpError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                      Nhập mã OTP
                    </label>
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={handleOTPChange}
                      className="focus:ring-red-500 focus:border-red-500 block w-full px-3 py-3 sm:text-sm border-gray-300 rounded-md transition-colors duration-200 text-center text-lg tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                      autoFocus
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleVerifyOTP}
                      disabled={isVerifyingOTP || otp.length !== 6}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 text-white font-medium py-3 px-4 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isVerifyingOTP ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang xác thực...
                        </>
                      ) : (
                        'Xác thực'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={closeOTPModal}
                      className="px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors duration-200"
                    >
                      Hủy
                    </button>
                  </div>

                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="text-sm text-red-600 hover:text-red-500 transition-colors duration-200 disabled:opacity-50"
                    >
                      {isLoading ? 'Đang gửi lại...' : 'Gửi lại OTP'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register; 