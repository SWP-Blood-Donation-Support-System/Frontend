import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaHeartbeat, FaKey, FaArrowLeft } from 'react-icons/fa';
import { requestPasswordReset, resetPassword } from '../utils/api';
import Toast from '../components/Toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: nhập username/email, 2: nhập OTP và mật khẩu mới
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail.trim()) {
      setError('Vui lòng nhập username hoặc email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await requestPasswordReset(usernameOrEmail);
      setStep(2);
      console.log('OTP sent successfully');
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi gửi OTP. Vui lòng thử lại.');
      console.error('Request OTP error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError('Vui lòng nhập đủ 6 số OTP');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await resetPassword(otp, newPassword, confirmPassword);
      setShowSuccess(true);
      
      // Chuyển hướng sau khi hiển thị thông báo thành công
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.');
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (e) => {
    const value = e.target.value;
    // Chỉ cho phép nhập số và tối đa 6 ký tự
    if (/^\d{0,6}$/.test(value)) {
      setOtp(value);
      setError('');
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError('');

    try {
      await requestPasswordReset(usernameOrEmail);
      setOtp('');
      console.log('OTP resent successfully');
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi gửi lại OTP. Vui lòng thử lại.');
      console.error('Resend OTP error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setStep(1);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {showSuccess && (
        <Toast
          message="Đặt lại mật khẩu thành công! Đang chuyển hướng đến trang đăng nhập..."
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
          {step === 1 ? 'Quên mật khẩu' : 'Đặt lại mật khẩu'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 1 ? 'Nhập username hoặc email để nhận OTP' : 'Nhập OTP và mật khẩu mới'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-slide-up">
        <div className="bg-white/80 backdrop-blur-md py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 hover:scale-105 transition-transform duration-200">
          {step === 1 ? (
            // Step 1: Nhập username/email
            <form className="space-y-6" onSubmit={handleRequestOTP}>
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
                <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700">
                  Username hoặc Email <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="usernameOrEmail"
                    name="usernameOrEmail"
                    type="text"
                    required
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 pr-3 py-3 sm:text-sm border-gray-300 rounded-md transition-colors duration-200"
                    placeholder="Nhập username hoặc email"
                  />
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
                    'Gửi OTP'
                  )}
                </button>
              </div>

              <div className="text-center">
                <Link to="/login" className="text-sm text-red-600 hover:text-red-500 transition-colors duration-200">
                  <FaArrowLeft className="inline mr-1" />
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          ) : (
            // Step 2: Nhập OTP và mật khẩu mới
            <form className="space-y-6" onSubmit={handleResetPassword}>
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

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaKey className="text-white text-2xl" />
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Chúng tôi đã gửi mã OTP 6 số đến email của bạn
                </p>
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Mã OTP <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaKey className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={handleOTPChange}
                    className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 pr-3 py-3 sm:text-sm border-gray-300 rounded-md transition-colors duration-200 text-center text-lg tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                  Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
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
                  disabled={isLoading || otp.length !== 6 || newPassword.length < 6 || newPassword !== confirmPassword}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang đặt lại mật khẩu...
                    </>
                  ) : (
                    'Đặt lại mật khẩu'
                  )}
                </button>
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={goBack}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  <FaArrowLeft className="inline mr-1" />
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-sm text-red-600 hover:text-red-500 transition-colors duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Đang gửi lại...' : 'Gửi lại OTP'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 